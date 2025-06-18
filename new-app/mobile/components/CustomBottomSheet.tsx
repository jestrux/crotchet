import React, { useState, useRef } from "react";
import { View, Pressable, Animated, Dimensions } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const { height: screenHeight } = Dimensions.get("window");
const PEEK_HEIGHT = 100;
const EXPANDED_HEIGHT = screenHeight;

interface CustomBottomSheetProps {
	children?: React.ReactNode;
}

export const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
	children,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [animation] = useState(new Animated.Value(PEEK_HEIGHT));
	const panRef = useRef(null);
	const translateY = useRef(new Animated.Value(0)).current;
	const currentHeightRef = useRef(PEEK_HEIGHT);

	const onGestureEvent = Animated.event(
		[{ nativeEvent: { translationY: translateY } }],
		{ useNativeDriver: false }
	);

	const onHandlerStateChange = (event: any) => {
		if (event.nativeEvent.state === State.END) {
			const { translationY } = event.nativeEvent;
			const shouldExpand = translationY < -50; // Drag up (negative) to expand
			const shouldCollapse = translationY > 50; // Drag down (positive) to collapse

			if (shouldExpand && !isExpanded) {
				// Start animation from current position
				const currentHeight = currentHeightRef.current + -translationY;
				animation.setValue(currentHeight);
				expandSheet();
			} else if (shouldCollapse && isExpanded) {
				// Start animation from current position
				const currentHeight = currentHeightRef.current + -translationY;
				animation.setValue(currentHeight);
				collapseSheet();
			} else {
				// Snap back to current state from current position
				const currentHeight = currentHeightRef.current + -translationY;
				animation.setValue(currentHeight);
				const toValue = isExpanded ? EXPANDED_HEIGHT : PEEK_HEIGHT;
				Animated.timing(animation, {
					toValue,
					duration: 150,
					useNativeDriver: false,
				}).start();
			}

			// Reset the translation
			translateY.setValue(0);
		}
	};

	const expandSheet = () => {
		Animated.timing(animation, {
			toValue: EXPANDED_HEIGHT,
			duration: 150,
			useNativeDriver: false,
		}).start(() => {
			currentHeightRef.current = EXPANDED_HEIGHT;
		});
		setIsExpanded(true);
	};

	const collapseSheet = () => {
		Animated.timing(animation, {
			toValue: PEEK_HEIGHT,
			duration: 150,
			useNativeDriver: false,
		}).start(() => {
			currentHeightRef.current = PEEK_HEIGHT;
		});
		setIsExpanded(false);
	};

	const toggleExpanded = () => {
		if (isExpanded) {
			collapseSheet();
		} else {
			expandSheet();
		}
	};

	// Constrain the drag based on current state
	const constrainedTranslateY = translateY.interpolate({
		inputRange: isExpanded
			? [-1000, 0, 1000] // When expanded, allow dragging down but not up
			: [-1000, 0, 1000], // When collapsed, allow dragging up but not down
		outputRange: isExpanded
			? [0, 0, 1000] // When expanded, prevent dragging up (negative values become 0)
			: [-1000, 0, 0], // When collapsed, prevent dragging down (positive values become 0)
		extrapolate: "clamp",
	});

	// Progressive fade for peek content based on drag progress
	const peekOpacity = translateY.interpolate({
		inputRange: isExpanded
			? [-1000, 0, 1000] // When expanded, use full range but peek is always hidden
			: [-100, -50, 0], // When collapsed, fade out as user drags up (negative values)
		outputRange: isExpanded
			? [0, 0, 0] // When expanded, opacity is 0
			: [0, 0.5, 1], // When collapsed, fade from 1 to 0 as drag increases
		extrapolate: "clamp",
	});

	// Combine the base height with the constrained drag translation
	const animatedHeight = Animated.add(
		animation,
		Animated.multiply(constrainedTranslateY, -1)
	);

	return (
		<View
			style={{
				position: "absolute",
				bottom: 0,
				left: 0,
				right: 0,
				top: 0,
				pointerEvents: isExpanded ? "auto" : "box-none",
			}}
		>
			<PanGestureHandler
				ref={panRef}
				onGestureEvent={onGestureEvent}
				onHandlerStateChange={onHandlerStateChange}
			>
				<Animated.View
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						height: animatedHeight,
						backgroundColor: "white",
						borderTopLeftRadius: 20,
						borderTopRightRadius: 20,
						shadowColor: "#000",
						shadowOffset: {
							width: 0,
							height: -2,
						},
						shadowOpacity: 0.25,
						shadowRadius: 3.84,
						elevation: 5,
						overflow: "hidden",
					}}
				>
					{/* Collapsed Content (Blue) */}
					<Animated.View
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: PEEK_HEIGHT,
							backgroundColor: "#3B82F6",
							justifyContent: "center",
							alignItems: "center",
							zIndex: isExpanded ? 0 : 1,
							opacity: peekOpacity,
						}}
					>
						<Pressable
							onPress={toggleExpanded}
							style={{
								width: "100%",
								height: "100%",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<View style={{ alignItems: "center" }}>
								<View
									style={{
										width: 60,
										height: 60,
										backgroundColor:
											"rgba(255,255,255,0.2)",
										borderRadius: 30,
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<View
										style={{
											width: 20,
											height: 20,
											backgroundColor: "white",
											borderRadius: 10,
										}}
									/>
								</View>
							</View>
						</Pressable>
					</Animated.View>

					{/* Expanded Content (Red) */}
					<View
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: EXPANDED_HEIGHT,
							backgroundColor: "#EF4444",
							justifyContent: "center",
							alignItems: "center",
							zIndex: isExpanded ? 1 : 0,
						}}
					>
						<Pressable
							onPress={toggleExpanded}
							style={{
								position: "absolute",
								top: 60,
								right: 20,
								width: 40,
								height: 40,
								backgroundColor: "rgba(255,255,255,0.2)",
								borderRadius: 20,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<View
								style={{
									width: 20,
									height: 2,
									backgroundColor: "white",
									transform: [{ rotate: "45deg" }],
								}}
							/>
							<View
								style={{
									width: 20,
									height: 2,
									backgroundColor: "white",
									transform: [{ rotate: "-45deg" }],
									position: "absolute",
								}}
							/>
						</Pressable>

						<View style={{ alignItems: "center" }}>
							<View
								style={{
									width: 80,
									height: 80,
									backgroundColor: "rgba(255,255,255,0.2)",
									borderRadius: 40,
									justifyContent: "center",
									alignItems: "center",
									marginBottom: 20,
								}}
							>
								<View
									style={{
										width: 40,
										height: 40,
										backgroundColor: "white",
										borderRadius: 20,
									}}
								/>
							</View>
							<View
								style={{
									width: 200,
									height: 4,
									backgroundColor: "white",
									borderRadius: 2,
									marginBottom: 8,
								}}
							/>
							<View
								style={{
									width: 150,
									height: 4,
									backgroundColor: "rgba(255,255,255,0.6)",
									borderRadius: 2,
								}}
							/>
						</View>
					</View>
				</Animated.View>
			</PanGestureHandler>
		</View>
	);
};
