import { useState, useEffect } from "react";
import { View, Text, TextInput } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import Button from "@/components/Button";

export default function LoginScreen() {
	const params = useLocalSearchParams<{ preset: "local" | "prod" }>();
	const preset = params.preset || "local";
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Preset values based on environment
	const presetValues = {
		local: {
			apiToken: "46504c62-0776-4ce4-85f6-cb72f1ea9ff4",
			baseUrl: "http://192.168.0.52:8081/",
		},
		prod: {
			apiToken: "e9675f6c-b05b-4d6c-9193-c155846ac6e8",
			baseUrl: "https://api.sethero.com",
		},
	};

	const [credentials, setCredentials] = useState(
		presetValues[preset as "local" | "prod"]
	);

	// Update credentials when preset changes
	useEffect(() => {
		if (preset) setCredentials(presetValues[preset as "local" | "prod"]);
	}, [preset]);

	const handleInputChange = (
		field: keyof typeof credentials,
		value: string
	) => {
		setCredentials((prev) => ({ ...prev, [field]: value }));
	};

	const handleLogin = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// const success = await validateAndLogin(credentials);

			// if (success) {
			// 	// await checkAuth();
			// 	router.replace("/");
			// } else setError("Login failed. Please check your credentials.");
		} catch (error) {
			setError("An unexpected error occurred. Please try again.");
			console.error("Login error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View className="flex-1">
			<Stack.Screen
				options={{
					title:
						preset === "local"
							? "Login to Local"
							: "Login to Production",
					headerLeft: () => (
						<Button
							title="Cancel"
							variant="outline"
							size="sm"
							onPress={() => router.back()}
						/>
					),
				}}
			/>

			<View className="flex-1 p-6">
				<View className="mb-4">
					<Text className="mb-1 text-foreground">API Token</Text>
					<TextInput
						className="bg-input p-2 rounded border border-stroke text-foreground"
						value={credentials.apiToken}
						onChangeText={(text) =>
							handleInputChange("apiToken", text)
						}
					/>
				</View>

				<View className="mb-6">
					<Text className="mb-1 text-foreground">Base URL</Text>
					<TextInput
						className="bg-input p-2 rounded border border-stroke text-foreground"
						value={credentials.baseUrl}
						onChangeText={(text) =>
							handleInputChange("baseUrl", text)
						}
					/>
				</View>

				{error && (
					<Text className="text-destructive mb-4 text-center">
						{error}
					</Text>
				)}

				<Button
					title="Login"
					onPress={handleLogin}
					loading={isLoading}
					className="mt-4"
				/>
			</View>
		</View>
	);
}
