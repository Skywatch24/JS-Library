import React from 'react';
import ReactDOM from 'react-dom';
import APP from './app';
import {ThemeProvider} from '@material-ui/core/styles';
import {MuiTheme} from './styles/MuiTheme';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={MuiTheme}>
      <APP />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
