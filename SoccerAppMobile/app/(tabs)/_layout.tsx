import React from 'react';
import {Tabs} from 'expo-router';
import {MaterialIcons, FontAwesome} from '@expo/vector-icons';

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: '#2e7d32',
				tabBarInactiveTintColor: '#777',
				headerShown: true,
				headerStyle: {
					backgroundColor: '#2e7d32',
				},
				headerTintColor: '#fff',
				headerTitleAlign: 'center',
			}}>
			<Tabs.Screen
				name='index'
				options={{
					title: 'בית',
					tabBarIcon: ({color}) => (
						<MaterialIcons
							name='home'
							size={24}
							color={color}
						/>
					),
					headerTitle: 'כדורגל שכונתי',
				}}
			/>
			<Tabs.Screen
				name='players'
				options={{
					title: 'שחקנים',
					tabBarIcon: ({color}) => (
						<FontAwesome
							name='user'
							size={22}
							color={color}
						/>
					),
					headerTitle: 'שחקנים',
				}}
			/>
			<Tabs.Screen
				name='matches'
				options={{
					title: 'משחקים',
					tabBarIcon: ({color}) => (
						<MaterialIcons
							name='sports-soccer'
							size={24}
							color={color}
						/>
					),
					headerTitle: 'משחקים',
				}}
			/>
			<Tabs.Screen
				name='table'
				options={{
					title: 'טבלה',
					tabBarIcon: ({color}) => (
						<FontAwesome
							name='trophy'
							size={24}
							color={color}
						/>
					),
					headerTitle: 'טבלת ליגה',
				}}
			/>
		</Tabs>
	);
}
