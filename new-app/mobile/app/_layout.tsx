import "../global.css";
import { ThemeProvider, NativeTheme } from "@/components/theming";
import { QueryProvider } from "@/context/QueryProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import StackPage from "./StackPage";

export default function RootLayout() {
	return (
		<QueryProvider>
			<ThemeProvider defaultTheme="system">
				<NativeTheme>
					<GestureHandlerRootView style={{ flex: 1 }}>
						<BottomSheetModalProvider>
							<StackPage />
						</BottomSheetModalProvider>
					</GestureHandlerRootView>
				</NativeTheme>
			</ThemeProvider>
		</QueryProvider>
	);
}
