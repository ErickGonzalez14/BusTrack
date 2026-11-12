import { Image } from "expo-image";
import { NavArrowRight } from "iconoir-react-native";
import { ComponentType } from "react";
import {
  ImageSourcePropType,
  Pressable,
  Text,
  View,
  type ColorValue,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import SwitchButton from "../buttons/switchButton";

type SettingsProps = {
  icon: ComponentType<any> | ImageSourcePropType;
  settingsName: string;
  onPress?: () => void;
  iconColor?: ColorValue;
  isToggle: boolean;
  separator: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
};

type IconValue = ComponentType<any> | ImageSourcePropType;

function isImageSource(icon: IconValue): icon is ImageSourcePropType {
  return (
    typeof icon === "number" ||
    Array.isArray(icon) ||
    (typeof icon === "object" && icon !== null && "uri" in icon)
  );
}

export default function Settings({
  icon: Icon,
  settingsName,
  onPress,
  iconColor,
  isToggle,
  separator,
  toggleValue = false,
  onToggleChange,
}: SettingsProps) {
  const { theme } = useUnistyles();
  const isImage =
    typeof Icon === "number" ||
    (typeof Icon === "object" &&
      Icon !== null &&
      ("uri" in Icon || Array.isArray(Icon)));
  return (
    <Pressable
      style={[styles.container, separator && styles.separator]}
      onPress={onPress}
    >
      <View style={styles.iconTextContainer}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconColor ?? theme.icons.alternative },
          ]}
        >
          {isImageSource(Icon) ? (
            <Image
              source={Icon}
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />
          ) : (
            <Icon width={24} height={24} color={theme.surface.background} />
          )}
        </View>
        <Text style={styles.text}>{settingsName}</Text>
      </View>
      {isToggle ? (
        <SwitchButton value={toggleValue} onValueChange={onToggleChange!} />
      ) : (
        <NavArrowRight
          width={24}
          height={24}
          color={theme.text.placeHolderLight}
        />
      )}
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.background,
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconTextContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  iconContainer: {
    borderRadius: theme.size_rounded.sm,
    padding: 5,
  },
  text: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Body,
    width: "67%",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: theme.text.placeHolderLight,
  },
}));
