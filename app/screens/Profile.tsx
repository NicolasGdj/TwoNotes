import React, { useState, useRef, useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Text, View } from "../components/Themed";
import { setToken, AuthContext } from "../utils/creds";

export default function LoginScreen({ navigation }: any) {
  const { signOut } = React.useContext(AuthContext);

  const logout = async () => {
    await setToken("");
    signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your profile</Text>
      <View style={styles.container}>
        <Button icon="logout" mode="outlined" onPress={logout}>
          Logout
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
