import { Cloudinary } from "@cloudinary/url-gen";
import { unsignedUpload } from "cloudinary-react-native";
import Constants from "expo-constants";

const cloudinaryConfig = Constants.expoConfig?.extra;

const CLOUD_NAME = cloudinaryConfig?.cloudinaryCloudName;
const UPLOAD_PRESET = cloudinaryConfig?.cloudinaryUploadPreset;
const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUD_NAME,
  },
  url: {
    secure: true,
  },
});
export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
}
/**
  @param imageUri URI local del archivo
 * @returns La URL HTTPS segura de la imagen subida
 */
export const uploadImageToCloudinary = async (
  imageUri: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    unsignedUpload(cld, {
      file: imageUri,
      upload_preset: UPLOAD_PRESET,
      options: {
        resource_type: "image",
        folder: "bustrack/products",
      },
      callback: (error, response) => {
        if (error) {
          reject(
            new Error(error.message || "Error al subir la imagen a Cloudinary"),
          );
        } else if (response && response.secure_url) {
          resolve(response.secure_url);
        } else {
          reject(new Error("No se obtuvo una respuesta válida de Cloudinary"));
        }
      },
    });
  });
};
