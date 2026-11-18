import { NavArrowLeft, NavArrowRight } from "iconoir-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import { styles } from "./datePickerStyles";

export type DatePickerCardProps = {
  headerTitle?: string;
  onPrev?: () => void;
  onNext?: () => void;
  canNavigateHeader?: boolean;
  onHeaderTitlePress?: () => void;
  inline?: boolean;
  children: React.ReactNode;
};

export function DatePickerCard({
  headerTitle,
  onPrev,
  onNext,
  canNavigateHeader = false,
  onHeaderTitlePress,
  inline = false,
  children,
}: DatePickerCardProps) {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.card, inline && styles.cardInline]}>
      {headerTitle ? (
        <View style={styles.header}>
          {onPrev ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous"
              onPress={onPrev}
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.navButtonPressed,
              ]}
            >
              <NavArrowLeft
                width={18}
                height={18}
                color={theme.text.Body}
                strokeWidth={2}
              />
            </Pressable>
          ) : (
            <View style={{ width: 38 }} />
          )}

          <Pressable
            disabled={!canNavigateHeader}
            onPress={onHeaderTitlePress}
            style={({ pressed }) => [
              styles.headerTitleContainer,
              canNavigateHeader && pressed && styles.headerTitlePressed,
            ]}
          >
            <Text
              style={[
                styles.headerTitleText,
                canNavigateHeader && styles.headerTitleInteractive,
              ]}
            >
              {headerTitle}
            </Text>
          </Pressable>

          {onNext ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next"
              onPress={onNext}
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.navButtonPressed,
              ]}
            >
              <NavArrowRight
                width={18}
                height={18}
                color={theme.text.Body}
                strokeWidth={2}
              />
            </Pressable>
          ) : (
            <View style={{ width: 38 }} />
          )}
        </View>
      ) : null}

      {children}
    </View>
  );
}
