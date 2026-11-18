import AlternativeHeader from "@/components/Headers/alternativeHeader";
import ButtonPrimary from "@/components/ui/buttons/buttonPrimary";
import ChipButton from "@/components/ui/buttons/chipButton";
import ReminderCard from "@/components/ui/Cards/reminderCard";
import TimePickerCard from "@/components/ui/Cards/timePickerCard";
import DropDown from "@/components/ui/dropDown";
import InputText from "@/components/ui/inputText";
import { useFavoriteSites } from "@/hooks/useFavoriteSites";
import { useRoutineRequest } from "@/hooks/useRoutine";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import AlertCard, {
  type AlertCardVariant,
} from "@/components/ui/Cards/alertCard";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
export default function CreateRoutine() {
  //Obtener las rutas favoritas del usuario
  const { sites, isLoading, error } = useFavoriteSites();

  //Handle routine submit data

  const [name, setName] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [recordatory, setRecordatory] = useState("5min");

  //state for Alert
  const [alert, setAlert] = React.useState<{
    variant: AlertCardVariant;
    title: string;
    message: string;
  } | null>(null);

  //array for days of the week
  const weekDays = [
    { id: "Lunes", label: "L" },
    { id: "Martes", label: "M" },
    { id: "Miercoles", label: "X" },
    { id: "Jueves", label: "J" },
    { id: "Viernes", label: "V" },
    { id: "Sábado", label: "S" },
    { id: "Domingo", label: "D" },
  ];

  //Hook para enviar la solicitud de crear rutina
  const { mutate, isPending, isError } = useRoutineRequest();

  //handle to close Alert
  const closeAlert = () => {
    const wasSuccessful = alert?.variant === "success";

    setAlert(null);

    if (wasSuccessful) {
      router.replace("/Settings/Favorites/favorite");
    }
  };

  //Handle Routine Submit
  const handleSubmit = async () => {
    if (!name || !selectedRoute || selectedDays.length === 0 || !selectedTime) {
      Alert.alert(
        "Por favor completa todos los campos antes de crear la rutina.",
      );
      return;
    }
    mutate(
      {
        name: name,
        route: selectedRoute,
        days: selectedDays,
        time: selectedTime,
        recordatory: recordatory,
      },
      {
        onSuccess: () => {
          setAlert({
            variant: "success",
            title: "Rutina guardada",
            message: "BusTrack usa tu última ubicación conocida para encontrar una parada cercana. Permite la ubicación y las notificaciones para recibir el aviso.",
          });
        },
        onError: (requestError) => {
          setAlert({
            variant: "error",
            title: "Error al enviar la solicitud",
            message:
              requestError instanceof Error
                ? requestError.message
                : "Ocurrió un error al enviar la solicitud. Por favor, inténtalo de nuevo.",
          });
        },
      },
    );
  };

  //handle for selecting days of the week
  const handleDaySelection = (dayId: string, selected: boolean) => {
    setSelectedDays((currentDay) => {
      if (selected) {
        return currentDay.includes(dayId) ? currentDay : [...currentDay, dayId];
      }
      return currentDay.filter((id) => id !== dayId);
    });
  };

  //construir un array de opciones para el dropdown
  const favoriteRoutes = sites.map((site) => ({
    id: site.id,
    label: site.name,
  }));

  return (
    <View style={styles.screen}>
      <AlternativeHeader SettingName="Crear rutina" onTouch={router.back} />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.viewContainer}
      >
        <View style={styles.container}>
          <Text style={styles.text}>Nombre de la Rutina</Text>
          <InputText
            placeholder="Nombre de la rutina"
            onChangeText={(text) => setName(text)}
          />
          <Text style={styles.text}>Escoje una Ruta Favorita</Text>
          <DropDown
            label="Selecciona una ruta"
            options={favoriteRoutes}
            onSelect={(selectedOption) => setSelectedRoute(selectedOption.id)}
          />
          <Text style={styles.text}>Días Activos de la Rutina</Text>
          {/* Botones de días de la semana-Mejorar disposicion */}
          <View style={styles.daysContainer}>
            {weekDays.map((day) => (
              <ChipButton
                key={day.id}
                name={day.label}
                selected={selectedDays.includes(day.id)}
                onSelectionChange={(_, selected) =>
                  handleDaySelection(day.id, selected)
                }
              />
            ))}
          </View>
          <Text style={styles.text}>Hora para Tomar el Bus</Text>
          <TimePickerCard
            value={selectedTime}
            onChange={(time) => setSelectedTime(time)}
          />
          <Text style={styles.text}>Recordatorio</Text>
          <ReminderCard
            value={recordatory}
            onChange={(reminder) => setRecordatory(reminder)}
          />
          <View style={styles.buttonContainer}>
            <ButtonPrimary
              text={isPending ? "Creando..." : "Crear Rutina"}
              onPress={handleSubmit}
            />
          </View>
        </View>
        <AlertCard
          buttonText={
            alert?.variant === "success" ? "Continuar" : "Intentar de nuevo"
          }
          message={alert?.message ?? ""}
          onClose={closeAlert}
          title={alert?.title ?? ""}
          variant={alert?.variant ?? "success"}
          visible={alert !== null}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
  },
  viewContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  container: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
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
