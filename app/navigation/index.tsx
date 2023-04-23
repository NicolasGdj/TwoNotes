/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { ColorSchemeName, Pressable } from "react-native";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import LoginScreen from "../screens/Login";
import NotFoundScreen from "../screens/NotFound";
import HomeScreen from "../screens/Home";
import ProfileScreen from "../screens/Profile";
import { RootStackParamList } from "../types";
import RegisterScreen from "../screens/Register";
import CreateNoteScreen from "../screens/CreateNote";
import Canvas from "../screens/Canvas";
import { getToken, AuthContext } from "../utils/creds";
import { Text, View } from "../components/Themed";
import { useReducer } from "react";
import EditNoteScreen from "../screens/EditNote";
function SplashScreen() {
  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const colorScheme2 = useColorScheme();
  /**
   * A root stack navigator is often used for displaying modals on top of all other content.
   * https://reactnavigation.org/docs/modal
   */
  const Stack = createNativeStackNavigator<RootStackParamList>();

  function RootNavigator() {
    if (stateData.isLoading) {
      return (
        <Stack.Navigator>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      );
    } else if (stateData.userToken == null) {
      return (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      );
    }

    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }: any) => ({
            title: "My Notes",
            tabBarIcon: ({ color }: any) => (
              <FontAwesome5
                name="home"
                color={color}
                // size={25}
                // style={{marginRight: 15}}
              />
            ),
            headerRight: () => (
              <Pressable
                onPress={() => navigation.navigate("Profile")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <FontAwesome5
                  name="user"
                  size={25}
                  color={Colors[colorScheme2].text}
                  style={{ marginRight: 15 }}
                />
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Note" component={Canvas} />
        <Stack.Screen name="CreateNote" component={CreateNoteScreen} />
        <Stack.Screen name="EditNote" component={EditNoteScreen} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: "Oops!" }} />
      </Stack.Navigator>
    );
  }

  const [stateData, dispatch] = useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case "SIGN_IN":
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case "SIGN_OUT":
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await getToken();
      } catch (e) {
        // Restoring token failed
        console.log(e);
      }

      dispatch({ type: "RESTORE_TOKEN", token: userToken });
    };

    bootstrapAsync();
  }, []);
  const authContext = React.useMemo(
    () => ({
      signIn: async (data: any) => {
        dispatch({ type: "SIGN_IN", token: data.token });
      },
      signOut: () => dispatch({ type: "SIGN_OUT" }),
      signUp: async (data: any) => {
        dispatch({ type: "SIGN_IN", token: data.token });
      },
    }),
    []
  );
  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer
        // linking={LinkingConfiguration}
        theme={DefaultTheme}
      >
        <RootNavigator />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
