import AlternativeHeader from "@/components/Headers/alternativeHeader";
import ButtonPrimary from "@/components/ui/buttons/buttonPrimary";
import ChipButton from "@/components/ui/buttons/chipButton";
import ReminderCard from "@/components/ui/Cards/reminderCard";
import TimePickerCard from "@/components/ui/Cards/timePickerCard";
import DropDown from "@/components/ui/dropDown";
import InputText from "@/components/ui/inputText";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
export default function CreateRoutine() {
  const example = [
    { id: "1", label: "Ruta 1" },
    { id: "2", label: "Ruta 2" },
  ];
  return (
    <View>
      <AlternativeHeader SettingName="Crear rutina" />
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.text}>Nombre de la Rutina</Text>
          <InputText placeholder="Nombre de la rutina" />
          <Text style={styles.text}>Escoje una Ruta Favorita</Text>
          <DropDown label="Selecciona una ruta" options={example} />
          <Text style={styles.text}>Días Activos de la Rutina</Text>
          <View style={styles.daysContainer}>
            <ChipButton name="L" />
            <ChipButton name="M" />
            <ChipButton name="X" />
            <ChipButton name="J" />
            <ChipButton name="V" />
            <ChipButton name="S" />
            <ChipButton name="D" />
          </View>
          <Text style={styles.text}>Hora para Tomar el Bus</Text>
          <TimePickerCard />
          <Text style={styles.text}>Recordatorio</Text>
          <ReminderCard />
          <View style={styles.buttonContainer}>
            <ButtonPrimary text="Crear Rutina" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap",
  },
  text: {
    fontSize: 16,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
    marginBottom: 10,
    marginTop: 15,
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
}));
