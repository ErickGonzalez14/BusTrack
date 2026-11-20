import { useQuery } from "@tanstack/react-query";
import { Platform, useWindowDimensions } from "react-native";
import mobileAds, { BannerAd } from "react-native-google-mobile-ads";
import { usePremiumAdVisibility } from "../hooks/usePremiumAdVisibility";

const BANNER_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";

export default function PremiumAwareBanner() {
  const showAds = usePremiumAdVisibility();
  if (!showAds || (Platform.OS !== "android" && Platform.OS !== "ios")) return null;

  return <FreePlanBanner />;
}

function FreePlanBanner() {
  const { width } = useWindowDimensions();
  const ads = useQuery({
    queryKey: ["admob-initialized"],
    queryFn: () => mobileAds().initialize(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (!ads.isSuccess) return null;

  return (
    <BannerAd
      unitId={BANNER_UNIT_ID}
      size={`${Math.floor(width)}x50`}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    />
  );
}
