import { useSignUp } from "@/hooks/useSignUp";
import { useState } from "react";
import { Button, KeyboardAvoidingView, TextInput, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function Test() {
  const { mutate, isPending, error } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState("");

  const HandleRegister = () => {
    mutate(
      { email, password, nickname, fullName },
      {
        onSuccess: (userCredential) => {
          console.log(userCredential);
          console.log(userCredential.user.uid);
          alert(
            `UID: ${userCredential.user.uid} - ${"Usuario creado exitosamente"}`,
          );
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          placeholder="NickName"
          value={nickname}
          onChangeText={setNickname}
        />
        <TextInput
          placeholder="FullName"
          value={fullName}
          onChangeText={setFullName}
        />

        <Button
          title={isPending ? "Creando..." : "Registrarse"}
          onPress={HandleRegister}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.surface.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  inputs: {
    backgroundColor: theme.surface.inputs,
    padding: 10,
    marginBottom: 10,
    borderRadius: theme.size_rounded.md,
  },
}));
