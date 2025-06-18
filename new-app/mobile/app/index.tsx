import { View, Text, ScrollView, Pressable } from "react-native";
import { Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

type MenuItem = {
	color: string;
	icon: React.ReactNode;
	label: string;
	href: "/modal";
};

export default function CompanyDetailScreen() {
	const menuItems: MenuItem[] = [
		{
			color: "#3B82F6",
			icon: <Ionicons name="albums" size={30} color="white" />,
			label: "Projects",
			href: `/modal`,
		},
		{
			color: "#22C55E",
			icon: <Ionicons name="people" size={30} color="white" />,
			label: "Contacts",
			href: `/modal`,
		},
		{
			color: "#EAB308",
			icon: <Ionicons name="documents" size={30} color="white" />,
			label: "Callsheets",
			href: `/modal`,
		},
		{
			color: "#EF4444",
			icon: <Ionicons name="calendar" size={30} color="white" />,
			label: "Calendar",
			href: `/modal`,
		},
	];

	const menuItem = (
		{ label, href, color, icon }: MenuItem,
		index: number
	) => (
		<Link href={href} asChild key={index}>
			<Pressable>
				<View className="items-center gap-2">
					<View
						className="flex-row items-center justify-center rounded-xl size-12"
						style={{ backgroundColor: color }}
					>
						{icon}
					</View>
					<Text className="text-sm text-foreground font-semibold opacity-60">
						{label}
					</Text>
				</View>
			</Pressable>
		</Link>
	);

	return (
		<ScrollView className="flex-1 bg-background p-4">
			<View className="mt-6 flex-row flex-wrap justify-around">
				{menuItems.map(menuItem)}
			</View>
		</ScrollView>
	);
}
