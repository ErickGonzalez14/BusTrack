import { Pressable, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";
import { StyleSheet } from "react-native-unistyles";

type TripCardProps = {
  destination?: string;
  distanceKm?: number | string;
  duration?: string;
  ratingAverage?: number;
  ratingCount?: number;
  onPress?: () => void;
};

function MapArtwork() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 270 180" accessible={false}>
      <Defs>
        <SvgGradient id="mapFade" x1="0" y1="1" x2="0.8" y2="0">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="0.58" stopColor="#FFFFFF" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </SvgGradient>
      </Defs>

      <G fill="none" stroke="#E7EAED" strokeWidth="2">
        <Path d="M9 132 75 76 111 16 165 -13" />
        <Path d="M28 151 97 94 144 30 207 -8" />
        <Path d="M58 177 117 127 159 62 234 -2" />
        <Path d="M112 184 157 142 187 91 272 37" />
        <Path d="M169 183 211 145 268 102" />
        <Path d="M28 112 78 156 112 179" />
        <Path d="M59 84 128 133 174 166" />
        <Path d="M87 46 158 99 217 140" />
        <Path d="M121 10 190 56 263 98" />
        <Path d="M171 -4 227 38 270 71" />
      </G>

      <G fill="#CDEEDB" opacity="0.85">
        <Path d="m155 100 12 -8 10 14 -12 8z" />
        <Path d="m205 79 8 -5 8 9 -8 6z" />
        <Path d="m238 32 6 -5 8 10 -6 5z" />
        <Path d="m124 146 10 -6 8 10 -10 6z" />
      </G>

      <Path
        d="M5 130 76 61 105 10 158 42 173 48"
        fill="none"
        stroke="#B7D4FF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M173 48 C191 54 188 78 199 95 S224 110 243 123"
        fill="none"
        stroke="#BFC3C8"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <Circle cx="176" cy="49" r="15" fill="#FFFFFF" />
      <Circle cx="176" cy="49" r="10" fill="#73A8FA" />
      <Rect x="0" y="0" width="270" height="180" fill="url(#mapFade)" />
    </Svg>
  );
}

export default function TripCard({
  destination = "Playa La Barqueta",
  distanceKm = "20.15",
  duration = "2h",
  ratingAverage,
  ratingCount,
  onPress,
}: TripCardProps) {
  return (
    <Pressable
      style={styles.shadow}
      accessible
      accessibilityLabel={`${destination}, ${distanceKm} kilómetros, tiempo ${duration}`}
      onPress={onPress}
    >
      <View style={[styles.card, ratingCount !== undefined && styles.ratedCard]}>
        <View style={styles.map} pointerEvents="none">
          <MapArtwork />
        </View>

        <Text style={styles.destination} numberOfLines={2}>
          {destination}
        </Text>

        <Text style={styles.distance} numberOfLines={1}>
          {distanceKm}
          <Text style={styles.distanceUnit}>Km</Text>
        </Text>

        <View style={styles.details}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Tiempo</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {duration}
            </Text>
          </View>
        </View>
        {ratingCount !== undefined && (
          <Text style={styles.rating}>★ {ratingCount ? ratingAverage?.toFixed(1) : "Nuevo"} · {ratingCount} valoraciones</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  shadow: {
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    shadowColor: "#101820",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 7,
  },
  card: {
    width: 270,
    height: 200,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 26,
    paddingTop: 25,
    paddingBottom: 23,
  },
  ratedCard: { height: 225 },
  map: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 220,
    height: 130,
    opacity: 0.92,
  },
  destination: {
    maxWidth: "80%",
    color: "#090A0B",
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
  },
  distance: {
    marginTop: 29,
    color: "#484D52",
    fontFamily: theme.fonts.heavy,
    fontSize: 36,
  },
  distanceUnit: {
    fontSize: 16,
    lineHeight: 34,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 22,
  },
  detail: {
    minWidth: 0,
    maxWidth: "50%",
  },
  detailLabel: {
    color: "#484D52",
    fontFamily: theme.fonts.heavy,
    fontSize: 16,
    lineHeight: 26,
  },
  detailValue: {
    color: "#4D7CFE",
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    lineHeight: 27,
  },
  rating: { color: "#B9780E", fontFamily: theme.fonts.regular, fontSize: 12, marginTop: 3 },
}));
