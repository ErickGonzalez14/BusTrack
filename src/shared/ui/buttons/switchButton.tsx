import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type CustomSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export default function SwitchButton({
  value,
  onValueChange,
}: CustomSwitchProps) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {
      duration: 180,
    });
  }, [progress, value]);

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(progress.value, [0, 1], [2, 30]),
        },
      ],
    };
  });
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[styles.container, value ? styles.active : styles.inactive]}
    >
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: 57,
    height: 28,
    borderRadius: 20,
    justifyContent: "center",
  },

  active: {
    backgroundColor: "#30C759",
  },

  inactive: {
    backgroundColor: "#D1D1D6",
  },

  thumb: {
    width: 24,
    height: 24,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
}));
