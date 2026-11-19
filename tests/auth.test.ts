import {
  completeProfileSchema,
  signInSchema,
  signUpSchema,
} from "@/src/features/auth/domain/auth.schema";

const registration = {
  email: "ana@example.com",
  password: "segura123",
  nickname: "ana_ñ",
  fullName: "Ana Pérez",
};

describe("Autenticación", () => {
  test("acepta un registro con un nombre de usuario acentuado", () => {
    expect(signUpSchema.parse(registration)).toEqual(registration);
  });

  test.each([
    ["email", "correo-invalido"],
    ["password", "1234567"],
    ["nickname", "ana pérez"],
    ["fullName", "An"],
  ])("marca el campo %s cuando recibe %s", (field, value) => {
    const result = signUpSchema.safeParse({ ...registration, [field]: value });
    expect(result.error?.issues).toEqual([expect.objectContaining({ path: [field] })]);
  });

  test("recorta el correo de inicio de sesión y conserva la contraseña literal", () => {
    expect(signInSchema.parse({ email: " ana@example.com ", password: " clave " }))
      .toEqual({ email: "ana@example.com", password: " clave " });
  });

  test("rechaza una contraseña vacía y campos ajenos al inicio de sesión", () => {
    expect(signInSchema.safeParse({ email: registration.email, password: "" }).success).toBe(false);
    expect(signInSchema.safeParse({ ...registration }).success).toBe(false);
  });

  test("recorta el perfil y valida la longitud máxima del nombre de usuario", () => {
    expect(completeProfileSchema.parse({ nickname: " ana_ñ ", fullName: " Ana Pérez " }))
      .toEqual({ nickname: "ana_ñ", fullName: "Ana Pérez" });
    expect(completeProfileSchema.safeParse({
      nickname: "a".repeat(31), fullName: registration.fullName,
    }).error?.issues).toEqual([expect.objectContaining({ path: ["nickname"] })]);
  });
});
