import { BusinessListing, BusinessPromotion } from "@/Services/request.service";
import { Xmark } from "iconoir-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type BusinessProPopupProps = {
  business: BusinessListing | null;
  visible: boolean;
  isNearby: boolean;
  promotion?: BusinessPromotion | null;
  onClose: () => void;
  onViewDetail: () => void;
};

/**
 * Popup emergente que aparece cuando el usuario se acerca
 * a menos de 500 m de un negocio con plan Pro, o cuando
 * el usuario toca el pin del negocio en el mapa.
 */
export default function BusinessProPopup({
  business,
  visible,
  isNearby,
  promotion,
  onClose,
  onViewDetail,
}: BusinessProPopupProps) {
  const { theme } = useUnistyles();
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 120,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  if (!business) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[styles.card, { transform: [{ translateY }], opacity }]}
        >
          {/* Pressable interior para evitar que el tap en la card cierre el popup */}
          <Pressable onPress={() => {}}>
            {/* Cabecera con logo y cerrar */}
            <View style={styles.header}>
              <View style={styles.logoRow}>
                {business.logoUrl ? (
                  <Image
                    source={{ uri: business.logoUrl }}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.logoFallback}>
                    <Text style={styles.logoInitial}>
                      {business.businessName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.nameBlock}>
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                  <Text style={styles.businessName} numberOfLines={2}>
                    {business.businessName}
                  </Text>
                </View>
              </View>
              <Pressable
                hitSlop={10}
                onPress={onClose}
                style={styles.closeButton}
              >
                <Xmark
                  width={20}
                  height={20}
                  color={theme.text.placeholder}
                />
              </Pressable>
            </View>

            {/* Cuerpo */}
            <View style={styles.body}>
              <Text style={styles.nearbyLabel}>
                {isNearby ? "📍 Estás cerca de este negocio" : "Negocio en el mapa"}
              </Text>
              <Text style={styles.description} numberOfLines={3}>
                {isNearby
                  ? "Este negocio se encuentra a menos de 500 metros de tu ubicación actual. ¡Visítalo hoy!"
                  : "Descubre este negocio en BusTrack."}
              </Text>
              {promotion && (
                <View style={styles.promotion}>
                  <Text style={styles.promotionTitle} numberOfLines={2}>{promotion.title}</Text>
                  <Text style={styles.description} numberOfLines={3}>{promotion.description}</Text>
                </View>
              )}
              <Pressable style={styles.detailButton} onPress={onViewDetail} accessibilityRole="button">
                <Text style={styles.detailButtonText}>Ver detalle</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 100,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  card: {
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.lg,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  logoFallback: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.surface.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInitial: {
    fontSize: 26,
    fontFamily: theme.fonts.heavy,
    color: "#FFFFFF",
  },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  proBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F59E0B",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  proBadgeText: {
    fontSize: 10,
    fontFamily: theme.fonts.heavy,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  businessName: {
    fontSize: 18,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
    lineHeight: 22,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    marginTop: 12,
    gap: 6,
  },
  promotion: {
    marginTop: 8,
    gap: 4,
  },
  promotionTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
  },
  detailButton: {
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: theme.surface.brand,
  },
  detailButtonText: {
    color: "#FFFFFF",
    fontFamily: theme.fonts.heavy,
    fontSize: 14,
  },
  nearbyLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.heavy,
    color: theme.surface.brand,
  },
  description: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: theme.text.placeholder,
    lineHeight: 20,
  },
}));
