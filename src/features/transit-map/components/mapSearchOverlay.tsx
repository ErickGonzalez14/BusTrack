import BusinessLightCard from "@/src/features/business/components/businessLightCard";
import SearchBar from "@/src/shared/ui/searchBar";
import { BusinessListing } from "@/src/features/business/data/businessDirectory";
import { Coordinate, PlaceSuggestion } from "@/src/features/transit-map/domain/transport.type";
import { distanceInMeters } from "@/src/features/transit-map/domain/mapRouting";
import { MapPin } from "iconoir-react-native";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type MapSearchOverlayProps = {
  value: string;
  suggestions: PlaceSuggestion[];
  lightBusinesses?: BusinessListing[];
  searchOrigin: Coordinate;
  isSearching: boolean;
  hasSearched: boolean;
  searchError: string | null;
  showSuggestions: boolean;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onSubmit: () => void;
  onSelect: (suggestion: PlaceSuggestion) => void;
  onSelectBusiness: (business: BusinessListing) => void;
};

/**
 * Intercala negocios Light cada 2 resultados de lugares.
 * Ejemplo: [lugar, lugar, LIGHT, lugar, lugar, LIGHT, ...]
 */
function buildInterleavedResults(
  suggestions: PlaceSuggestion[],
  lightBusinesses: BusinessListing[],
): ({ type: "place"; data: PlaceSuggestion } | { type: "light"; data: BusinessListing })[] {
  const result: (
    { type: "place"; data: PlaceSuggestion } | { type: "light"; data: BusinessListing }
  )[] = [];
  let lightIndex = 0;

  suggestions.forEach((s, i) => {
    result.push({ type: "place", data: s });
    // Insertar un negocio Light después de cada 2 sugerencias
    if (((i + 1) % 2 === 0 || i === suggestions.length - 1) && lightIndex < lightBusinesses.length) {
      result.push({ type: "light", data: lightBusinesses[lightIndex] });
      lightIndex++;
    }
  });

  return result;
}

export default function MapSearchOverlay({
  value,
  suggestions,
  lightBusinesses = [],
  searchOrigin,
  isSearching,
  hasSearched,
  searchError,
  showSuggestions,
  onChangeText,
  onFocus,
  onSubmit,
  onSelect,
  onSelectBusiness,
}: MapSearchOverlayProps) {
  const { theme } = useUnistyles();

  const query = value.trim().toLocaleLowerCase();
  const nearbyLightBusinesses = lightBusinesses
    .map((business) => ({
      business,
      distance: distanceInMeters(searchOrigin, business.adress),
    }))
    .filter(({ distance }) => distance <= 10000)
    .sort((a, b) => {
      const aMatches = a.business.businessName.toLocaleLowerCase().includes(query);
      const bMatches = b.business.businessName.toLocaleLowerCase().includes(query);
      return Number(bMatches) - Number(aMatches) || a.distance - b.distance;
    })
    .slice(0, 2)
    .map(({ business }) => business);
  const interleavedItems =
    suggestions.length > 0
      ? buildInterleavedResults(suggestions, nearbyLightBusinesses)
      : [];

  return (
    <View style={styles.container}>
      <SearchBar
        placeHolder="¿A dónde vamos hoy?"
        icon={require("@/assets/icons/search.svg")}
        value={value}
        onSearch={onChangeText}
        onFocus={onFocus}
        onSubmit={onSubmit}
      />

      {showSuggestions &&
        (isSearching || hasSearched || suggestions.length > 0) && (
          <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
            {isSearching && suggestions.length === 0 ? (
              <ActivityIndicator style={styles.loader} />
            ) : suggestions.length === 0 ? (
              <Text style={searchError ? styles.error : styles.empty}>
                {searchError || "No encontramos lugares."}
              </Text>
            ) : (
              <>
                {interleavedItems.map((item) => {
                  if (item.type === "light") {
                    return (
                      <BusinessLightCard
                        key={`light-${item.data.id}`}
                        business={item.data}
                        onPress={() => onSelectBusiness(item.data)}
                      />
                    );
                  }
                  const suggestion = item.data;
                  return (
                    <Pressable
                      key={suggestion.id}
                      style={styles.suggestion}
                      onPress={() => onSelect(suggestion)}
                    >
                      <MapPin
                        width={20}
                        height={20}
                        color={theme.surface.brand}
                      />
                      <View style={styles.textContainer}>
                        <Text style={styles.title}>{suggestion.name}</Text>
                        {suggestion.secondaryText && (
                          <Text style={styles.subtitle} numberOfLines={1}>
                            {suggestion.secondaryText}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
                {isSearching && (
                  <ActivityIndicator style={styles.refreshLoader} />
                )}
              </>
            )}
          </ScrollView>
        )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    top: 75,
    left: 16,
    right: 16,
    zIndex: 10,
    elevation: 10,
  },
  results: {
    marginTop: 6,
    maxHeight: 350,
    overflow: "hidden",
    borderRadius: theme.size_rounded.md,
    backgroundColor: theme.surface.background,
    borderWidth: 1,
    borderColor: theme.text.placeHolderLight,
  },
  loader: {
    paddingVertical: 18,
  },
  refreshLoader: {
    paddingVertical: 8,
  },
  empty: {
    padding: 16,
    fontFamily: theme.fonts.regular,
    color: theme.text.placeholder,
    textAlign: "center",
  },
  error: {
    padding: 16,
    fontFamily: theme.fonts.regular,
    color: "#C62828",
    textAlign: "center",
  },
  suggestion: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface.neutral,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
    color: theme.text.Body,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.text.placeholder,
  },
}));
