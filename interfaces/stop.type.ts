export type Stop = {
  id: string;
  adress: {
    latitude: number;
    longitude: number;
  };
  city: string;
  district: string;
  name: string;
  province: string;
  villageId: string;
};
