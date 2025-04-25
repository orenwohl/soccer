import React, {useEffect} from 'react';
import {StyleSheet, View, ViewStyle, TouchableOpacity, Text} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing} from 'react-native-reanimated';
import {LinearGradient} from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

interface AnimatedCardProps {
	children: React.ReactNode;
	style?: ViewStyle;
	onPress?: () => void;
	gradientColors?: [string, string];
	title?: string;
	delay?: number;
	animationType?: 'fadeIn' | 'bounce' | 'flip' | 'pulse' | 'zoomIn';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
	children,
	style,
	onPress,
	gradientColors = ['#4d4dff', '#2e7d32'],
	title,
	delay = 0,
	animationType = 'fadeIn',
}) => {
	const scale = useSharedValue(1);
	const opacity = useSharedValue(0);

	useEffect(() => {
		opacity.value = withTiming(1, {
			duration: 600,
			easing: Easing.out(Easing.exp),
		});
	}, []);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{scale: scale.value}],
			opacity: opacity.value,
		};
	});

	const handlePressIn = () => {
		scale.value = withSpring(0.97);
	};

	const handlePressOut = () => {
		scale.value = withSpring(1);
	};

	const Card = () => (
		<Animated.View style={[styles.card, animatedStyle, style]}>
			<LinearGradient
				colors={gradientColors}
				start={{x: 0, y: 0}}
				end={{x: 1, y: 1}}
				style={styles.gradient}>
				{title && (
					<Animatable.Text
						animation='fadeIn'
						delay={delay + 300}
						style={styles.title}>
						{title}
					</Animatable.Text>
				)}
				<Animatable.View
					animation={animationType}
					duration={800}
					delay={delay}
					style={styles.content}>
					{children}
				</Animatable.View>
			</LinearGradient>
		</Animated.View>
	);

	if (onPress) {
		return (
			<TouchableOpacity
				activeOpacity={0.9}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				onPress={onPress}>
				<Card />
			</TouchableOpacity>
		);
	}

	return <Card />;
};

const styles = StyleSheet.create({
	card: {
		borderRadius: 16,
		overflow: 'hidden',
		marginBottom: 16,
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 4},
		shadowOpacity: 0.2,
		shadowRadius: 8,
	},
	gradient: {
		padding: 16,
		minHeight: 80,
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 8,
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 2,
	},
	content: {
		flex: 1,
	},
});

export default AnimatedCard;
