import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type PrimaryBottomSheetRef = {
  open: () => void;
  collapse: () => void;
  close: () => void;
};

type PrimaryBottomSheetProps = {
  children: ReactNode;
  ref?: Ref<PrimaryBottomSheetRef>;
  snapPoints?: (number | string)[];
  showBackdrop?: boolean;
  enablePanDownToClose?: boolean;
  onChange?: (index: number) => void;
};

export default function PrimaryBottomSheet({
  children,
  ref,
  snapPoints = ["34%"],
  showBackdrop = true,
  enablePanDownToClose = true,
  onChange,
}: PrimaryBottomSheetProps) {
  const { theme } = useUnistyles();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const points = useMemo(() => snapPoints, [snapPoints]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => bottomSheetRef.current?.expand(),
      collapse: () => bottomSheetRef.current?.snapToIndex(0),
      close: () => bottomSheetRef.current?.close(),
    }),
    [],
  );

  return (
    <BottomSheet
      backgroundStyle={{ backgroundColor: theme.surface.background }}
      handleIndicatorStyle={{ backgroundColor: theme.text.placeHolderLight }}
      index={-1}
      ref={bottomSheetRef}
      snapPoints={points}
      enableDynamicSizing={true}
      enablePanDownToClose={enablePanDownToClose}
      onChange={onChange}
      backdropComponent={
        showBackdrop
          ? (props) => (
              <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
              />
            )
          : undefined
      }
    >
      <BottomSheetView style={styles.container}>{children}</BottomSheetView>
    </BottomSheet>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 20,
    backgroundColor: theme.surface.background,
  },
}));
