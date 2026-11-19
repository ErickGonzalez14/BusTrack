import { driverRequestSchema } from "@/src/features/tracking/domain/driverApplication.schema";

const application = {
  licensePlate: "AB1234",
  publicTransportPlate: "TP901",
  routeType: "urbana",
  routeId: "r1",
};

describe("Solicitud de conductor", () => {
  test("acepta la solicitud con placas alfanuméricas y una ruta", () => {
    expect(driverRequestSchema.parse(application)).toEqual(application);
  });

  test.each([
    ["licensePlate", "AB-1234"],
    ["publicTransportPlate", "TP 901"],
    ["routeType", ""],
    ["routeId", ""],
  ])("marca el campo inválido %s con valor %j", (field, value) => {
    const result = driverRequestSchema.safeParse({ ...application, [field]: value });
    expect(result.error?.issues).toEqual([expect.objectContaining({ path: [field] })]);
  });
});
