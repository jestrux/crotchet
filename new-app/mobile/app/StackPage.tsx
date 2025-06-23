import { View, Text, Pressable } from "react-native";
import { Stack } from "expo-router";
import { StackWithTheme, useTheme } from "@/components/theming";
import { Ionicons } from "@expo/vector-icons";
import { useBottomSheet } from "@/hooks/useBottomSheet";
import { getThemeColors } from "@/components/screenOptions";
import { CustomBottomSheet } from "@/components/CustomBottomSheet";

export default function StackPage() {
	const { colorScheme } = useTheme();
	const colors = getThemeColors(colorScheme as "light" | "dark");
	const headerTitle = "Crotchet";
	const { Sheet, show } = useBottomSheet();
	const { Sheet: MenuSheet, show: showMenu } = useBottomSheet();

	const headerLeft = () => (
		<View className="flex-row items-center gap-3 sml-4">
			<Pressable
				onPress={show}
				className="rounded-full size-8 flex items-center justify-center"
			>
				<Ionicons
					name="options"
					size={24}
					color={colors.foregroundColor}
				/>
			</Pressable>
			<Text className="text-2xl font-bold text-foreground">
				{headerTitle}
			</Text>
		</View>
	);

	const headerRight = () => {
		return (
			<View className="flex-row items-center">
				<Pressable
					className="rounded-full size-8 flex items-center justify-center"
					onPress={showMenu}
				>
					<Ionicons
						name="person-circle"
						size={30}
						color={colors.foregroundColor}
					/>
				</Pressable>
				<MenuSheet
					choices={[
						{
							label: "Profile",
							icon: <Ionicons name="person" size={20} />,
							href: "/profile",
						},
						{
							label: "Logout",
							icon: <Ionicons name="log-out-outline" size={20} />,
							onPress: () => {},
						},
					]}
					onClose={() => {}}
				/>
			</View>
		);
	};

	return (
		<>
			<StackWithTheme>
				<Stack.Screen
					name="index"
					options={{
						headerTitle: "",
						headerLeft,
						headerRight,
						animation: "none",
					}}
				/>
				<Stack.Screen
					name="modal"
					options={{
						presentation: "modal",
					}}
				/>
			</StackWithTheme>
			<Sheet
				choices={[
					{
						icon: <Ionicons name="reorder-two-outline" />,
						label: "Switch to Tabs Layout",
						onPress: () => {},
					},
				]}
			/>
			<CustomBottomSheet />
		</>
	);
}
