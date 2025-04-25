import React, {useEffect} from 'react';
import {StyleSheet, View, ViewStyle, Dimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	withDelay,
	interpolate,
	Extrapolate,
} from 'react-native-reanimated';

interface AnimatedBackgroundProps {
	children: React.ReactNode;
	style?: ViewStyle;
	colors?: string[];
}

const {width, height} = Dimensions.get('window');
const BUBBLE_SIZE = 100;
const NUM_BUBBLES = 6;

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({children, style, colors = ['#1a2151', '#0f5132']}) => {
	// Create animated bubbles
	const bubbles = Array.from({length: NUM_BUBBLES}).map((_, i) => {
		const animation = useSharedValue(0);
		const size = useSharedValue(Math.random() * 150 + 50);

		useEffect(() => {
			animation.value = 0;
			animation.value = withRepeat(
				withDelay(i * 1000, withTiming(1, {duration: 20000 + Math.random() * 10000})),
				-1,
				true
			);
		}, []);

		const animatedStyle = useAnimatedStyle(() => {
			const translateY = interpolate(animation.value, [0, 1], [height + 100, -size.value], Extrapolate.CLAMP);

			const translateX = interpolate(
				animation.value,
				[0, 0.2, 0.4, 0.6, 0.8, 1],
				[
					width * (0.1 + i * 0.15),
					width * (0.15 + i * 0.15),
					width * (0.1 + i * 0.15),
					width * (0.15 + i * 0.15),
					width * (0.1 + i * 0.15),
					width * (0.15 + i * 0.15),
				],
				Extrapolate.CLAMP
			);

			return {
				transform: [{translateY}, {translateX}, {scale: size.value / 100}],
				opacity: interpolate(animation.value, [0, 0.2, 0.8, 1], [0, 0.2, 0.2, 0], Extrapolate.CLAMP),
			};
		});

		return {animatedStyle, key: i};
	});

	return (
		<View style={[styles.container, style]}>
			<LinearGradient
				colors={colors}
				style={StyleSheet.absoluteFill}
			/>

			{bubbles.map((bubble) => (
				<Animated.View
					key={bubble.key}
					style={[styles.bubble, bubble.animatedStyle]}
				/>
			))}

			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		overflow: 'hidden',
	},
	bubble: {
		position: 'absolute',
		width: BUBBLE_SIZE,
		height: BUBBLE_SIZE,
		borderRadius: BUBBLE_SIZE / 2,
		backgroundColor: 'rgba(255, 255, 255, 0.15)',
	},
});

export default AnimatedBackground;
