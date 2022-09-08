import {createTheme} from '@material-ui/core/styles';
const PRIMARY = '#00a5e6';
const SECONDARY = '#555555';
const WHITE = '#fff';

const MuiTheme = createTheme({
  palette: {
    primary: {
      main: PRIMARY,
      contrastText: WHITE,
    },
    secondary: {
      main: SECONDARY,
      contrastText: WHITE,
    },
    background: {
      paper: WHITE,
    },
  },
  overrides: {
    MuiTabs: {
      centered: true,
      indicator: {
        backgroundColor: WHITE,
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        fontWeight: '500',
      },
      textColorInherit: {
        color: WHITE,
        opacity: '0.5',
      },
    },
    MuiAppBar: {
      colorDefault: {color: WHITE, backgroundColor: PRIMARY},
    },
    MuiButton: {
      root: {
        textTransform: 'none',
        marginBottom: '8px',
      },
    },
    MuiOutlinedInput: {
      root: {
        width: '250px',
      },
    },
  },
});

export {MuiTheme};
