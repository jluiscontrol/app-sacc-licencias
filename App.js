import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DefaultDarkTheme,
  PaperProvider,
} from "react-native-paper";
import RootNavigator from "./src/navigators/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { PRIMARY_COLOR } from "./src/utils/colors";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: PRIMARY_COLOR,
    secondary: "#947415",
    secondaryContainer: "#e6b31e",
    onSecondaryContainer: "white",
    onBackground: "#d5a200",
    background: "#f0f0f0", // gris claro por defecto
  },
};

export default function App() {
  return (
    <GestureHandlerRootView>
      <StatusBar barStyle="dark-content" />
      <PaperProvider theme={theme}>
        <RootNavigator />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
