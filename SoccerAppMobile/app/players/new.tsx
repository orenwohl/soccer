import React, {useState} from 'react';
import {StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {createPlayer} from '../../services/api';

export default function NewPlayerScreen() {
	const [name, setName] = useState('');
	const [rating, setRating] = useState('');
	const [position, setPosition] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	const handleSubmit = async () => {
		if (!name.trim()) {
			setError('אנא הזן שם שחקן');
			return;
		}

		if (!rating.trim() || isNaN(Number(rating))) {
			setError('אנא הזן דירוג תקין');
			return;
		}

		try {
			setLoading(true);
			setError('');

			await createPlayer({
				name: name.trim(),
				rating: Number(rating),
				position: position.trim() || undefined,
			});

			// Go back to players list
			router.replace('/players');
		} catch (err) {
			console.error('Error creating player:', err);
			setError('שגיאה ביצירת שחקן חדש');
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView style={styles.container}>
			<Stack.Screen options={{title: 'הוספת שחקן חדש'}} />

			<View style={styles.form}>
				<Text style={styles.label}>שם השחקן</Text>
				<TextInput
					style={styles.input}
					value={name}
					onChangeText={setName}
					placeholder='הכנס שם שחקן'
					placeholderTextColor='#aaa'
				/>

				<Text style={styles.label}>דירוג (1-100)</Text>
				<TextInput
					style={styles.input}
					value={rating}
					onChangeText={setRating}
					placeholder='הכנס דירוג'
					placeholderTextColor='#aaa'
					keyboardType='numeric'
					maxLength={3}
				/>

				<Text style={styles.label}>עמדה (אופציונלי)</Text>
				<TextInput
					style={styles.input}
					value={position}
					onChangeText={setPosition}
					placeholder='הכנס עמדה'
					placeholderTextColor='#aaa'
				/>

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
							<Text style={styles.buttonText}>שמירה</Text>
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
	errorText: {
		color: '#d32f2f',
		marginBottom: 20,
		textAlign: 'center',
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
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
});
