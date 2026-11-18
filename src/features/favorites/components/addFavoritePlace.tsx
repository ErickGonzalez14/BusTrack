import ButtonPrimary from "@/src/shared/ui/buttons/buttonPrimary";
import { useMapLocation } from "@/src/features/transit-map/hooks/useMapLocation";
import { usePlaceSearch } from "@/src/features/transit-map/hooks/usePlaceSearch";
import {
  Coordinate,
  GooglePlace,
  PlaceSuggestion,
} from "@/src/features/transit-map/domain/transport.type";
import { MapPin, NavArrowRight } from "iconoir-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const DEFAULT_COORDINATE: Coordinate = {
  latitude: 8.4821,
  longitude: -82.6178,
};

export type AddFavoritePlaceData = {
  origin: {
    name: string;
    coordinate: Coordinate | null;
    isCurrentLocation: boolean;
  };
  destination: GooglePlace | null;
};

type AddFavoritePlaceProps = {
  defaultOriginName?: string;
  buttonText?: string;
  onHandle?: (data: AddFavoritePlaceData) => void;
  onSubmit?: (data: AddFavoritePlaceData) => void;
  onSelectDestination?: (place: GooglePlace) => void;
  style?: StyleProp<ViewStyle>;
};

export default function AddFavoritePlace({
  defaultOriginName = "Lugar Actual",
  buttonText = "Guardar",
  onHandle,
  onSubmit,
  onSelectDestination,
  style,
}: AddFavoritePlaceProps) {
  const { theme } = useUnistyles();
  const { userLocation } = useMapLocation();

  // Origen: "Lugar Actual" por defecto, guarda ubicación del usuario si no la cambia
  const [originText, setOriginText] = useState(defaultOriginName);
  const [isOriginCustom, setIsOriginCustom] = useState(false);
  const [savedOriginLocation, setSavedOriginLocation] =
    useState<Coordinate | null>(null);

  // Guarda la ubicación actual del usuario siempre y cuando no haya sido cambiada
  useEffect(() => {
    if (!isOriginCustom && userLocation) {
      setSavedOriginLocation(userLocation);
    }
  }, [userLocation, isOriginCustom]);

  // Manejo de cambio en el primer label
  const handleOriginChange = (text: string) => {
    setOriginText(text);
    // Si el texto sigue siendo igual al valor por defecto, mantenemos el flag de lugar actual
    if (text.trim() === defaultOriginName.trim()) {
      setIsOriginCustom(false);
      if (userLocation) setSavedOriginLocation(userLocation);
    } else {
      setIsOriginCustom(true);
    }
  };

  // Hook de búsqueda de lugares para el destino
  const placeSearch = usePlaceSearch({
    origin: userLocation ?? DEFAULT_COORDINATE,
    onFocusPlace: (place: GooglePlace) => {
      onSelectDestination?.(place);
    },
    onOpenSheet: () => {},
  });

  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    placeSearch.selectSuggestion(suggestion);
  };

  // Disparo del handle
  const handleTrigger = () => {
    const payload: AddFavoritePlaceData = {
      origin: {
        name: originText,
        coordinate: isOriginCustom ? null : savedOriginLocation,
        isCurrentLocation: !isOriginCustom,
      },
      destination: placeSearch.selectedPlace,
    };

    if (onHandle) {
      onHandle(payload);
    } else if (onSubmit) {
      onSubmit(payload);
    } else {
      console.log("Handle disparado en AddFavoritePlace:", payload);
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Contenedor principal de ruta (indicador visual + tarjetas) */}
      <View style={styles.routeContainer}>
        {/* Línea conectora e indicadores visuales a la izquierda */}
        <View style={styles.indicatorColumn}>
          <View style={styles.originDotOuter}>
            <View style={styles.originDotInner} />
          </View>
          <View style={styles.connectingLine} />
          <View style={styles.destinationDotOuter}>
            <View style={styles.destinationDotInner} />
          </View>
        </View>

        {/* Tarjetas de origen y destino a la derecha */}
        <View style={styles.cardsColumn}>
          {/* Primer Label: Lugar Actual */}
          <View style={styles.card}>
            <View style={styles.cardTextContainer}>
              <TextInput
                value={originText}
                onChangeText={handleOriginChange}
                placeholder="Origen"
                placeholderTextColor={theme.text.placeHolderLight}
                style={styles.cardTitleInput}
              />
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {!isOriginCustom
                  ? "Tu ubicación actual"
                  : "Ubicación personalizada"}
              </Text>
            </View>
            <NavArrowRight
              width={20}
              height={20}
              color={theme.text.placeHolderLight}
            />
          </View>

          {/* Segundo Label: Búsqueda de lugar (Destino) */}
          <View style={styles.card}>
            <View style={styles.cardTextContainer}>
              <TextInput
                value={placeSearch.searchText}
                onChangeText={placeSearch.onSearchTextChange}
                onFocus={placeSearch.onSearchFocus}
                placeholder="Escribe un lugar..."
                placeholderTextColor={theme.text.placeHolderLight}
                style={styles.cardTitleInput}
              />
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {placeSearch.selectedPlace?.address ||
                  (placeSearch.selectedPlace
                    ? "Lugar seleccionado"
                    : "Buscar destino")}
              </Text>
            </View>
            {placeSearch.isLoadingPlace ? (
              <ActivityIndicator size="small" color={theme.surface.primary} />
            ) : (
              <NavArrowRight
                width={20}
                height={20}
                color={theme.text.placeHolderLight}
              />
            )}
          </View>
        </View>
      </View>

      {/* Lista de sugerencias cuando el usuario escribe un lugar */}
      {placeSearch.showSuggestions &&
        (placeSearch.isSearching ||
          placeSearch.hasSearched ||
          placeSearch.suggestions.length > 0) && (
          <View style={styles.suggestionsContainer}>
            {placeSearch.isSearching && placeSearch.suggestions.length === 0 ? (
              <ActivityIndicator
                style={styles.suggestionsLoader}
                color={theme.surface.primary}
              />
            ) : placeSearch.suggestions.length === 0 ? (
              <Text
                style={
                  placeSearch.searchError
                    ? styles.suggestionsError
                    : styles.suggestionsEmpty
                }
              >
                {placeSearch.searchError || "No se encontraron lugares."}
              </Text>
            ) : (
              placeSearch.suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(suggestion)}
                >
                  <MapPin width={18} height={18} color={theme.surface.brand} />
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.suggestionTitle}>
                      {suggestion.name}
                    </Text>
                    {suggestion.secondaryText ? (
                      <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                        {suggestion.secondaryText}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

      {/* Botón para disparar el handle */}
      <View style={styles.buttonContainer}>
        <ButtonPrimary text={buttonText} onPress={handleTrigger} />
      </View>
    </View>
  );
}

// Export alternativo en camelCase por si se requiere importar con ese formato
export { AddFavoritePlace as addFavoritePlace };

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    width: "100%",
    paddingVertical: 10,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
    padding: 20,
    shadowColor: "#505F6F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  indicatorColumn: {
    width: 28,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 22,
  },
  originDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#1976D2",
    backgroundColor: theme.surface.background,
    alignItems: "center",
    justifyContent: "center",
  },
  originDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1976D2",
  },
  connectingLine: {
    flex: 1,
    width: 3,
    backgroundColor: "#00BCD4",
  },
  destinationDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#0F9D58",
    backgroundColor: theme.surface.background,
    alignItems: "center",
    justifyContent: "center",
  },
  destinationDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0F9D58",
  },
  cardsColumn: {
    flex: 1,
    gap: 12,
  },
  card: {
    minHeight: 64,
    backgroundColor: theme.surface.inputs,
    borderRadius: theme.size_rounded.md,
    borderWidth: 1,
    borderColor: theme.text.placeHolderLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#505F6F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitleInput: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Body,
    padding: 0,
    margin: 0,
  },
  cardSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.text.placeholder,
    marginTop: 2,
  },
  suggestionsContainer: {
    marginTop: 10,
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
    borderWidth: 1,
    borderColor: theme.text.placeHolderLight,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsLoader: {
    paddingVertical: 16,
  },
  suggestionsEmpty: {
    padding: 14,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.text.placeholder,
    textAlign: "center",
  },
  suggestionsError: {
    padding: 14,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: "#C62828",
    textAlign: "center",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.surface.neutral,
    gap: 10,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionTitle: {
    fontFamily: theme.fonts.heavy,
    fontSize: 14,
    color: theme.text.Body,
  },
  suggestionSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.text.placeholder,
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 16,
  },
}));
