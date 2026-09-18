import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type FavoriteCardProps = {
  routeName: string;
  onPress?: () => void;
};

export default function FavoriteCard({
  routeName,
  onPress,
}: FavoriteCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={["#ffffff8e", "#ffffff00"]}
        style={[styles.circle, styles.circlePosition]}
        locations={[0, 0.9]}
        start={{ x: 1, y: 0 }}
      />
      <LinearGradient
        colors={["#ffffff8e", "#ffffff00"]}
        style={[styles.smallCircle, styles.circlePosition1]}
        locations={[0, 0.9]}
        start={{ x: 0, y: 1 }}
      />

      <Image
        source={require("../../../assets/icons/fluentHeart.svg")}
        style={styles.icon}
      />
      <View>
        <Text style={styles.routeName} numberOfLines={1} ellipsizeMode="tail">
          {routeName}
        </Text>
      </View>
    </Pressable>
  );
}

export const styles = StyleSheet.create((theme) => ({
  gradient: {
    padding: 45,
  },
  container: {
    backgroundColor: "#FE585A",
    paddingTop: 40,
    paddingBottom: 50,
    paddingLeft: 10,
    paddingRight: 70,
    overflow: "hidden",
    borderRadius: theme.size_rounded.md,
  },
  circle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  smallCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 200,
  },
  circlePosition: {
    top: 60,
    left: 88,
    borderWidth: 0.5,
    borderColor: "#ffffff82",
  },
  circlePosition1: {
    top: -100,
    left: 100,
    borderWidth: 0.5,
    borderColor: "#ffffff82",
  },
  icon: {
    width: 50,
    height: 50,
    position: "absolute",
    top: 70,
    left: 110,
  },
  routeName: {
    maxWidth: 140,
    fontFamily: theme.fonts.heavy,
    fontSize: 20,
    color: theme.text.Secondary,
  },
}));
