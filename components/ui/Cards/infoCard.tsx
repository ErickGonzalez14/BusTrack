import { NavArrowRight } from "iconoir-react-native";
import { ComponentType } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type InfoCardProps = {
  title: string;
  description: string;
  icon: ComponentType<any>;
  onPress?: () => void;
};

export default function InfoCard({
  title = "Aqui va el Titulo",
  description = "Aqui va la Descripcion",
  icon: Icon,
  onPress,
}: InfoCardProps) {
  const { theme } = useUnistyles();
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Icon width={30} height={30} color={"#ffff"} strokeWidth={2} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <NavArrowRight
        width={28}
        height={28}
        color={theme.text.placeholder}
        strokeWidth={2}
      />
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
    padding: 15,
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  imageContainer: {
    backgroundColor: theme.surface.brand,
    borderRadius: theme.size_rounded.md,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
  },
  description: {
    fontSize: 13,
    fontFamily: "Roboto_400Regular",
    color: theme.text.placeholder,
    flexshrink: 1,
    textAlign: "left",
  },
}));
