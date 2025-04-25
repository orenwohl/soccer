import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, ScrollView} from 'react-native';
import {useLocalSearchParams, Stack, useRouter} from 'expo-router';
import {getPlayer} from '../../services/api';

interface Player {
	id: string;
	name: string;
	rating: number;
	position?: string;
	gamesPlayed?: number;
	winRate?: number;
	goalsScored?: number;
}

export default function PlayerDetailsScreen() {
	const {id} = useLocalSearchParams<{id: string}>();
	const [player, setPlayer] = useState<Player | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();

	useEffect(() => {
		loadPlayer();
	}, [id]);

	const loadPlayer = async () => {
		try {
			setLoading(true);
			const data = await getPlayer(id);
			setPlayer(data);
			setError('');
		} catch (err) {
			setError('שגיאה בטעינת נתוני השחקן');
			console.error(err);
		} finally {
			setLoading(false);
		}
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
					style={styles.button}
					onPress={loadPlayer}>
					<Text style={styles.buttonText}>נסה שנית</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (!player) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>לא נמצא שחקן</Text>
				<TouchableOpacity
					style={styles.button}
					onPress={() => router.back()}>
					<Text style={styles.buttonText}>חזור</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<Stack.Screen options={{title: player.name}} />

			<View style={styles.header}>
				<View style={styles.playerCard}>
					<Text style={styles.playerName}>{player.name}</Text>
					<View style={styles.ratingBox}>
						<Text style={styles.ratingText}>{player.rating}</Text>
					</View>
				</View>
			</View>

			<View style={styles.statsContainer}>
				<Text style={styles.sectionTitle}>סטטיסטיקות</Text>

				<View style={styles.statsGrid}>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{player.gamesPlayed || 0}</Text>
						<Text style={styles.statLabel}>משחקים</Text>
					</View>

					<View style={styles.statItem}>
						<Text style={styles.statValue}>{player.winRate || 0}%</Text>
						<Text style={styles.statLabel}>אחוז ניצחונות</Text>
					</View>

					<View style={styles.statItem}>
						<Text style={styles.statValue}>{player.goalsScored || 0}</Text>
						<Text style={styles.statLabel}>שערים</Text>
					</View>

					<View style={styles.statItem}>
						<Text style={styles.statValue}>{player.position || 'לא צוין'}</Text>
						<Text style={styles.statLabel}>עמדה</Text>
					</View>
				</View>
			</View>

			<View style={styles.actionsContainer}>
				<TouchableOpacity
					style={[styles.button, styles.editButton]}
					onPress={() => router.push(`/players/edit/${id}`)}>
					<Text style={styles.buttonText}>עריכת שחקן</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
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
		alignItems: 'center',
		padding: 20,
	},
	playerCard: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 20,
		width: '90%',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	playerName: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
		textAlign: 'center',
	},
	ratingBox: {
		backgroundColor: '#2e7d32',
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 5,
	},
	ratingText: {
		color: '#fff',
		fontSize: 24,
		fontWeight: 'bold',
	},
	statsContainer: {
		padding: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
		color: '#333',
	},
	statsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	statItem: {
		width: '48%',
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 8,
		marginBottom: 10,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 1},
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	statValue: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#2e7d32',
	},
	statLabel: {
		fontSize: 14,
		color: '#666',
		marginTop: 5,
	},
	actionsContainer: {
		padding: 20,
		alignItems: 'center',
	},
	button: {
		backgroundColor: '#2e7d32',
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		minWidth: 120,
		alignItems: 'center',
	},
	editButton: {
		backgroundColor: '#1976d2',
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	errorText: {
		color: '#d32f2f',
		fontSize: 16,
		marginBottom: 20,
		textAlign: 'center',
	},
});
