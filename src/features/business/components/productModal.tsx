import { adjustColor } from "../domain/publicationColors";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet as NativeStyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

type ProductModalProps = {
  title: string;
  description: string;
  img: string;
  cardType: "product" | "discount" | "service";
  color: string;
  price: string;
  currentPrice?: string;
  lastPrice?: string;
  businessName?: string;
  businessLogo?: string;
  businessPhone?: string;
  businessStatus?: string;
  visible: boolean;
  onClose: () => void;
};
export default function ProductModal({
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
  businessStatus,
  visible,
  onClose,
}: ProductModalProps) {
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
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaProvider style={styles.backdrop}>
        <Pressable
          accessible={false}
          style={NativeStyleSheet.absoluteFill}
          onPress={onClose}
        />
        <SafeAreaView style={styles.centeredContent} pointerEvents="box-none">
          <LinearGradient
            colors={[darkerColor, lighterColor]}
            style={styles.container}
            start={{ x: 0.05, y: 0 }}
            end={{ x: 0.95, y: 1 }}
            locations={[0, 0.7]}
            accessibilityViewIsModal
          >
            <LinearGradient
              pointerEvents="none"
              colors={[darkerColor, lighterColor]}
              style={[styles.circle, styles.circle1]}
              start={{ x: 0.05, y: 0 }}
              end={{ x: 0.95, y: 1 }}
              locations={[0, 0.7]}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[darkerColor, lighterColor]}
              style={[styles.circle, styles.circle2]}
              start={{ x: 0.05, y: 0 }}
              end={{ x: 0.95, y: 1 }}
              locations={[0, 0.7]}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[darkerColor, lighterColor]}
              style={[styles.circle, styles.circle3]}
              start={{ x: 0.05, y: 0 }}
              end={{ x: 0.95, y: 1 }}
              locations={[0, 0.7]}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar detalles de la publicación"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
            >
              {img ? (
                <Image
                  source={{ uri: img }}
                  style={styles.productImage}
                  contentFit="contain"
                />
              ) : null}
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
              <Text style={styles.description}>{description}</Text>
              {cardType === "discount" ? (
                <View style={styles.pricesContainer}>
                  {lastPrice ? (
                    <Text style={styles.previousPrice}>{lastPrice}</Text>
                  ) : null}
                  {currentPrice ? (
                    <Text style={styles.price}>{currentPrice}</Text>
                  ) : null}
                </View>
              ) : price ? (
                <Text style={styles.price}>{price}</Text>
              ) : null}
              {businessStatus ? (
                <Text accessibilityLiveRegion="polite" style={styles.description}>
                  {businessStatus}
                </Text>
              ) : null}
              {businessLogo || businessName || businessPhone ? (
                <View style={styles.businessDetails}>
                  {businessLogo ? (
                    <Image
                      source={{ uri: businessLogo }}
                      style={styles.businessLogo}
                      contentFit="contain"
                    />
                  ) : null}
                  <View style={styles.businessText}>
                    {businessName ? (
                      <Text style={styles.title}>{businessName}</Text>
                    ) : null}
                    {businessPhone ? (
                      <Text style={styles.description}>{businessPhone}</Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </LinearGradient>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "100%",
    flexShrink: 1,
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
    right: -25,
    top: 70,
  },

  circle2: {
    right: 25,
    top: 120,
  },

  circle3: {
    right: -20,
    top: 100,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Secondary,
  },
  description: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.text.Secondary,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  content: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  price: {
    fontSize: 16,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Secondary,
  },
  previousPrice: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.text.Secondary,
    textDecorationLine: "line-through",
  },
  pricesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },
  businessDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.35)",
    paddingTop: 12,
  },
  businessText: {
    flex: 1,
    gap: 4,
  },
  productImage: {
    width: "100%",
    height: 160,
  },
  businessLogo: {
    width: 50,
    height: 50,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  closeButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    marginRight: 6,
  },

  closeButtonText: {
    fontSize: 28,
    color: theme.text.Secondary,
  },
}));
