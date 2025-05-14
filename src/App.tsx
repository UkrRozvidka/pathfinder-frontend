import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Router from './Router';

const App: React.FC = () => {
  const [mode, setMode] = React.useState<'light' | 'dark'>(
    localStorage.getItem('themeMode') as 'light' | 'dark' || 'light'
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
      }),
    [mode]
  );

  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Layout toggleColorMode={toggleColorMode} mode={mode}>
            <Router />
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
