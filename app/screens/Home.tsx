import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";

import { SafeAreaView, FlatList, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { Text, View } from "../components/Themed";
import { getToken, getLogin } from "../utils/creds";
import { Pressable } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";

import type { Note } from "../types";

export default function HomeScreen({ route, navigation }: any) {
  const [notes, setNotes] = useState<any[]>([]);
  const [sharedNotes, setSharedNotes] = useState<any[]>([]);
  const colorScheme = useColorScheme();
  const token = getToken();
  const username = getLogin();

  // add a header on the top left to reload the data from the APi
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
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

  const retrieveStoredDatas = useCallback(async () => {
    await loadNotes();
    await loadSharedNotes();
  }, []);

  useEffect(() => {
    navigation.addListener("focus", () => {
      retrieveStoredDatas();
    });
  }, [navigation]);

  /**
   * function to navigate to a particular note
   * @param note string, the name of the note
   */
  async function open_note(note: Note) {
    navigation.navigate("Note", { note, token: await token, login: await getLogin() });
  }

  /**
   * function to navigate to the screen of CreateNote
   */
  async function create_note() {
    navigation.navigate("CreateNote", { token: await token });
  }

  /**
   * Function to load the notes from the API
   */
  async function loadNotes() {
    try {
      const req = await fetch("https://two-notes.herokuapp.com/api/notes", {
        method: "GET",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-access-token": await token,
        },
      });
      if (req.status === 200) {
        let user = await username;
        let data = (await req.json()).notes;
        data.forEach((note: any) => {
          note.writable = true;
          note.owner = user;
        });
        setNotes(data);
      } else {
        console.log(req);
        throw new Error("An error ocurred during the retrieval of personal notes");
      }
    } catch (error) {
      console.log(error);
      throw new Error("An error ocurred during the retrieval of personal notes");
    }
  }

  /**
   * Function to load the shared notes from the API
   */
  async function loadSharedNotes() {
    try {
      const req = await fetch("https://two-notes.herokuapp.com/api/notes/shared", {
        method: "GET",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "x-access-token": await token,
        },
      });
      if (req.status === 200) {
        setSharedNotes((await req.json()).notes);
      } else {
        throw new Error("An error ocurred during the retrieval of shared notes");
      }
    } catch (error) {
      throw new Error("An error ocurred during the retrieval of shared notes");
    }
  }

  // button used for each note and shared note
  const renderItem = ({ item }: Note) => (
    <Button style={styles.note} icon="pencil" mode="outlined" onPress={() => open_note(item)}>
      {item.title}
    </Button>
  );
  return (
    <View style={styles.mainContainer}>
      <View style={styles.sectionContainer}>
        <Text style={styles.notes_title}>My Notes</Text>
        <SafeAreaView style={styles.container}>
          <FlatList
            style={styles.notes}
            data={notes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </SafeAreaView>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.notes_title}>Shared Notes</Text>
        <SafeAreaView style={styles.container}>
          <FlatList
            style={styles.notes}
            data={sharedNotes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </SafeAreaView>
      </View>
      <View style={styles.sectionContainer}>
        <Button style={styles.new_note} icon="plus" mode="outlined" onPress={create_note}>
          Create a new note
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "100%",
  },
  sectionContainer: {
    flexDirection: "column",
    flex: 0.3,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-evenly",
    padding: 5,
  },
  container: {
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
    flex: 1,
  },
  note: {
    alignContent: "space-around",
    fontSize: 20,
    margin: 2,
    width: "100%",
  },
  notes: {
    padding: 2,
    flex: 1,
    width: "100%",
  },
  new_note: {
    margin: 2,
    width: "100%",
  },
  notes_title: {
    overflow: "hidden",
    padding: 4,
    margin: 4,
    backgroundColor: "rgba(50,50,50,.8)",
    color: "white",
    width: "100%",
    textAlign: "center",
    borderRadius: 5,
    fontSize: 20,
  },
});
