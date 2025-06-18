import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal,
} from "@gorhom/bottom-sheet";
import * as React from "react";
import { useTheme } from "../theming";
import { getThemeColors } from "../screenOptions";

const Sheet = React.forwardRef<
	BottomSheetModal,
	React.ComponentPropsWithoutRef<typeof BottomSheetModal>
>(
	(
		{ index = 0, backgroundStyle, style, handleIndicatorStyle, ...props },
		ref
	) => {
		const { colorScheme } = useTheme();
		const colors = getThemeColors(colorScheme as "light" | "dark");

		const renderBackdrop = React.useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
			),
			[]
		);
		return (
			<BottomSheetModal
				ref={ref}
				index={0}
				backgroundStyle={
					backgroundStyle ?? {
						backgroundColor: colors.cardColor,
					}
				}
				style={
					style ?? {
						borderWidth: 1,
						borderColor: colors.borderColor,
						borderTopStartRadius: 16,
						borderTopEndRadius: 16,
					}
				}
				handleIndicatorStyle={
					handleIndicatorStyle ?? {
						backgroundColor: colors.mutedForegroundColor,
					}
				}
				backdropComponent={renderBackdrop}
				{...props}
			/>
		);
	}
);

function useSheetRef() {
	return React.useRef<BottomSheetModal>(null);
}

export { Sheet, useSheetRef };
