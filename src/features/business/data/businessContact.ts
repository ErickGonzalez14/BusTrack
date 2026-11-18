import { getBusinessId } from "@/src/features/business/data/businessProfile";
import { doc, getDoc, getFirestore, updateDoc } from "@react-native-firebase/firestore";
import { uploadImageToCloudinary } from "@/src/shared/lib/uploadImage.service";
import { type Publication } from "@/src/features/business/data/businessPublications";

export const editBusinessLogo = async (
  businessId: string,
  newLogoUrl: string,
) => {
  const db = getFirestore();
  const logoUrl = await uploadImageToCloudinary(newLogoUrl);

  await updateDoc(doc(db, "business", businessId), {
    logoUrl,
  });

  return {
    success: true,
    message: "Logo actualizado correctamente",
    logoUrl,
  };
};

export const getBusinessLogo = async (
  userId: string,
): Promise<string | null> => {
  const db = getFirestore();
  const businessId = await getBusinessId(userId);
  const businessSnapshot = await getDoc(doc(db, "business", businessId));

  if (!businessSnapshot.exists()) {
    throw new Error("No se encontró el negocio.");
  }

  const data = businessSnapshot.data();

  return typeof data.logoUrl === "string" ? data.logoUrl : null;
};

export type BusinessInfo = {
  phoneNumber: string;
  adressDescription: string;
};

export const updateBusinessPhone = async (
  businessId: string,
  phoneNumber: string,
) => {
  const db = getFirestore();
  await updateDoc(doc(db, "business", businessId), {
    phoneNumber: phoneNumber,
  });
  return {
    success: true,
    message: "Número de teléfono actualizado correctamente",
    phoneNumber,
  };
};

export const updateBusinessAddressDescription = async (
  businessId: string,
  adressDescription: string,
) => {
  const db = getFirestore();
  await updateDoc(doc(db, "business", businessId), {
    adressDescription: adressDescription,
  });
  return {
    success: true,
    message: "Descripción de la dirección actualizada correctamente",
    adressDescription,
  };
};

export type PublicationBusiness = {
  id: string;
  businessName: string;
  logoUrl?: string | null;
  phoneNumber?: string;
};

export const getBusinessFromPublication = async (
  publication: Pick<Publication, "businessId">,
): Promise<PublicationBusiness> => {
  const businessSnapshot = await getDoc(
    doc(getFirestore(), "business", publication.businessId),
  );

  if (!businessSnapshot.exists()) {
    throw new Error("No se encontró el negocio de esta publicación.");
  }

  const data = businessSnapshot.data();

  return {
    id: businessSnapshot.id,
    businessName: data.businessName,
    logoUrl: data.logoUrl ?? null,
    phoneNumber: data.phoneNumber,
  };
};
