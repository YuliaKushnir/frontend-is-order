import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from '@mui/material';
import {Provider} from 'react-redux';
import {store} from '../src/store/store'; 
import theme from './theme';
import "@fontsource/raleway";
import "@fontsource/quicksand";
import { AuthProvider } from 'react-oauth2-code-pkce';
import { authConfig } from './authConfig';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider authConfig={authConfig} 
    autoLogin={false} 
    loadingComponent={<div>Loading...</div>}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </Provider>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
