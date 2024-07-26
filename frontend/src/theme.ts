"use client";
import { Roboto, Kosugi_Maru } from "next/font/google";
import { createTheme } from "@mui/material/styles";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});
const kosugi = Kosugi_Maru({
  weight: ["400"],
  subsets: ["latin"],
});

const theme = createTheme({
  typography: {
    fontFamily: [roboto.style.fontFamily, kosugi.style.fontFamily].join(","),
    fontSize: 14,
    button: {
      textTransform: "none",
    },
    body2: { fontSize: 12 },
  },
  palette: {
    primary: {
      main: "#0072bc",
      light: "#19a3fc",
      dark: "#005b96",
    },
    mode: "light",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        ::-webkit-scrollbar{
          width: 15px;
        },
        ::-webkit-scrollbar-thumb {
          background-color: #e8e8e8;
          border-radius: 10px;
          border-right: 3px solid transparent;
          border-left: 3px solid transparent;
          background-clip: padding-box;
        },
        ::-webkit-scrollbar-track {
          margin-top: 4px;
          margin-bottom: 4px;
        }
      `,
    },
  },
});

export default theme;
