import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity} from 'react-native';
import {getLeagueTable} from '../../services/api';

interface TablePlayer {
	id: string;
	rank: number;
	name: string;
	played: number;
	won: number;
	drawn: number;
	lost: number;
	points: number;
}

export default function TableScreen() {
	const [tableData, setTableData] = useState<TablePlayer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		loadTableData();
	}, []);

	const loadTableData = async () => {
		try {
			setLoading(true);
			const data = await getLeagueTable();
			setTableData(data);
			setError('');
		} catch (err) {
			console.error('Error loading league table:', err);
			setError('שגיאה בטעינת טבלת הליגה');
		} finally {
			setLoading(false);
		}
	};

	const renderTableHeader = () => {
		return (
			<View style={styles.tableHeader}>
				<Text style={[styles.headerCell, styles.rankCell]}>#</Text>
				<Text style={[styles.headerCell, styles.nameCell]}>שחקן</Text>
				<Text style={[styles.headerCell, styles.statCell]}>מש'</Text>
				<Text style={[styles.headerCell, styles.statCell]}>נצ'</Text>
				<Text style={[styles.headerCell, styles.statCell]}>תק'</Text>
				<Text style={[styles.headerCell, styles.statCell]}>הפ'</Text>
				<Text style={[styles.headerCell, styles.pointsCell]}>נק'</Text>
			</View>
		);
	};

	const renderPlayerRow = ({item}: {item: TablePlayer}) => {
		return (
			<View style={styles.tableRow}>
				<Text style={[styles.cell, styles.rankCell]}>{item.rank}</Text>
				<Text style={[styles.cell, styles.nameCell]}>{item.name}</Text>
				<Text style={[styles.cell, styles.statCell]}>{item.played}</Text>
				<Text style={[styles.cell, styles.statCell]}>{item.won}</Text>
				<Text style={[styles.cell, styles.statCell]}>{item.drawn}</Text>
				<Text style={[styles.cell, styles.statCell]}>{item.lost}</Text>
				<Text style={[styles.cell, styles.pointsCell, styles.pointsValue]}>{item.points}</Text>
			</View>
		);
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator
					size='large'
					color='#2e7d32'
				/>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>{error}</Text>
				<TouchableOpacity
					style={styles.retryButton}
					onPress={loadTableData}>
					<Text style={styles.buttonText}>נסה שנית</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>טבלת הליגה</Text>
			</View>

			{tableData.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>טבלה ריקה</Text>
				</View>
			) : (
				<View style={styles.tableContainer}>
					{renderTableHeader()}
					<FlatList
						data={tableData}
						renderItem={renderPlayerRow}
						keyExtractor={(item) => item.id}
						scrollEnabled={true}
						refreshing={loading}
						onRefresh={loadTableData}
					/>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	header: {
		padding: 16,
		alignItems: 'center',
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#333',
	},
	tableContainer: {
		marginHorizontal: 16,
		borderRadius: 8,
		backgroundColor: '#fff',
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 1},
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	tableHeader: {
		flexDirection: 'row',
		backgroundColor: '#2e7d32',
		paddingVertical: 12,
		paddingHorizontal: 6,
	},
	headerCell: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 14,
		textAlign: 'center',
	},
	tableRow: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		paddingVertical: 12,
		paddingHorizontal: 6,
	},
	cell: {
		fontSize: 14,
		textAlign: 'center',
	},
	rankCell: {
		width: '8%',
	},
	nameCell: {
		width: '40%',
		textAlign: 'right',
		paddingRight: 10,
	},
	statCell: {
		width: '10%',
	},
	pointsCell: {
		width: '12%',
	},
	pointsValue: {
		fontWeight: 'bold',
		color: '#2e7d32',
	},
	errorText: {
		color: '#d32f2f',
		fontSize: 16,
		marginBottom: 20,
		textAlign: 'center',
	},
	retryButton: {
		backgroundColor: '#2e7d32',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 16,
		color: '#666',
	},
});
