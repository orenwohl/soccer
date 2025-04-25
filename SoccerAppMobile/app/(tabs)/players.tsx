import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, FlatList, ActivityIndicator} from 'react-native';
import {useRouter} from 'expo-router';
import {getPlayers} from '../../services/api';
import * as Animatable from 'react-native-animatable';
import {LinearGradient} from 'react-native-linear-gradient';
import {Feather} from '@expo/vector-icons';

import AnimatedBackground from '../../components/AnimatedBackground';
import AnimatedCard from '../../components/AnimatedCard';
import FuturisticButton from '../../components/FuturisticButton';

interface Player {
	id: string;
	name: string;
	rating: number;
}

export default function PlayersScreen() {
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();

	useEffect(() => {
		loadPlayers();
	}, []);

	const loadPlayers = async () => {
		try {
			setLoading(true);
			const data = await getPlayers();
			setPlayers(data);
			setError('');
		} catch (err) {
			console.error('Error loading players:', err);
			setError('שגיאה בטעינת רשימת שחקנים');
		} finally {
			setLoading(false);
		}
	};

	const renderPlayerItem = ({item, index}: {item: Player; index: number}) => {
		const ratingColor =
			item.rating >= 85
				? ['#FF6B6B', '#FF8E53']
				: item.rating >= 70
				? ['#4FACFE', '#00F2FE']
				: ['#43E97B', '#38F9D7'];

		return (
			<Animatable.View
				animation='fadeIn'
				duration={600}
				delay={index * 150}
				style={styles.playerCardContainer}>
				<AnimatedCard
					gradientColors={ratingColor}
					onPress={() =>
						router.push({
							pathname: '/players/[id]',
							params: {id: item.id},
						})
					}>
					<View style={styles.playerInfo}>
						<Text style={styles.playerName}>{item.name}</Text>
						<View style={styles.ratingContainer}>
							<Text style={styles.ratingText}>{item.rating}</Text>
						</View>
					</View>
				</AnimatedCard>
			</Animatable.View>
		);
	};

	if (loading) {
		return (
			<AnimatedBackground colors={['#1a2151', '#0f5132']}>
				<View style={styles.centered}>
					<ActivityIndicator
						size='large'
						color='#fff'
					/>
				</View>
			</AnimatedBackground>
		);
	}

	if (error) {
		return (
			<AnimatedBackground colors={['#1a2151', '#0f5132']}>
				<View style={styles.centered}>
					<Text style={styles.errorText}>{error}</Text>
					<FuturisticButton
						title='נסה שנית'
						onPress={loadPlayers}
						startIcon={
							<Feather
								name='refresh-cw'
								size={18}
								color='#fff'
							/>
						}
					/>
				</View>
			</AnimatedBackground>
		);
	}

	return (
		<AnimatedBackground colors={['#1a2151', '#0f5132']}>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.title}>רשימת שחקנים</Text>
					<FuturisticButton
						title='+ שחקן חדש'
						onPress={() => router.push('/players/new')}
						colors={['#43A047', '#1B5E20']}
						startIcon={
							<Feather
								name='user-plus'
								size={18}
								color='#fff'
							/>
						}
					/>
				</View>

				{players.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Animatable.Text
							animation='fadeIn'
							style={styles.emptyText}>
							לא נמצאו שחקנים
						</Animatable.Text>
					</View>
				) : (
					<FlatList
						data={players}
						renderItem={renderPlayerItem}
						keyExtractor={(item) => item.id}
						contentContainerStyle={styles.listContainer}
						refreshing={loading}
						onRefresh={loadPlayers}
					/>
				)}
			</View>
		</AnimatedBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#fff',
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 3,
	},
	listContainer: {
		padding: 16,
	},
	playerCardContainer: {
		marginBottom: 12,
	},
	playerInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 4,
	},
	playerName: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff',
		textShadowColor: 'rgba(0, 0, 0, 0.2)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 1,
	},
	ratingContainer: {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: 'rgba(255, 255, 255, 0.5)',
	},
	ratingText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	errorText: {
		color: '#fff',
		fontSize: 16,
		marginBottom: 20,
		textAlign: 'center',
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 2,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 18,
		color: '#fff',
		opacity: 0.8,
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 2,
	},
});
