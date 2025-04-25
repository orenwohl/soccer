import React, {useEffect} from 'react';
import {StyleSheet, Text, TouchableWithoutFeedback, ViewStyle, TextStyle, View, ActivityIndicator} from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withSequence,
	withDelay,
	withTiming,
} from 'react-native-reanimated';
import {LinearGradient} from 'expo-linear-gradient';

interface FuturisticButtonProps {
	title: string;
	onPress: () => void;
	style?: ViewStyle;
	textStyle?: TextStyle;
	colors?: string[];
	loading?: boolean;
	disabled?: boolean;
	startIcon?: React.ReactNode;
	endIcon?: React.ReactNode;
	bordered?: boolean;
}

const FuturisticButton: React.FC<FuturisticButtonProps> = ({
	title,
	onPress,
	style,
	textStyle,
	colors = ['#4d4dff', '#2e7d32'],
	loading = false,
	disabled = false,
	startIcon,
	endIcon,
	bordered = false,
}) => {
	const scale = useSharedValue(1);
	const opacity = useSharedValue(0);
	const borderWidth = useSharedValue(0);
	const borderOpacity = useSharedValue(0);

	useEffect(() => {
		opacity.value = withTiming(1, {duration: 500});
		if (bordered) {
			borderWidth.value = withTiming(3, {duration: 700});
			borderOpacity.value = withTiming(1, {duration: 700});
		}
	}, []);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{scale: scale.value}],
			opacity: opacity.value,
			borderWidth: borderWidth.value,
			borderColor: 'rgba(255, 255, 255, 0.6)',
			borderOpacity: borderOpacity.value,
		};
	});

	const handlePressIn = () => {
		scale.value = withSequence(withTiming(0.95, {duration: 100}), withSpring(0.98));
	};

	const handlePressOut = () => {
		scale.value = withSpring(1);
	};

	return (
		<TouchableWithoutFeedback
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			onPress={onPress}
			disabled={disabled || loading}>
			<Animated.View style={[styles.container, animatedStyle, style, disabled && styles.disabled]}>
				<LinearGradient
					colors={disabled ? ['#999', '#777'] : colors}
					start={{x: 0, y: 0}}
					end={{x: 1, y: 1}}
					style={styles.gradient}>
					{loading ? (
						<ActivityIndicator
							color='#FFF'
							size='small'
						/>
					) : (
						<View style={styles.content}>
							{startIcon && <View style={styles.iconStart}>{startIcon}</View>}
							<Text style={[styles.text, textStyle]}>{title}</Text>
							{endIcon && <View style={styles.iconEnd}>{endIcon}</View>}
						</View>
					)}
				</LinearGradient>
			</Animated.View>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		overflow: 'hidden',
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 3},
		shadowOpacity: 0.2,
		shadowRadius: 6,
	},
	gradient: {
		paddingVertical: 14,
		paddingHorizontal: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
		textAlign: 'center',
		textShadowColor: 'rgba(0, 0, 0, 0.2)',
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 1,
	},
	disabled: {
		opacity: 0.7,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconStart: {
		marginRight: 10,
	},
	iconEnd: {
		marginLeft: 10,
	},
});

export default FuturisticButton;
