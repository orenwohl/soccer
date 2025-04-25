import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useEffect} from 'react';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<Stack
				screenOptions={{
					headerStyle: {
						backgroundColor: '#2e7d32',
					},
					headerTintColor: '#fff',
					headerTitleAlign: 'center',
				}}>
				<Stack.Screen
					name='(tabs)'
					options={{headerShown: false}}
				/>
				<Stack.Screen
					name='players/[id]'
					options={{
						title: 'פרטי שחקן',
						headerBackTitle: 'חזור',
					}}
				/>
				<Stack.Screen
					name='players/new'
					options={{
						title: 'שחקן חדש',
						headerBackTitle: 'חזור',
					}}
				/>
				<Stack.Screen
					name='players/edit/[id]'
					options={{
						title: 'עריכת שחקן',
						headerBackTitle: 'חזור',
					}}
				/>
				<Stack.Screen
					name='matches/[id]'
					options={{
						title: 'פרטי משחק',
						headerBackTitle: 'חזור',
					}}
				/>
				<Stack.Screen
					name='matches/gameday/new'
					options={{
						title: 'משחק חדש',
						headerBackTitle: 'חזור',
					}}
				/>
			</Stack>
			<StatusBar style='auto' />
		</ThemeProvider>
	);
}
