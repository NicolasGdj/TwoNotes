import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

export const AuthContext = React.createContext({});

/**
 * Function to save the token securly
 * @param token
 * @returns void
 */
export const setToken = async (token: string) => {
  return await AsyncStorage.setItem("secure_token", token);
};

/**
 * Function to get the token
 * @returns the token
 */
export const getToken = async () => {
  return await AsyncStorage.getItem("secure_token");
};

/**
 * Function to save the login securly
 * @param login
 * @returns void
 */
export const setLogin = (login: string) => {
  return AsyncStorage.setItem("secure_login", login);
};

/**
 * Function to getLogin the token
 * @returns the login
 */
export const getLogin = () => {
  return AsyncStorage.getItem("secure_login");
};

/**
 * Function to save the password securly
 * @param password
 * @returns void
 */
export const setPassword = (password: string) => {
  return AsyncStorage.setItem("secure_password", password);
};

/**
 * Function to getpassword the token
 * @returns the password
 */
export const getPassword = () => {
  return AsyncStorage.getItem("secure_password");
};
