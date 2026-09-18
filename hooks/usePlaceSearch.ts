import {
  Coordinate,
  GooglePlace,
  PlaceSuggestion,
} from "@/interfaces/transport.type";
import { normalizeCoordinate } from "@/lib/mapRouting";
import { getPlaceDetails, searchPlaces } from "@/Services/places.service";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard } from "react-native";

type UsePlaceSearchOptions = {
  origin: Coordinate;
  onFocusPlace: (place: GooglePlace) => void;
  onOpenSheet: () => void;
};

export function usePlaceSearch({
  origin,
  onFocusPlace,
  onOpenSheet,
}: UsePlaceSearchOptions) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchInputActive, setIsSearchInputActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null);
  const [isLoadingPlace, setIsLoadingPlace] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchOriginRef = useRef(origin);
  const placeRequestRevisionRef = useRef(0);

  useEffect(() => {
    if (!isSearchInputActive) searchOriginRef.current = origin;
  }, [isSearchInputActive, origin]);

  useEffect(() => {
    const query = searchText.trim();
    if (!isSearchInputActive || query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setHasSearched(false);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchPlaces(
          query,
          searchOriginRef.current,
          controller.signal,
        );
        setSuggestions(results);
        setHasSearched(true);
        setShowSuggestions(true);
      } catch (searchError) {
        if ((searchError as Error).name !== "AbortError") {
          setSuggestions([]);
          setHasSearched(true);
          setSearchError((searchError as Error).message);
          setShowSuggestions(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isSearchInputActive, searchText]);

  const openPlace = useCallback(
    async (placeId: string, fallback: Partial<GooglePlace>) => {
      const requestRevision = ++placeRequestRevisionRef.current;
      const fallbackCoordinate = normalizeCoordinate(fallback.coordinate);
      const fallbackPlace: GooglePlace | null = fallbackCoordinate
        ? {
            id: placeId,
            name: fallback.name || "Lugar seleccionado",
            coordinate: fallbackCoordinate,
            address: fallback.address,
            type: fallback.type,
          }
        : null;

      Keyboard.dismiss();
      setIsSearchInputActive(false);
      setShowSuggestions(false);
      setError(null);
      setIsLoadingPlace(true);
      setSelectedPlace(fallbackPlace);
      onOpenSheet();

      try {
        const place = await getPlaceDetails(placeId, fallback);
        if (requestRevision !== placeRequestRevisionRef.current) return;
        setSelectedPlace(place);
        setSearchText(place.name);
        onFocusPlace(place);
      } catch (placeError) {
        if (requestRevision !== placeRequestRevisionRef.current) return;
        if (!fallbackPlace) {
          setError((placeError as Error).message);
        } else {
          setError(
            "Se muestran los datos disponibles del mapa; no fue posible cargar los detalles adicionales.",
          );
          setSearchText(fallbackPlace.name);
          onFocusPlace(fallbackPlace);
        }
      } finally {
        if (requestRevision === placeRequestRevisionRef.current) {
          setIsLoadingPlace(false);
        }
      }
    },
    [onFocusPlace, onOpenSheet],
  );

  const onSearchTextChange = useCallback(
    (text: string) => {
      if (!isSearchInputActive) searchOriginRef.current = origin;
      setIsSearchInputActive(true);
      setSearchText(text);
      setShowSuggestions(true);
    },
    [isSearchInputActive, origin],
  );

  const onSearchFocus = useCallback(() => {
    searchOriginRef.current = origin;
    setIsSearchInputActive(true);
    setShowSuggestions(true);
  }, [origin]);

  const selectSuggestion = useCallback(
    (suggestion: PlaceSuggestion) => {
      void openPlace(suggestion.id, suggestion);
    },
    [openPlace],
  );

  const submitSearch = useCallback(() => {
    if (suggestions[0]) selectSuggestion(suggestions[0]);
  }, [selectSuggestion, suggestions]);

  const selectPlace = useCallback(
    (place: GooglePlace) => {
      placeRequestRevisionRef.current += 1;
      Keyboard.dismiss();
      setIsSearchInputActive(false);
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      setHasSearched(false);
      setSearchError(null);
      setError(null);
      setIsLoadingPlace(false);
      setSelectedPlace(place);
      setSearchText(place.name);
      onFocusPlace(place);
      onOpenSheet();
    },
    [onFocusPlace, onOpenSheet],
  );

  const clearSelectedPlace = useCallback(() => {
    placeRequestRevisionRef.current += 1;
    setSelectedPlace(null);
    setIsLoadingPlace(false);
    setError(null);
  }, []);

  return {
    searchText,
    suggestions,
    showSuggestions,
    isSearching,
    hasSearched,
    searchError,
    selectedPlace,
    isLoadingPlace,
    error,
    clearError: () => setError(null),
    clearSelectedPlace,
    hideSuggestions: () => setShowSuggestions(false),
    onSearchTextChange,
    onSearchFocus,
    submitSearch,
    selectPlace,
    selectSuggestion,
    openPlace,
  };
}
