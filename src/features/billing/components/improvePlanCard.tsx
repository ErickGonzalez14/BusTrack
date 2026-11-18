import ButtonPrimary from "@/src/shared/ui/buttons/buttonPrimary";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
export default function ImprovePlanCard() {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      <Text style={styles.bannerText}>Lleva tu Negocio al Siguiente Nivel</Text>
      <Text style={[styles.title, { color: theme.text.Body }]}>
        BusTrack Business Pro
      </Text>
      <Text style={[styles.description, { color: theme.text.Body }]}>
        Suma mayor visibilidad y atención prioritaria
      </Text>
      <ButtonPrimary text="Actualizar a Pro" onPress={() => {}} />
      <Text
        style={[styles.description, { color: theme.text.Body, marginTop: 10 }]}
      >
        Revisa el Precio y Las Condiciones antes de Pagar
      </Text>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface.background,
    borderRadius: theme.size_rounded.md,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.surface.brand,
  },
  title: {
    fontFamily: theme.fonts.heavy,
    fontSize: 18,
    marginBottom: 10,
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 10,
  },
  bannerText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.contrast,
    marginBottom: 10,
  },
}));
