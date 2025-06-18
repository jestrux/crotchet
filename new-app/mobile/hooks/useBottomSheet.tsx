import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import {
	Sheet as NativeSheet,
	useSheetRef,
} from "@/components/nativewindui/Sheet";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@/components/theming";

export type SheetChoice = {
	label?: string;
	icon?: React.ReactNode;
	href?: string;
	onPress?: () => void | Promise<void>;
} & ("divider" | { type?: undefined; label: string });

interface SheetProps {
	choices?: SheetChoice[];
	title?: string;
	onClose?: () => void;
	isVisible?: boolean;
	children?: React.ReactNode;
	noPadding?: boolean;
	snapPoints?: string[];
}

export function useBottomSheet() {
	const { colorScheme } = useTheme();
	const bottomSheetModalRef = useSheetRef();
	const [isReady, setIsReady] = useState(false);
	const [shouldShow, setShouldShow] = useState(false);

	useEffect(() => {
		if (isReady && shouldShow && bottomSheetModalRef.current) {
			bottomSheetModalRef.current.present();
			bottomSheetModalRef.current.expand();
			setShouldShow(false);
		}
	}, [isReady, shouldShow]);

	const show = () => {
		if (isReady && bottomSheetModalRef.current) {
			bottomSheetModalRef.current.present();
			bottomSheetModalRef.current.expand();
		} else {
			// Queue up to show once ready
			setShouldShow(true);
		}
	};

	const hide = () => {
		if (bottomSheetModalRef.current) {
			bottomSheetModalRef.current.dismiss();
		}
	};

	const ChoiceItem = ({
		item,
		onItemClose,
	}: {
		item: SheetChoice;
		onItemClose?: () => void;
	}) => {
		if (item === "divider")
			return (
				<View
					className="border-b border-stroke"
					style={{ height: 1, marginVertical: 2 }}
				/>
			);

		const processedIcon = item.icon
			? React.cloneElement(item.icon as React.ReactElement, {
					color: colorScheme === "dark" ? "white" : "black",
					size: 18,
			  })
			: null;

		const content = (
			<>
				{processedIcon || <View className="size-5" />}
				<Text className="text-foreground text-lg">{item.label}</Text>
			</>
		);

		const handleAction = () => {
			hide();
			if (onItemClose) onItemClose();
		};

		if (item.href) {
			return (
				<Link href={item.href as any} onPress={handleAction} asChild>
					<Pressable className="flex-row items-center gap-3 py-2 px-6 rounded">
						{content}
					</Pressable>
				</Link>
			);
		}

		return (
			<Pressable
				onPress={() => {
					if (item.onPress) item.onPress();
					handleAction();
				}}
				className="flex-row items-center gap-3 py-2 px-6 rounded"
			>
				{content}
			</Pressable>
		);
	};

	const Sheet = ({
		choices,
		title,
		onClose,
		isVisible = false,
		children,
		noPadding = false,
		snapPoints = [],
	}: SheetProps) => {
		useEffect(() => {
			setIsReady(true);
			if (isVisible) show();
			return () => setIsReady(false);
		}, []);

		return (
			<NativeSheet ref={bottomSheetModalRef} snapPoints={snapPoints}>
				<BottomSheetView className={!noPadding ? "pb-12" : ""}>
					{title && (
						<View className="px-6 mt-4 mb-2">
							<Text className="text-foreground font-bold text-2xl">
								{title}
							</Text>
						</View>
					)}
					{children}
					{choices?.map((choice, index) => (
						<ChoiceItem
							key={index}
							item={choice}
							onItemClose={onClose}
						/>
					))}
				</BottomSheetView>
			</NativeSheet>
		);
	};

	return {
		Sheet,
		show,
		hide,
	};
}
