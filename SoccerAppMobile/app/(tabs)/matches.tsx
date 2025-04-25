import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, FlatList, ActivityIndicator} from 'react-native';
import {useRouter} from 'expo-router';
import {getMatches} from '../../services/api';
import * as Animatable from 'react-native-animatable';
import {Feather} from '@expo/vector-icons';
import {format} from 'date-fns';
// Replace the Hebrew locale with English since Hebrew isn't available
// import {he} from 'date-fns/locale';

import AnimatedBackground from '../../components/AnimatedBackground';
import AnimatedCard from '../../components/AnimatedCard';
import FuturisticButton from '../../components/FuturisticButton';

interface Match {
	id: string;
	date: string;
	location: string;
	players: string[];
}

export default function MatchesScreen() {
	const [matches, setMatches] = useState<Match[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();

	useEffect(() => {
		loadMatches();
	}, []);

	const loadMatches = async () => {
		try {
			setLoading(true);
			const data = await getMatches();
			setMatches(data);
			setError('');
		} catch (err) {
			console.error('Error loading matches:', err);
			setError('שגיאה בטעינת רשימת משחקים');
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			// Use English locale instead of Hebrew
			return format(date, 'EEEE, d MMMM yyyy');
		} catch (error) {
			console.error('Error formatting date:', error);
			return dateString;
		}
	};

	const renderMatchItem = ({item, index}: {item: Match; index: number}) => {
		const dateObj = new Date(item.date);
		const isUpcoming = dateObj > new Date();
		const colors = isUpcoming ? ['#3949AB', '#1A237E'] : ['#5E35B1', '#311B92'];

		return (
			<Animatable.View
				animation='fadeIn'
				duration={600}
				delay={index * 150}
				style={styles.matchCardContainer}>
				<AnimatedCard
					gradientColors={colors}
					onPress={() =>
						router.push({
							pathname: '/matches/[id]',
							params: {id: item.id},
						})
					}
					title={isUpcoming ? 'משחק מתוכנן' : 'משחק שהסתיים'}>
					<View style={styles.matchInfo}>
						<View style={styles.matchDetail}>
							<Feather
								name='calendar'
								size={16}
								color='#fff'
								style={styles.icon}
							/>
							<Text style={styles.matchText}>{formatDate(item.date)}</Text>
						</View>

						<View style={styles.matchDetail}>
							<Feather
								name='map-pin'
								size={16}
								color='#fff'
								style={styles.icon}
							/>
							<Text style={styles.matchText}>{item.location}</Text>
						</View>

						<View style={styles.matchDetail}>
							<Feather
								name='users'
								size={16}
								color='#fff'
								style={styles.icon}
							/>
							<Text style={styles.matchText}>{item.players?.length || 0} שחקנים</Text>
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
						onPress={loadMatches}
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
					<Text style={styles.title}>רשימת משחקים</Text>
					<FuturisticButton
						title='+ משחק חדש'
						onPress={() => router.push('/matches/gameday/new')}
						colors={['#43A047', '#1B5E20']}
						startIcon={
							<Feather
								name='plus-circle'
								size={18}
								color='#fff'
							/>
						}
					/>
				</View>

				{matches.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Animatable.Text
							animation='fadeIn'
							style={styles.emptyText}>
							לא נמצאו משחקים
						</Animatable.Text>
					</View>
				) : (
					<FlatList
						data={matches}
						renderItem={renderMatchItem}
						keyExtractor={(item) => item.id}
						contentContainerStyle={styles.listContainer}
						refreshing={loading}
						onRefresh={loadMatches}
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
	matchCardContainer: {
		marginBottom: 16,
	},
	matchInfo: {
		padding: 8,
	},
	matchDetail: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	icon: {
		marginRight: 8,
	},
	matchText: {
		color: '#fff',
		fontSize: 14,
		textShadowColor: 'rgba(0, 0, 0, 0.2)',
		textShadowOffset: {width: 0.5, height: 0.5},
		textShadowRadius: 1,
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
