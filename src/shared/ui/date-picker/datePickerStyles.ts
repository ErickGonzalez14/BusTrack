import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
  root: {
    width: "100%",
  },
  label: {
    fontFamily: theme.fonts.heavy,
    fontSize: 15,
    color: theme.text.Primary,
    marginBottom: 8,
  },
  triggerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.surface.inputs,
    borderRadius: theme.size_rounded.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.text.placeHolderLight,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  triggerPressed: {
    opacity: 0.85,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    maxWidth: "75%",
    flexShrink: 1,
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Body,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  popoverWrapper: {
    position: "absolute",
  },
  card: {
    width: "100%",
    backgroundColor: theme.surface.inputs,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#EBECEF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  cardInline: {
    shadowOpacity: 0.02,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECEEF2",
    backgroundColor: theme.surface.background,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonPressed: {
    backgroundColor: theme.surface.neutral,
  },
  headerTitleContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  headerTitlePressed: {
    backgroundColor: theme.surface.neutral,
  },
  headerTitleText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    color: theme.text.Primary,
    textAlign: "center",
  },
  headerTitleInteractive: {
    textDecorationLine: "underline",
    textDecorationColor: theme.text.placeHolderLight,
  },
  // Top Segmented Switch (Date | Time)
  topSegmentedContainer: {
    flexDirection: "row",
    backgroundColor: theme.surface.neutral,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  topSegmentedItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  topSegmentedItemActive: {
    backgroundColor: theme.surface.background,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  topSegmentedText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.text.placeHolderLight,
  },
  topSegmentedTextActive: {
    fontFamily: theme.fonts.heavy,
    color: theme.text.Primary,
  },
  // Grids
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  gridCell: {
    width: "31%",
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cellSelected: {
    backgroundColor: "#0F1115",
  },
  cellPressed: {
    backgroundColor: "#F1F3F5",
  },
  cellText: {
    width: "85%",
    flexShrink: 1,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.text.Body,
  },
  cellTextSelected: {
    fontFamily: theme.fonts.heavy,
    color: "#FFFFFF",
  },
  cellTextToday: {
    fontFamily: theme.fonts.heavy,
    color: theme.surface.brand,
  },
  // Day View
  dayViewContainer: {
    width: "100%",
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekDayCell: {
    width: "14.28%",
    alignItems: "center",
    justifyContent: "center",
  },
  weekDayText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 12,
    color: theme.text.placeHolderLight,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellContainer: {
    width: "14.28%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellSelected: {
    backgroundColor: "#0F1115",
  },
  dayCellText: {
    maxWidth: "100%",
    flexShrink: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.text.Body,
  },
  // Time View
  timeContainer: {
    width: "100%",
  },
  timeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timeSegmentsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeSegmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.surface.neutral,
  },
  timeSegmentActive: {
    backgroundColor: "#0F1115",
  },
  timeSegmentText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 18,
    color: theme.text.Body,
  },
  timeSegmentTextActive: {
    color: "#FFFFFF",
  },
  timeColon: {
    fontFamily: theme.fonts.heavy,
    fontSize: 20,
    color: theme.text.Primary,
  },
  ampmSwitchContainer: {
    flexDirection: "row",
    backgroundColor: theme.surface.neutral,
    borderRadius: 8,
    padding: 2,
  },
  ampmButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  ampmButtonActive: {
    backgroundColor: "#0F1115",
  },
  ampmText: {
    fontFamily: theme.fonts.heavy,
    fontSize: 13,
    color: theme.text.placeHolderLight,
  },
  ampmTextActive: {
    color: "#FFFFFF",
  },
}));
