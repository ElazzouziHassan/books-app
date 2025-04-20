import { DefaultTheme } from "react-native-paper"
import { colors } from "./colors"

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.royalBlue,
    accent: colors.lavender,
    background: colors.white,
    surface: colors.white,
    text: colors.black,
    error: colors.error,
    disabled: colors.lightGray,
    placeholder: colors.lightBlueGray,
    backdrop: colors.black,
    notification: colors.royalBlue,
  },
}
