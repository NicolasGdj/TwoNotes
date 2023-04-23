import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Text, View } from "../components/Themed";
import { setLogin } from "../utils/creds";

export default function RegisterScreen({ navigation }: any) {
  const [login, setlogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /**
   * Function to register a new user
   */
  async function register() {
    setError("");
    try {
      let req = await fetch("https://two-notes.herokuapp.com/api/users/register", {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify({ username: login, password: password }),
      });
      console.log(req.status);

      if (req.status === 201) {
        await setLogin(login);
        navigation.navigate("Login");
      } else {
        setError("User already exist");
      }
    } catch (err) {
      throw new Error("An error ocurred when registering");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please complete this form to register</Text>
      {error === "" ? <></> : <Text style={styles.error}>{error}</Text>}

      <View style={styles.section}>
        <TextInput
          mode="outlined"
          style={styles.input}
          onChangeText={setlogin}
          value={login}
          placeholder="Login"
        />
      </View>
      <View style={styles.section}>
        <TextInput
          mode="outlined"
          style={styles.input}
          secureTextEntry={true}
          onChangeText={setPassword}
          value={password}
          placeholder="Password"
        />
      </View>
      <View style={styles.container}>
        <Button icon="login" mode="outlined" onPress={register}>
          Register
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    height: 40,
    margin: 12,
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  title: {
    padding: 4,
    margin: 4,
    backgroundColor: "rgba(50,50,50,.8)",
    color: "white",
    width: "100%",
    textAlign: "center",
    fontSize: 20,
  },
  button: {
    backgroundColor: "white",
  },
  section: {
    marginLeft: 10,
  },
});
