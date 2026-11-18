import { useState } from "react";
import { padZero, parseTimeString, type TimeValue } from "./time";

type Options = {
  value?: string;
  onChange?: (timeString: string, details: TimeValue) => void;
  initialTime: string;
  is24Hour: boolean;
  disabled: boolean;
};

export function useTimeSelection({ value, initialTime, is24Hour, onChange, disabled }: Options) {
  const initialParsed = parseTimeString(value || initialTime, is24Hour);

  const [displayTime, setDisplayTime] = useState(value || initialTime);
  const [modalVisible, setModalVisible] = useState(false);

  // Estados temporales del modal mientras el usuario selecciona
  const [selectedHour, setSelectedHour] = useState(initialParsed.hours);
  const [selectedMinute, setSelectedMinute] = useState(initialParsed.minutes);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(
    initialParsed.period,
  );
  const [activeTab, setActiveTab] = useState<"hours" | "minutes">("hours");

  const openModal = () => {
    if (disabled) return;
    const current = parseTimeString(value || displayTime, is24Hour);
    setSelectedHour(current.hours);
    setSelectedMinute(current.minutes);
    setSelectedPeriod(current.period);
    setActiveTab("hours");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = () => {
    const hour = is24Hour
      ? selectedHour
      : selectedHour % 12 + (selectedPeriod === "PM" ? 12 : 0);
    const formatted = `${padZero(hour)}:${padZero(selectedMinute)}`;
    setDisplayTime(formatted);
    onChange?.(formatted, {
      hours: selectedHour,
      minutes: selectedMinute,
      period: selectedPeriod,
      formatted,
    });
    setModalVisible(false);
  };

  return {
    displayTime, modalVisible, selectedHour, selectedMinute, selectedPeriod, activeTab,
    setSelectedHour, setSelectedMinute, setSelectedPeriod, setActiveTab, openModal,
    closeModal, handleConfirm,
  };
}
