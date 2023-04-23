import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Text, View } from "../components/Themed";

export default function CreateNoteScreen({ route, navigation }: any) {
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  let token = route.params.token;

  /**
   * Function to create a note with the API
   */
  async function create_note() {
    try {
      let req = await fetch("https://two-notes.herokuapp.com/api/notes", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({
          title: title,
        }),
      });
      if (req.status === 201) {
        navigation.navigate("Home");
      } else {
        let json = await req.json();
        setError(json.message);
      }
    } catch (err) {
      console.log(err);
      throw new Error("An error ocurred when create note");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Create a new Note</Text>
        {error === "" ? <></> : <Text style={styles.error}>{error}</Text>}
        <TextInput
          mode="outlined"
          style={styles.input}
          onChangeText={setTitle}
          value={title}
          placeholder="name"
        />

        <Button icon="plus-circle" style={styles.input} mode="outlined" onPress={create_note}>
          Create Note
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
    margin: 4,
    width: "98%",
  },
  name: {
    fontSize: 16,
    marginHorizontal: 5,
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
  list: {
    width: "100%",
    flexDirection: "column",
  },
  collaborator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 5,
    padding: 2,
    margin: 2,
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
  },
  buttonColab: {
    borderWidth: 0,
  },
  sectionTwoComponents: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    margin: 4,
    justifyContent: "center",
  },
  twoItems: {
    flex: 0.5,
    margin: 4,
  },
  twoItemsInput: {
    margin: 2,
    height: 35,
    flex: 0.8,
  },
  section: {
    flex: 0.3,
  },
  collaborators: {
    flex: 0.7,
  },
});
