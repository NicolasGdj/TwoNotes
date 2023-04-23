/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Splash: undefined;
  Profile: undefined;
  Home: undefined;
  Note: { note: Note; token: string; login: string };
  Register: undefined;
  CreateNote: { token: string };
  EditNote: { note: Note; token: string };
  Login: undefined;
  Header: undefined;
  NotFound: undefined;
};

export interface Note {
  id: number;
  title: string;
  owner?: string;
  updatedAt: string;
  writable?: boolean;
}
