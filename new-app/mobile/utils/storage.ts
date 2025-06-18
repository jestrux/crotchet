import AsyncStorage from "@react-native-async-storage/async-storage";

// Save string to async storage
export const saveToken = async (key: string, value: string): Promise<void> => {
	try {
		await AsyncStorage.setItem(key, value);
	} catch (error) {
		console.error(`Error saving ${key} to storage:`, error);
		throw error;
	}
};

// Get string from async storage
export const getToken = async (key: string): Promise<string | null> => {
	try {
		return await AsyncStorage.getItem(key);
	} catch (error) {
		console.error(`Error getting ${key} from storage:`, error);
		return null;
	}
};

// Save object to async storage
export const savePreference = async (
	key: string,
	value: any
): Promise<void> => {
	try {
		const jsonValue = value !== null ? JSON.stringify(value) : null;
		await AsyncStorage.setItem(key, jsonValue || "");
	} catch (error) {
		console.error(`Error saving preference ${key} to storage:`, error);
		throw error;
	}
};

// Get object from async storage
export const getPreference = async (
	key: string,
	defaultValue?: any
): Promise<any> => {
	try {
		const jsonValue = await AsyncStorage.getItem(key);
		return jsonValue !== null ? JSON.parse(jsonValue) : defaultValue;
	} catch (error) {
		console.error(`Error getting preference ${key} from storage:`, error);
		return null;
	}
};

// Clear all storage
export const clearStorage = async (): Promise<void> => {
	try {
		await AsyncStorage.clear();
	} catch (error) {
		console.error("Error clearing storage:", error);
		throw error;
	}
};
