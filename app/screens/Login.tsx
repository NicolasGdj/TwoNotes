import React, { useState, useRef, useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Text, View } from "../components/Themed";
import Recaptcha from "react-native-recaptcha-that-works";
import { getLogin, getToken, setLogin, setToken, AuthContext } from "../utils/creds";

export default function LoginScreen({ navigation }: any) {
  const [error, setError] = useState("");
  const [login, setLocalLogin] = useState("");
  const [password, setLocalPassword] = useState("");
  const { signIn } = React.useContext(AuthContext);

  const recaptcha = useRef();

  const retrieveStoredDatas = useCallback(async () => {
    const loginData = await getLogin();
    if (loginData) {
      setLocalLogin(loginData);
    }
    const token = await getToken();
    if (token) {
      signIn({ login: loginData, token: token });
    }
  }, []);

  useEffect(() => {
    retrieveStoredDatas();
  }, []);

  const submit = () => {
    recaptcha.current.open();
  };

  /**
   * Function to log the user in with the password and the captcha
   * @param captcha
   */
  async function login_user(captcha: any) {
    try {
      setError("");
      let req = await fetch("https://two-notes.herokuapp.com/api/users/login", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: login,
          password: password,
          captcha: captcha,
        }),
      });
      if (req.status === 200) {
        let data = await req.json();
        await setLogin(login);
        await setToken(data.token);
        signIn({ login: login, token: data.token });
      } else {
        let data = await req.json();
        setError(data.message);
      }
    } catch (err) {
      console.log(err);
      throw new Error("An error ocurred when login");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please login into your account</Text>
      {error === "" ? <></> : <Text style={styles.error}>{error}</Text>}

      <TextInput
        mode="outlined"
        style={styles.input}
        onChangeText={setLocalLogin}
        value={login}
        placeholder="Login"
      />
      <TextInput
        mode="outlined"
        style={styles.input}
        secureTextEntry={true}
        onChangeText={setLocalPassword}
        value={password}
        placeholder="Password"
      />
      <Recaptcha
        ref={recaptcha}
        siteKey="6Ldw4tofAAAAAGQtIaacKXkgVyMIqz0FxLlcrSLY"
        baseUrl="http://localhost"
        onVerify={login_user}
        size="normal"
      />
      <View style={styles.container}>
        <Button icon="logout" mode="outlined" onPress={submit}>
          login
        </Button>

        <Button icon="plus-circle" mode="outlined" onPress={() => navigation.navigate("Register")}>
          register
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
});
