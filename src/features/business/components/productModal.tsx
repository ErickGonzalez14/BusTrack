import { adjustColor } from "../domain/publicationColors";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Modal, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
type ProductCardProps = {
  title: string;
  description: string;
  img: string;
  cardType: "product" | "discount" | "service";
  color: string;
  price: string;
  currentPrice?: string;
  lastPrice?: string;
  onPress?: () => void;
  businessName?: string;
  businessLogo?: string;
  businessPhone?: string;
  visible: boolean;
  onClose: () => void;
};
export default function ProductCatalog({
  title,
  description,
  img,
  cardType,
  color,
  price,
  currentPrice,
  lastPrice,
  businessName,
  businessLogo,
  businessPhone,
  visible,
  onClose,
}: ProductCardProps) {
  const lighterColor = adjustColor(color, {
    lightness: 12,
  });

  const darkerColor = adjustColor(color, {
    lightness: -10,
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose}>
        <Pressable onPress={() => {}}>
          <View style={styles.backdrop}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
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
                  <Text
                    style={styles.title}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {title}
                  </Text>
                  <Text
                    style={styles.description}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {description}
                  </Text>
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
                  <Image
                    source={{ uri: img }}
                    style={styles.productImage}
                    contentFit="contain"
                  />
                </View>
              </View>
              <View>
                <View style={styles.contentContainer}>
                  <Image
                    source={{ uri: businessLogo }}
                    style={styles.businessLogo}
                    contentFit="contain"
                  />
                  <Text style={styles.title}>{businessName}</Text>
                </View>

                <Text style={styles.description}>{businessPhone}</Text>
              </View>
            </LinearGradient>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    width: "90%",
    maxWidth: 350,
    minHeight: 220,
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
  productImage: {
    width: 120,
    height: 120,
  },
  businessLogo: {
    width: 50,
    height: 50,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 12,
    zIndex: 2,
  },

  closeButtonText: {
    fontSize: 28,
    color: theme.text.Secondary,
  },
}));
