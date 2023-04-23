import React, { useState, useCallback, useEffect, useLayoutEffect } from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Text, View } from "../components/Themed";
import { Note } from "../types";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";

export default function EditNoteScreen({ route, navigation }: any) {
  const [error, setError] = useState("");
  const [collab, setCollab] = useState("");
  const [collaborators, setCollaborators] = useState<any[]>([]);

  let token = route.params.token;
  let note: Note = route.params.note;
  const colorScheme = useColorScheme();

  // add button on the top right
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => retrieveStoredDatas()}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <FontAwesome5
            name="sync"
            size={25}
            color={Colors[colorScheme].text}
            style={{ marginRight: 15 }}
          />
        </Pressable>
      ),
    });
  });

  useEffect(() => {
    navigation.addListener("focus", () => {
      retrieveStoredDatas();
    });
  }, [navigation]);

  /**
   * function to edit collaborator rights on the note
   * @param item {username: string, writable: boolean}
   */
  async function editCollaborator(item: any) {
    try {
      let req = await fetch(
        "https://two-notes.herokuapp.com/api/notes/" + note.id + "/collaborators",
        {
          method: "PATCH",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({
            username: item.username,
            writable: !item.writable,
          }),
        }
      );

      if (req.status === 200) {
        setError("");
        loadCollaborators();
      }
      let json = await req.json();
      setError(json.message);
    } catch (err) {
      console.log(err);
      throw new Error("An error ocurred when editing a collaborator");
    }
  }

  /**
   * function to remove a collaborator from a note
   * @param item {username: string}
   */
  async function removeCollaborator(item: any) {
    try {
      let req = await fetch(
        "https://two-notes.herokuapp.com/api/notes/" + note.id + "/collaborators",
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({
            username: item.username,
          }),
        }
      );

      if (req.status === 200) {
        setError("");
        loadCollaborators();
      }
      let json = await req.json();
      setError(json.message);
    } catch (err) {
      console.log(err);
      throw new Error("An error ocurred when removing a collaborator");
    }
  }

  /**
   * function to add a collaborator to a note, the default write option is false.
   */
  async function addCollaborator() {
    try {
      let req = await fetch(
        "https://two-notes.herokuapp.com/api/notes/" + note.id + "/collaborators",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({
            username: collab,
            writable: false,
          }),
        }
      );
      if (req.status === 201) {
        setError("");
        loadCollaborators();
      }
      let json = await req.json();
      setError(json.message);
    } catch (err) {
      console.log(err);
      throw new Error("An error ocurred when adding a collaborator");
    }
  }

  /**
   * Function to load all the collaborators on the curent note open
   */
  async function loadCollaborators() {
    try {
      setError("");
      const req = await fetch(
        "https://two-notes.herokuapp.com/api/notes/" + note.id + "/collaborators",
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-access-token": token,
          },
        }
      );
      if (req.status === 200) {
        let data = (await req.json()).collaborators;
        setCollaborators(data);
      } else {
        let json = await req.json();
        setError(json.message);
      }
    } catch (err) {
      console.log(err);
      throw new Error("An error ocurred during the retrieval of  collaborators");
    }
  }

  // get the collaborators
  const retrieveStoredDatas = useCallback(async () => {
    await loadCollaborators();
  }, []);

  useEffect(() => {
    retrieveStoredDatas();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.collaborator}>
      <Text style={styles.name}>{item.username}</Text>
      <View style={styles.actions}>
        <Button
          style={styles.buttonColab}
          icon={item.writable ? "pencil" : "pencil-off"}
          mode="outlined"
          onPress={() => editCollaborator(item)}
        ></Button>

        <Button
          style={styles.buttonColab}
          icon="close-circle-outline"
          mode="outlined"
          onPress={() => removeCollaborator(item)}
        ></Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.collaborators}>
        <Text style={styles.title}>Collaborators</Text>
        {error === "" ? <></> : <Text style={styles.error}>{error}</Text>}

        <SafeAreaView style={styles.safeArea}>
          <FlatList
            style={styles.list}
            data={collaborators}
            renderItem={renderItem}
            //TODO: Utile sans clé ? keyExtractor={(item) => item.id}
          />
        </SafeAreaView>
        <TextInput
          mode="outlined"
          style={styles.input}
          onChangeText={setCollab}
          value={collab}
          placeholder="JohnDoe123"
        />
        <Button icon="plus-circle" style={styles.input} mode="outlined" onPress={addCollaborator}>
          Add a collaborator
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
  actions: {
    flexDirection: "row",
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
    display: "flex",
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
    textAlign: "center",
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
