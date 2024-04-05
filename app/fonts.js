import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";

export const ibm_plex_sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-sans",
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export const ibm_plex_serif = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: "--font-ibm-serif",
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});
