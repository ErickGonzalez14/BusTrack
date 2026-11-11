import type { BusinessListing } from "@/Services/request.service";
import { Marker } from "react-native-maps";

type BusinessProMarkerProps = {
  business: BusinessListing;
  onPress: (business: BusinessListing) => void;
};

const getMarkerLogo = (logoUrl: string | null | undefined) => {
  if (!logoUrl) return null;
  const uploadPath = "/image/upload/";
  if (!logoUrl.startsWith("https://res.cloudinary.com/") || !logoUrl.includes(uploadPath)) {
    return null;
  }
  return logoUrl.replace(uploadPath, `${uploadPath}c_fill,w_96,h_96,r_max,f_png/`);
};

export default function BusinessProMarker({ business, onPress }: BusinessProMarkerProps) {
  const logo = getMarkerLogo(business.logoUrl);

  return (
    <Marker
      coordinate={business.adress}
      title={business.businessName}
      description="Negocio Pro · Toca para más información"
      zIndex={8}
      onPress={() => onPress(business)}
      image={logo ? { uri: logo } : undefined}
      pinColor={logo ? undefined : "#F59E0B"}
    />
  );
}
