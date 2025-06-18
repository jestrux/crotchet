import React from "react";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Link, Href } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

type IconName = keyof typeof FontAwesome.glyphMap;

interface ButtonProps {
	onPress?: () => void;
	title: string;
	variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	className?: string;
	icon?: React.ReactNode | IconName;
	iconPosition?: "left" | "right";
	loading?: boolean;
	href?: Href;
}

export default function Button({
	onPress,
	title,
	variant = "primary",
	size = "lg",
	disabled = false,
	className = "",
	icon,
	iconPosition = "left",
	loading = false,
	href,
}: ButtonProps) {
	// Base classes for all buttons
	const baseClasses = "rounded-lg justify-center items-center";

	// Size classes
	const sizeClasses = {
		sm: "px-3 h-8 text-xs",
		md: "px-4 h-10 text-sm",
		lg: "px-6 h-14 text-lg font-semibold uppercase",
	}[size];

	// Variant classes
	const variantClasses = {
		primary: "bg-primary",
		secondary: "bg-secondary",
		destructive: "bg-destructive",
		outline: "border border-input bg-background hover:bg-accent",
		ghost: "hover:bg-accent",
	}[variant];

	// Disabled classes
	const disabledClasses = disabled || loading ? "opacity-50" : "";

	// Text color classes based on variant
	const textColorClasses = {
		primary: "text-primary-foreground",
		secondary: "text-secondary-foreground",
		destructive: "text-destructive-foreground",
		outline: "text-foreground",
		ghost: "text-foreground",
	}[variant];

	// Icon size based on button size
	const iconSize = {
		sm: 12,
		md: 16,
		lg: 20,
	}[size];

	// Render icon based on type (string or ReactNode)
	const renderIcon = () => {
		if (!icon) return null;

		if (typeof icon === "string") {
			return (
				<FontAwesome
					name={icon as IconName}
					size={iconSize}
					color="currentColor"
				/>
			);
		}

		return icon;
	};

	const buttonContent = (
		<View className="flex-row items-center justify-center">
			{loading ? (
				<ActivityIndicator
					size="small"
					color={
						variant === "outline" || variant === "ghost"
							? "#09090b"
							: "#ffffff"
					}
					className="mr-2"
				/>
			) : icon && iconPosition === "left" ? (
				<Text className={`mr-2 ${textColorClasses}`}>
					{renderIcon()}
				</Text>
			) : null}
			<Text className={`font-medium text-center ${textColorClasses}`}>
				{title}
			</Text>
			{!loading && icon && iconPosition === "right" && (
				<Text className={`ml-2 ${textColorClasses}`}>
					{renderIcon()}
				</Text>
			)}
		</View>
	);

	// If href is provided, use Link component
	if (href) {
		return (
			<Link href={href} asChild disabled={disabled || loading}>
				<TouchableOpacity
					className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
				>
					{buttonContent}
				</TouchableOpacity>
			</Link>
		);
	}

	// Otherwise use regular TouchableOpacity
	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled || loading}
			className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
		>
			{buttonContent}
		</TouchableOpacity>
	);
}
