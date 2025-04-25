import React from 'react';
import {StyleSheet, View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {useRouter} from 'expo-router';
import {Feather, FontAwesome5} from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import AnimatedBackground from '../../components/AnimatedBackground';
import AnimatedCard from '../../components/AnimatedCard';
import FuturisticButton from '../../components/FuturisticButton';

export default function HomeScreen() {
	const router = useRouter();

	return (
		<AnimatedBackground colors={['#1a2151', '#0f5132']}>
			<ScrollView style={styles.container}>
				<Animatable.View
					animation='fadeInDown'
					duration={1000}
					style={styles.header}>
					<Animatable.Text
						animation='pulse'
						iterationCount='infinite'
						duration={3000}
						style={styles.title}>
						כדורגל שכונתי
					</Animatable.Text>
					<Text style={styles.subtitle}>ארגון משחקים, איזון קבוצות ומעקב אחר סטטיסטיקות עם החברים שלך</Text>
				</Animatable.View>

				<View style={styles.cardContainer}>
					<AnimatedCard
						title='שחקנים'
						gradientColors={['#4527A0', '#7B1FA2']}
						onPress={() => router.push('/players')}
						delay={200}
						animationType='fadeIn'>
						<View style={styles.cardContent}>
							<FontAwesome5
								name='user'
								size={24}
								color='#fff'
								style={styles.cardIcon}
							/>
							<Text style={styles.cardDescription}>רישום וניהול שחקנים עם דירוגים</Text>
						</View>
					</AnimatedCard>

					<AnimatedCard
						title='משחקים'
						gradientColors={['#00796B', '#0288D1']}
						onPress={() => router.push('/matches')}
						delay={400}
						animationType='fadeIn'>
						<View style={styles.cardContent}>
							<FontAwesome5
								name='futbol'
								size={24}
								color='#fff'
								style={styles.cardIcon}
							/>
							<Text style={styles.cardDescription}>יצירת משחקים ורישום תוצאות</Text>
						</View>
					</AnimatedCard>

					<AnimatedCard
						title='טבלת ליגה'
						gradientColors={['#E64A19', '#FFA000']}
						onPress={() => router.push('/table')}
						delay={600}
						animationType='fadeIn'>
						<View style={styles.cardContent}>
							<FontAwesome5
								name='trophy'
								size={24}
								color='#fff'
								style={styles.cardIcon}
							/>
							<Text style={styles.cardDescription}>צפייה בדירוג הנוכחי וסטטיסטיקות</Text>
						</View>
					</AnimatedCard>
				</View>

				<Animatable.View
					animation='fadeInUp'
					delay={800}
					style={styles.actionsSection}>
					<Text style={styles.sectionTitle}>פעולות מהירות</Text>
					<View style={styles.actionButtons}>
						<FuturisticButton
							title='הוספת שחקן'
							colors={['#1E88E5', '#0D47A1']}
							onPress={() => router.push('/players/new')}
							startIcon={
								<Feather
									name='user-plus'
									size={18}
									color='#fff'
								/>
							}
						/>

						<FuturisticButton
							title='יצירת משחק'
							colors={['#43A047', '#1B5E20']}
							onPress={() => router.push('/matches/gameday/new')}
							startIcon={
								<Feather
									name='plus-circle'
									size={18}
									color='#fff'
								/>
							}
						/>
					</View>
				</Animatable.View>
			</ScrollView>
		</AnimatedBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		alignItems: 'center',
		paddingVertical: 30,
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 36,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 16,
		textAlign: 'center',
		textShadowColor: 'rgba(0, 0, 0, 0.4)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 10,
	},
	subtitle: {
		fontSize: 16,
		color: 'rgba(255, 255, 255, 0.9)',
		textAlign: 'center',
		paddingHorizontal: 20,
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 3,
	},
	cardContainer: {
		paddingHorizontal: 20,
		marginTop: 16,
	},
	cardContent: {
		alignItems: 'center',
		paddingVertical: 8,
	},
	cardIcon: {
		marginBottom: 12,
	},
	cardDescription: {
		color: '#fff',
		textAlign: 'center',
		fontSize: 14,
		opacity: 0.9,
	},
	actionsSection: {
		padding: 20,
		marginTop: 16,
		marginBottom: 30,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 20,
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 2,
	},
	actionButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		flexWrap: 'wrap',
		gap: 16,
	},
});
