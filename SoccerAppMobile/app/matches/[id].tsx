import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, ActivityIndicator, ScrollView, TouchableOpacity} from 'react-native';
import {useLocalSearchParams, Stack, useRouter} from 'expo-router';
import {getMatch} from '../../services/api';

interface Team {
	name: string;
	score: number;
	players?: Array<{
		id: string;
		name: string;
		goals?: number;
	}>;
}

interface Match {
	id: string;
	date: string;
	location: string;
	teams: {
		team1: Team;
		team2: Team;
	};
}

export default function MatchDetailsScreen() {
	const {id} = useLocalSearchParams<{id: string}>();
	const [match, setMatch] = useState<Match | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();

	useEffect(() => {
		loadMatch();
	}, [id]);

	const loadMatch = async () => {
		try {
			setLoading(true);
			const data = await getMatch(id);
			setMatch(data);
			setError('');
		} catch (err) {
			setError('שגיאה בטעינת פרטי המשחק');
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
					onPress={loadMatch}>
					<Text style={styles.buttonText}>נסה שנית</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (!match) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>לא נמצא משחק</Text>
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
			<Stack.Screen options={{title: `משחק ${match.date}`}} />

			<View style={styles.header}>
				<Text style={styles.date}>{match.date}</Text>
				<Text style={styles.location}>{match.location}</Text>
			</View>

			<View style={styles.scoreCard}>
				<View style={styles.teamColumn}>
					<Text style={styles.teamName}>{match.teams.team1.name}</Text>
					<View style={[styles.scoreCircle, styles.team1Color]}>
						<Text style={styles.scoreText}>{match.teams.team1.score}</Text>
					</View>
				</View>

				<View style={styles.versusContainer}>
					<Text style={styles.versusText}>VS</Text>
				</View>

				<View style={styles.teamColumn}>
					<Text style={styles.teamName}>{match.teams.team2.name}</Text>
					<View style={[styles.scoreCircle, styles.team2Color]}>
						<Text style={styles.scoreText}>{match.teams.team2.score}</Text>
					</View>
				</View>
			</View>

			<View style={styles.playersSection}>
				<Text style={styles.sectionTitle}>שחקנים</Text>

				<View style={styles.teamsGrid}>
					<View style={styles.teamList}>
						<Text style={[styles.teamLabel, styles.team1Label]}>{match.teams.team1.name}</Text>
						{match.teams.team1.players?.map((player) => (
							<View
								key={player.id}
								style={styles.playerItem}>
								<Text style={styles.playerName}>{player.name}</Text>
								{player.goals && player.goals > 0 ? (
									<Text style={styles.goalsTag}>{player.goals} ⚽</Text>
								) : null}
							</View>
						)) || <Text style={styles.emptyText}>לא נוספו שחקנים</Text>}
					</View>

					<View style={styles.teamList}>
						<Text style={[styles.teamLabel, styles.team2Label]}>{match.teams.team2.name}</Text>
						{match.teams.team2.players?.map((player) => (
							<View
								key={player.id}
								style={styles.playerItem}>
								<Text style={styles.playerName}>{player.name}</Text>
								{player.goals && player.goals > 0 ? (
									<Text style={styles.goalsTag}>{player.goals} ⚽</Text>
								) : null}
							</View>
						)) || <Text style={styles.emptyText}>לא נוספו שחקנים</Text>}
					</View>
				</View>
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
		paddingVertical: 20,
	},
	date: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333',
	},
	location: {
		fontSize: 16,
		color: '#666',
		marginTop: 4,
	},
	scoreCard: {
		flexDirection: 'row',
		backgroundColor: '#fff',
		marginHorizontal: 16,
		padding: 16,
		borderRadius: 10,
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	teamColumn: {
		flex: 2,
		alignItems: 'center',
	},
	teamName: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10,
		textAlign: 'center',
	},
	versusContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	versusText: {
		fontSize: 18,
		color: '#999',
		fontWeight: 'bold',
	},
	scoreCircle: {
		width: 60,
		height: 60,
		borderRadius: 30,
		alignItems: 'center',
		justifyContent: 'center',
	},
	team1Color: {
		backgroundColor: '#1976d2',
	},
	team2Color: {
		backgroundColor: '#d32f2f',
	},
	scoreText: {
		color: '#fff',
		fontSize: 24,
		fontWeight: 'bold',
	},
	playersSection: {
		marginTop: 24,
		paddingHorizontal: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 16,
		color: '#333',
	},
	teamsGrid: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	teamList: {
		backgroundColor: '#fff',
		width: '48%',
		borderRadius: 8,
		padding: 12,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 1},
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	teamLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 12,
		textAlign: 'center',
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	team1Label: {
		color: '#1976d2',
	},
	team2Label: {
		color: '#d32f2f',
	},
	playerItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	playerName: {
		fontSize: 14,
	},
	goalsTag: {
		backgroundColor: '#2e7d32',
		color: '#fff',
		fontWeight: 'bold',
		paddingVertical: 2,
		paddingHorizontal: 6,
		borderRadius: 10,
		fontSize: 12,
	},
	emptyText: {
		color: '#999',
		textAlign: 'center',
		paddingVertical: 10,
	},
	button: {
		backgroundColor: '#2e7d32',
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		minWidth: 120,
		alignItems: 'center',
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
