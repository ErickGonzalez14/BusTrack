import SearchBar from "@/components/ui/searchBar";
import { PlaceSuggestion } from "@/interfaces/transport.type";
import { MapPin } from "iconoir-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type MapSearchOverlayProps = {
  value: string;
  suggestions: PlaceSuggestion[];
  isSearching: boolean;
  hasSearched: boolean;
  searchError: string | null;
  showSuggestions: boolean;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onSubmit: () => void;
  onSelect: (suggestion: PlaceSuggestion) => void;
};

export default function MapSearchOverlay({
  value,
  suggestions,
  isSearching,
  hasSearched,
  searchError,
  showSuggestions,
  onChangeText,
  onFocus,
  onSubmit,
  onSelect,
}: MapSearchOverlayProps) {
  const { theme } = useUnistyles();

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
          <View style={styles.results}>
            {isSearching && suggestions.length === 0 ? (
              <ActivityIndicator style={styles.loader} />
            ) : suggestions.length === 0 ? (
              <Text style={searchError ? styles.error : styles.empty}>
                {searchError || "No encontramos lugares."}
              </Text>
            ) : (
              <>
                {suggestions.map((suggestion) => (
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
                ))}
                {isSearching && (
                  <ActivityIndicator style={styles.refreshLoader} />
                )}
              </>
            )}
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
    elevation: 10,
  },
  results: {
    marginTop: 6,
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
