import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import ButtonSecundary from "../buttons/buttonSecundary";

type ProductCardProps = {
  title: string;
  description: string;
  img: string;
};

export default function ProductCard({
  title,
  description,
  img,
}: ProductCardProps) {
  const { theme } = useUnistyles();
  return (
    <View>
      <LinearGradient
        colors={[theme.surface.primary, theme.icons.alternativeBrand]}
        style={styles.container}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        locations={[0, 0.7]}
      >
        <LinearGradient
          colors={[theme.icons.alternativeBrand, theme.surface.primary]}
          style={[styles.circle, styles.circle1]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          locations={[0, 0.7]}
        />

        <LinearGradient
          colors={[theme.icons.alternativeBrand, theme.surface.primary]}
          style={[styles.circle, styles.circle2]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          locations={[0, 0.7]}
        />

        <LinearGradient
          colors={[theme.icons.alternativeBrand, theme.surface.primary]}
          style={[styles.circle, styles.circle3]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          locations={[0, 0.7]}
        />

        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.title}> {title} </Text>
            <Text style={styles.description}> {description} </Text>
            <ButtonSecundary
              title="Ver Oferta"
              onPress={() => console.log("Ver Oferta")}
            />
          </View>
          <View>
            {/* Se debe poner el url que viene del cloudinary*/}
            <Image source={{ uri: img }} style={{ width: 100, height: 100 }} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    overflow: "hidden",
    borderRadius: theme.size_rounded.md,
  },
  circle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  circle1: {
    left: 275,
    top: 70,
  },

  circle2: {
    left: 225,
    top: 120,
  },

  circle3: {
    left: 270,
    top: 100,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Secondary,
    paddingBottom: 5,
  },
  description: {
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    color: theme.text.Secondary,
    width: 190,
    textAlign: "left",
    paddingBottom: 15,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },
}));
