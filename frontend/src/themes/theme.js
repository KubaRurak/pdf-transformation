import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'linear-gradient(90deg, #fdfdfd, #f0f0f0)',
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'none'
      },
      styleOverrides: {
        root: {
          mr: 2,
          '&:hover': {
            color: '#e0e0e0'
          }
        },
        lastLink: {
          mr: 0
        }
      }
    }
  },
});

export default theme;