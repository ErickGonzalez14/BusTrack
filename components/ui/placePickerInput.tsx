import { GooglePlace, PlaceSuggestion } from "@/interfaces/transport.type";
import { getPlaceDetails, searchPlaces } from "@/Services/places.service";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type Props = {
  placeholder: string;
  value: GooglePlace | null;
  onChange: (place: GooglePlace | null) => void;
};

export default function PlacePickerInput({
  placeholder,
  value,
  onChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revision = useRef(0);

  useEffect(() => {
    if (value) setQuery(value.name);
  }, [value]);

  useEffect(() => {
    if (!focused || query.trim().length < 2 || value) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const results = await searchPlaces(
          query,
          undefined,
          controller.signal,
        );
        if (!controller.signal.aborted) setSuggestions(results);
      } catch (reason) {
        if (!controller.signal.aborted) setError((reason as Error).message);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 450);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [focused, query, value]);

  async function select(suggestion: PlaceSuggestion) {
    const request = ++revision.current;
    setFocused(false);
    setSuggestions([]);
    setLoadingPlace(true);
    setError(null);
    try {
      const place = await getPlaceDetails(suggestion.id, suggestion);
      if (request === revision.current) onChange(place);
    } catch (reason) {
      if (request === revision.current) setError((reason as Error).message);
    } finally {
      if (request === revision.current) setLoadingPlace(false);
    }
  }
  const { theme } = useUnistyles();
  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.text.placeholder}
        accessibilityLabel={placeholder}
        value={query}
        onFocus={() => setFocused(true)}
        onChangeText={(text) => {
          revision.current += 1;
          setQuery(text);
          setFocused(true);
          setSuggestions([]);
          setLoadingPlace(false);
          setError(null);
          if (value) onChange(null);
        }}
      />
      {(searching || loadingPlace) && (
        <ActivityIndicator style={styles.loader} />
      )}
      {focused &&
        suggestions.map((suggestion) => (
          <Pressable
            key={suggestion.id}
            style={styles.suggestion}
            onPress={() => void select(suggestion)}
          >
            <Text style={styles.name}>{suggestion.name}</Text>
            {suggestion.secondaryText && (
              <Text style={styles.secondary}>{suggestion.secondaryText}</Text>
            )}
          </Pressable>
        ))}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  input: {
    backgroundColor: theme.surface.background,
    color: theme.text.Body,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  loader: { marginTop: 8 },
  suggestion: {
    padding: 12,
    backgroundColor: theme.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.surface.neutral,
  },
  name: { color: theme.text.Body, fontFamily: theme.fonts.heavy },
  secondary: {
    color: theme.text.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
  },
  error: { color: "#B42318", marginTop: 6 },
}));
