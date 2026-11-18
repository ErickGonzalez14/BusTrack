import type { Stop } from "@/src/features/transit-map/domain/stop.type";
import { Modal, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { CommunityRoute, CommunityTrip } from "../data/community.service";

type CommunityDetailsModalProps = {
  visible: boolean;
  displayedItem: CommunityRoute | CommunityTrip | null;
  selectedRoute: CommunityRoute | null;
  selectedTrip: CommunityTrip | null;
  availableStops: Stop[];
  userId?: string;
  myRating: number | null;
  saving: boolean;
  onClose: () => void;
  onRate: (value: number) => Promise<void>;
};

export function CommunityDetailsModal({
  visible, displayedItem, selectedRoute, selectedTrip, availableStops,
  userId, myRating, saving, onClose, onRate,
}: CommunityDetailsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.detailCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{displayedItem?.title}</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.link}>Cerrar</Text>
            </Pressable>
          </View>
          <Text style={styles.body}>{displayedItem?.description}</Text>
          {selectedRoute && (
            <Text style={styles.body}>
              {selectedRoute.city} · {selectedRoute.stopIds.length} paradas ·{" "}
              {selectedRoute.direction === "outbound" ? "Ida" : "Regreso"}
            </Text>
          )}
          {selectedRoute && (
            <Text style={styles.body}>
              {selectedRoute.stopIds
                .map(
                  (id) =>
                    availableStops.find((stop) => stop.id === id)?.name ?? id,
                )
                .join(" → ")}
            </Text>
          )}
          {selectedTrip && (
            <Text style={styles.body}>
              {selectedTrip.origin} → {selectedTrip.destination}
            </Text>
          )}
          <Text style={styles.label}>
            ★{" "}
            {displayedItem?.ratingCount
              ? displayedItem.ratingAverage.toFixed(1)
              : "Sin valoraciones"}{" "}
            ({displayedItem?.ratingCount ?? 0})
          </Text>
          {displayedItem?.authorId === userId ? (
            <Text style={styles.body}>
              No puedes valorar tu propia publicación.
            </Text>
          ) : (
            <>
              <Text style={styles.body}>
                {myRating ? `Tu valoración: ${myRating}` : "Valora de 1 a 5"}
              </Text>
              <View style={styles.choiceRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Pressable
                    key={value}
                    disabled={saving}
                    onPress={() => void onRate(value)}
                  >
                    <Text
                      style={[
                        styles.star,
                        myRating !== null &&
                          value <= myRating &&
                          styles.activeStar,
                      ]}
                    >
                      ★
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
    flexShrink: 1,
  },
  link: {
    fontSize: 14,
    fontFamily: theme.fonts.heavy,
    color: theme.surface.brand,
  },
  body: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.text.Body,
    marginBottom: 9,
  },
  label: {
    fontSize: 15,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
    marginTop: 18,
    marginBottom: 10,
  },
  choiceRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  overlay: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "center",
    padding: 20,
  },
  detailCard: {
    backgroundColor: theme.surface.background,
    borderRadius: 22,
    padding: 22,
  },
  star: { fontSize: 32, color: "#BDC3CF" },
  activeStar: { color: "#E8A22A" },
}));
