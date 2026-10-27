import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type ProductCardProps = {
  title: string;
  description: string;
  img: string;
  cardType: "product" | "discount" | "service";
  color: string;
  price: string;
  currentPrice?: string;
  lastPrice?: string;
};
type ColorAdjustment = {
  saturation?: number;
  lightness?: number;
};

const hexToHsl = (hex: string): [number, number, number] => {
  const normalizedHex = hex.replace("#", "");

  const red = parseInt(normalizedHex.slice(0, 2), 16) / 255;
  const green = parseInt(normalizedHex.slice(2, 4), 16) / 255;
  const blue = parseInt(normalizedHex.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;
  const difference = max - min;

  if (difference !== 0) {
    saturation =
      lightness > 0.5 ? difference / (2 - max - min) : difference / (max + min);

    switch (max) {
      case red:
        hue = (green - blue) / difference + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / difference + 2;
        break;
      default:
        hue = (red - green) / difference + 4;
        break;
    }

    hue /= 6;
  }

  return [hue * 360, saturation * 100, lightness * 100];
};

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  const hueToRgb = (p: number, q: number, t: number) => {
    let normalizedT = t;

    if (normalizedT < 0) normalizedT += 1;
    if (normalizedT > 1) normalizedT -= 1;
    if (normalizedT < 1 / 6) {
      return p + (q - p) * 6 * normalizedT;
    }
    if (normalizedT < 1 / 2) {
      return q;
    }
    if (normalizedT < 2 / 3) {
      return p + (q - p) * (2 / 3 - normalizedT) * 6;
    }

    return p;
  };

  let red = l;
  let green = l;
  let blue = l;

  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    red = hueToRgb(p, q, h + 1 / 3);
    green = hueToRgb(p, q, h);
    blue = hueToRgb(p, q, h - 1 / 3);
  }

  const toHex = (value: number) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
};

const adjustColor = (
  color: string,
  { saturation = 0, lightness = 0 }: ColorAdjustment = {},
) => {
  const [hue, currentSaturation, currentLightness] = hexToHsl(color);

  return hslToHex(
    hue,
    Math.max(0, Math.min(100, currentSaturation + saturation)),
    Math.max(0, Math.min(100, currentLightness + lightness)),
  );
};
export default function ProductCard({
  title,
  description,
  img,
  cardType,
  color,
  price,
  currentPrice,
  lastPrice,
}: ProductCardProps) {
  const { theme } = useUnistyles();
  const lighterColor = adjustColor(color, {
    lightness: 12,
  });

  const darkerColor = adjustColor(color, {
    lightness: -10,
  });

  const moreSaturatedColor = adjustColor(color, {
    saturation: 15,
  });

  return (
    <View>
      <LinearGradient
        colors={[darkerColor, lighterColor]}
        style={styles.container}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        locations={[0, 0.7]}
      >
        <LinearGradient
          colors={[darkerColor, lighterColor]}
          style={[styles.circle, styles.circle1]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          locations={[0, 0.7]}
        />

        <LinearGradient
          colors={[darkerColor, lighterColor]}
          style={[styles.circle, styles.circle2]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          locations={[0, 0.7]}
        />

        <LinearGradient
          colors={[darkerColor, lighterColor]}
          style={[styles.circle, styles.circle3]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          locations={[0, 0.7]}
        />

        <View style={styles.contentContainer}>
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {title}
            </Text>
            <Text style={styles.description}> {description} </Text>
            {cardType === "product" || cardType === "service" ? (
              <Text style={styles.price}>{price}</Text>
            ) : cardType === "discount" ? (
              <View style={styles.pricesContainer}>
                <Text style={styles.previousPrice}>{lastPrice}</Text>
                <Text style={styles.currentPrice}>{currentPrice}</Text>
              </View>
            ) : null}
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
    width: 350,
    height: 160,
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
    width: "70%",
    textAlign: "left",
    paddingBottom: 15,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  price: {
    fontSize: 16,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Secondary,
  },
  previousPrice: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: theme.text.Secondary,
    textDecorationLine: "line-through",
  },
  currentPrice: {
    fontSize: 16,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Secondary,
  },
  pricesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoContainer: {
    flex: 1,
  },
}));
