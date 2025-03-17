import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2364AA',
      light: '#3DA5D9',
      dark: '#0A2342',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EA7317',
      light: '#F5A15A',
      dark: '#C55A0E',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D64933',
      light: '#E57A68',
      dark: '#AF2E1B',
    },
    warning: {
      main: '#F4AC45',
      light: '#F7C27B',
      dark: '#D68A1E',
    },
    info: {
      main: '#3DA5D9',
      light: '#6BC1E9',
      dark: '#1A7CAB',
    },
    success: {
      main: '#73BFB8',
      light: '#97D4CE',
      dark: '#4D9992',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0A2342',
      secondary: '#5E738A',
      disabled: '#A2AEBD',
    },
    divider: 'rgba(10, 35, 66, 0.12)',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: 0,
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: 0,
    },
    body1: {
      letterSpacing: 0,
    },
    body2: {
      letterSpacing: 0,
    },
    button: {
      fontWeight: 600,
      letterSpacing: 0,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(35, 100, 170, 0.15)',
          },
          padding: '10px 24px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2364AA 0%, #0A2342 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #EA7317 0%, #C55A0E 100%)',
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(10, 35, 66, 0.05)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 30px rgba(10, 35, 66, 0.08)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(10, 35, 66, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(10, 35, 66, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: '#2364AA',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2364AA',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '12px',
        },
        elevation1: {
          boxShadow: '0px 2px 10px rgba(10, 35, 66, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 4px 20px rgba(10, 35, 66, 0.08)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(10, 35, 66, 0.12)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: '0px 8px 30px rgba(10, 35, 66, 0.12)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
});

// Dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3DA5D9',
      light: '#6BC1E9',
      dark: '#1A7CAB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F5A15A',
      light: '#F7C27B',
      dark: '#EA7317',
      contrastText: '#0A2342',
    },
    error: {
      main: '#E57A68',
      light: '#ECA699',
      dark: '#D64933',
    },
    warning: {
      main: '#F7C27B',
      light: '#FAD7A9',
      dark: '#F4AC45',
    },
    info: {
      main: '#6BC1E9',
      light: '#A0D8F3',
      dark: '#3DA5D9',
    },
    success: {
      main: '#97D4CE',
      light: '#BFE5E1',
      dark: '#73BFB8',
    },
    background: {
      default: '#0F2A4A',
      paper: '#162F4C',
    },
    text: {
      primary: '#F5F7FA',
      secondary: '#A6C3E0',
      disabled: '#5E738A',
    },
    divider: 'rgba(166, 195, 224, 0.12)',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: 0,
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: 0,
    },
    body1: {
      letterSpacing: 0,
    },
    body2: {
      letterSpacing: 0,
    },
    button: {
      fontWeight: 600,
      letterSpacing: 0,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(61, 165, 217, 0.2)',
          },
          padding: '10px 24px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3DA5D9 0%, #1A7CAB 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #F5A15A 0%, #EA7317 100%)',
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(166, 195, 224, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: '#3DA5D9',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3DA5D9',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '12px',
        },
        elevation1: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
        },
        elevation2: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(166, 195, 224, 0.12)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
});

// Colors to use in components
export const colors = {
  midnight: '#0A2342',
  azure: '#2364AA',
  sky: '#3DA5D9',
  coral: '#EA7317',
  mint: '#73BFB8',
  cloud: '#F5F7FA',
  sand: '#F7F3E3',
};

// Function to get the appropriate theme
export const getTheme = (mode: 'light' | 'dark') => {
  return mode === 'dark' 
    ? responsiveFontSizes(darkTheme) 
    : responsiveFontSizes(lightTheme);
};

// Default export
export default responsiveFontSizes(lightTheme); 