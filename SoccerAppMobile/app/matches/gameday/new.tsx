import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Switch} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {createMatch, getPlayers} from '../../../services/api';

interface Player {
	id: string;
	name: string;
	rating: number;
}

export default function NewGameDayScreen() {
	const [location, setLocation] = useState('');
	const [date, setDate] = useState(new Date().toLocaleDateString('he-IL'));
	const [allPlayers, setAllPlayers] = useState<Player[]>([]);
	const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [playersLoading, setPlayersLoading] = useState(true);
	const [error, setError] = useState('');
	const [autoBalance, setAutoBalance] = useState(true);
	const router = useRouter();

	useEffect(() => {
		loadPlayers();
	}, []);

	const loadPlayers = async () => {
		try {
			setPlayersLoading(true);
			const data = await getPlayers();
			setAllPlayers(data);
		} catch (err) {
			console.error('Error loading players:', err);
			setError('שגיאה בטעינת רשימת שחקנים');
		} finally {
			setPlayersLoading(false);
		}
	};

	const togglePlayerSelection = (playerId: string) => {
		if (selectedPlayers.includes(playerId)) {
			setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
		} else {
			setSelectedPlayers([...selectedPlayers, playerId]);
		}
	};

	const handleSubmit = async () => {
		if (!location.trim()) {
			setError('אנא הזן מיקום למשחק');
			return;
		}

		if (selectedPlayers.length < 4) {
			setError('יש לבחור לפחות 4 שחקנים למשחק');
			return;
		}

		try {
			setLoading(true);
			setError('');

			const matchData = {
				date,
				location: location.trim(),
				players: selectedPlayers,
				autoBalance,
			};

			await createMatch(matchData);
			router.replace('/matches');
		} catch (err) {
			console.error('Error creating match:', err);
			setError('שגיאה ביצירת משחק חדש');
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView style={styles.container}>
			<Stack.Screen options={{title: 'יצירת משחק חדש'}} />

			<View style={styles.form}>
				<Text style={styles.label}>תאריך</Text>
				<TextInput
					style={styles.input}
					value={date}
					onChangeText={setDate}
					placeholder='הכנס תאריך (DD/MM/YYYY)'
					placeholderTextColor='#aaa'
				/>

				<Text style={styles.label}>מיקום</Text>
				<TextInput
					style={styles.input}
					value={location}
					onChangeText={setLocation}
					placeholder='הכנס מיקום משחק'
					placeholderTextColor='#aaa'
				/>

				<View style={styles.switchContainer}>
					<Text style={styles.label}>איזון אוטומטי של הקבוצות</Text>
					<Switch
						value={autoBalance}
						onValueChange={setAutoBalance}
						trackColor={{false: '#767577', true: '#81b0ff'}}
						thumbColor={autoBalance ? '#2e7d32' : '#f4f3f4'}
					/>
				</View>

				<Text style={styles.sectionTitle}>בחירת שחקנים</Text>
				<Text style={styles.subText}>
					בחרת {selectedPlayers.length} שחקנים {selectedPlayers.length % 2 !== 0 && '(מספר אי-זוגי)'}
				</Text>

				{playersLoading ? (
					<ActivityIndicator
						size='large'
						color='#2e7d32'
						style={styles.loader}
					/>
				) : (
					<View style={styles.playersList}>
						{allPlayers.map((player) => (
							<TouchableOpacity
								key={player.id}
								style={[
									styles.playerItem,
									selectedPlayers.includes(player.id) && styles.selectedPlayer,
								]}
								onPress={() => togglePlayerSelection(player.id)}>
								<Text style={styles.playerName}>{player.name}</Text>
								<View style={styles.ratingCircle}>
									<Text style={styles.ratingText}>{player.rating}</Text>
								</View>
							</TouchableOpacity>
						))}
					</View>
				)}

				{error ? <Text style={styles.errorText}>{error}</Text> : null}

				<View style={styles.buttonsContainer}>
					<TouchableOpacity
						style={[styles.button, styles.cancelButton]}
						onPress={() => router.back()}
						disabled={loading}>
						<Text style={styles.buttonText}>ביטול</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
						onPress={handleSubmit}
						disabled={loading}>
						{loading ? (
							<ActivityIndicator
								size='small'
								color='#fff'
							/>
						) : (
							<Text style={styles.buttonText}>יצירת משחק</Text>
						)}
					</TouchableOpacity>
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
	form: {
		padding: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 8,
		color: '#333',
	},
	input: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 20,
	},
	switchContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 10,
		marginBottom: 8,
		color: '#333',
	},
	subText: {
		color: '#666',
		marginBottom: 12,
	},
	playersList: {
		marginTop: 10,
	},
	playerItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#fff',
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	selectedPlayer: {
		borderColor: '#2e7d32',
		borderWidth: 2,
		backgroundColor: '#f0f9f0',
	},
	playerName: {
		fontSize: 16,
	},
	ratingCircle: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#2e7d32',
		justifyContent: 'center',
		alignItems: 'center',
	},
	ratingText: {
		color: '#fff',
		fontWeight: 'bold',
	},
	errorText: {
		color: '#d32f2f',
		marginVertical: 20,
		textAlign: 'center',
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20,
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		minWidth: 120,
		alignItems: 'center',
		justifyContent: 'center',
	},
	saveButton: {
		backgroundColor: '#2e7d32',
	},
	cancelButton: {
		backgroundColor: '#757575',
	},
	disabledButton: {
		opacity: 0.7,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	loader: {
		marginVertical: 20,
	},
});
