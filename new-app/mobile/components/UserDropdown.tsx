import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBottomSheet, SheetChoice } from "@/hooks/useBottomSheet";
import { Theme } from "./theming";

export type MenuItem = SheetChoice;

interface UserDropdownProps {
	className?: string;
	menuItems?: MenuItem[];
	iconSize?: number;
	iconColor?: string;
	onMenuClose?: () => void;
}

export function UserDropdown({
	className,
	menuItems = [],
	iconSize = 32,
	onMenuClose,
}: UserDropdownProps) {
	const handleLogout = async () => {
		try {
			// await logout();
			if (onMenuClose) onMenuClose();
		} catch (error) {
			console.error("Error during logout:", error);
		}
	};

	const allMenuItems = [
		...(menuItems?.length ? [...menuItems, "divider" as MenuItem] : []),
		{
			label: "Profile",
			icon: <Ionicons name="person" size={20} />,
			href: "/profile",
		} as MenuItem,
		{
			label: "Logout",
			icon: <Ionicons name="log-out-outline" size={20} />,
			onPress: handleLogout,
		} as MenuItem,
	];

	const { Sheet, show } = useBottomSheet();

	return (
		<View className={`flex-row items-center ${className}`}>
			<Pressable onPress={show}>
				<Theme>
					{({ colors }) => (
						<Ionicons
							name="person-circle"
							size={iconSize}
							color={colors.foregroundColor}
						/>
					)}
				</Theme>
			</Pressable>
			<Sheet choices={allMenuItems} onClose={onMenuClose} />
		</View>
	);
}
