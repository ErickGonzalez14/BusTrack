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
import { StyleSheet } from "react-native-unistyles";

export type PrimaryBottomSheetRef = {
  open: () => void;
  close: () => void;
};

type PrimaryBottomSheetProps = {
  children: ReactNode;
  ref?: Ref<PrimaryBottomSheetRef>;
  snapPoints?: (number | string)[];
};

export default function PrimaryBottomSheet({
  children,
  ref,
  snapPoints = ["34%"],
}: PrimaryBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const points = useMemo(() => snapPoints, [snapPoints]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }),
    [],
  );

  return (
    <BottomSheet
      index={-1}
      ref={bottomSheetRef}
      snapPoints={points}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView style={styles.container}>{children}</BottomSheetView>
    </BottomSheet>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.surface.background,
  },
}));
