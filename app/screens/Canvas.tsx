import React, { useEffect, useLayoutEffect, useRef } from "react";
import { StyleSheet, SafeAreaView, View, useWindowDimensions, Pressable } from "react-native";
import { SketchCanvas, SketchCanvasRef } from "rn-perfect-sketch-canvas";
import { useSnapshot } from "valtio";
import { io, Socket } from "socket.io-client";
import Header from "../components/canvas/Header";
import Toolbar from "../components/canvas/Toolbar";
import { state } from "../canvas/store";

import type { RootStackParamList } from "../types";
import type { ID, CompletedPoints } from "rn-perfect-sketch-canvas/src/store/index";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";

type Props = NativeStackScreenProps<RootStackParamList, "Note">;

export default function Canvas({ route, navigation }: Props) {
  console.log(`Canvas loaded. Note:`, JSON.stringify(route.params.note));

  const { width } = useWindowDimensions();
  const canvas = useRef<SketchCanvasRef>(null);
  const snap = useSnapshot(state);
  let note = route.params.note;
  let token = route.params.token;
  let login = route.params.login;
  const colorScheme = useColorScheme();
  let socket = useRef<Socket>();

  //Function to add a button on the top right corner to edit the current note open
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        note.owner === login ? (
          <Pressable
            onPress={() => navigation.navigate("EditNote", { note: note, token: token })}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <FontAwesome5
              name="edit"
              size={25}
              color={Colors[colorScheme].text}
              style={{ marginRight: 15 }}
            />
          </Pressable>
        ) : (
          <></>
        ),
    });
  });

  useEffect(() => {
    canvas.current?.reset();

    socket.current = io("https://two-notes.herokuapp.com", {
      // Use Websockets by default if available, else revert to long-polling
      transports: ["websocket", "polling"],
      query: {
        noteID: route.params.note.id,
      },
      auth: {
        token: route.params.token,
      },
    });
    // Listen events from server
    socket.current
      // add new stroke send by the server
      .on("draw", (id: ID, points: CompletedPoints, finished: boolean) => {
        console.log("receive draw");
        canvas.current?.addPoints([[id, points]]);
      })

      // Called after connection to load initial state
      .on("draw[]", (curves: [{ id: ID; points: CompletedPoints; finished: boolean }]) => {
        for (const curve of curves) {
          const { id, points } = curve;
          canvas.current?.addPoints([[id, points]]);
        }
      })
      // delete strokes
      .on("delete", (ids: ID[]) => canvas.current?.delete(ids));
    return () => {
      socket.current?.disconnect();
    };
  });

  // function used to send a stroke to the server
  function onDraw(id: ID, points: CompletedPoints, finished: boolean) {
    if (socket != undefined && socket.current != undefined)
      socket.current.emit("draw", id, points, finished);
  }

  // function used to send the strokes to delete to the server
  function onDelete(ids: ID[]) {
    if (socket != undefined && socket.current != undefined) socket.current.emit("delete", ids);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          backgroundColor: "#f0f0f0",
          flex: 1,
          alignItems: "center",
        }}
      >
        <Header canvasRef={canvas} writable={note.writable} />
        <View
          style={{
            width: width - 24,
            flexGrow: 1,
            backgroundColor: "#ffffff",
            borderRadius: 10,
            overflow: "hidden",
            elevation: 1,
          }}
        >
          <SketchCanvas
            strokeColor={snap.strokeColor}
            strokeWidth={snap.strokeWidth}
            ref={canvas}
            containerStyle={styles.container}
            onDraw={route.params.note.writable ? onDraw : undefined}
            onDelete={route.params.note.writable ? onDelete : undefined}
            readonly={!note.writable}
          />
        </View>

        <Toolbar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
