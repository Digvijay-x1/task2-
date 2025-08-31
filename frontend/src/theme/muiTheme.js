import { createTheme } from "@mui/material/styles";
import { generateSeedColorPalette, ASSIGNMENT_SEED } from "../utils/seedUtils";

// Generate seed-based colors
const seedPalette = generateSeedColorPalette(ASSIGNMENT_SEED);

// Convert HSL to hex for Material-UI
function hslToHex(hsl) {
  // Extract HSL values from string like "hsl(210, 65%, 45%)"
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return "#0ea5e9"; // fallback

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Create Material-UI color palette from seed
const createSeedPalette = (seedColors) => {
  return {
    50: hslToHex(seedColors[50]),
    100: hslToHex(seedColors[100]),
    200: hslToHex(seedColors[200]),
    300: hslToHex(seedColors[300]),
    400: hslToHex(seedColors[400]),
    500: hslToHex(seedColors[500]),
    600: hslToHex(seedColors[600]),
    700: hslToHex(seedColors[700]),
    800: hslToHex(seedColors[800]),
    900: hslToHex(seedColors[900]),
    main: hslToHex(seedColors[500]), // Required by MUI
    light: hslToHex(seedColors[300]),
    dark: hslToHex(seedColors[700]),
    contrastText: "#ffffff",
  };
};

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: createSeedPalette(seedPalette.primary),
    secondary: createSeedPalette(seedPalette.accent),
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          fontWeight: 500,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
          transition: "box-shadow 0.2s ease-in-out",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: createSeedPalette(seedPalette.primary),
    secondary: createSeedPalette(seedPalette.accent),
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: {
    ...lightTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#1e1e1e",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          },
          transition: "box-shadow 0.2s ease-in-out",
        },
      },
    },
  },
});

// Export seed information for components
export const seedInfo = {
  seed: ASSIGNMENT_SEED,
  primaryColor: hslToHex(seedPalette.primary[500]),
  accentColor: hslToHex(seedPalette.accent[500]),
  hue: seedPalette.hue,
  saturation: seedPalette.saturation,
  lightness: seedPalette.lightness,
};

export default lightTheme;
