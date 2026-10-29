import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

import { Navbar } from './components/Navbar';
import Accueil from './pages/Accueil';
import Dashboard from './pages/Dashboard';
import { Articles } from './pages/Articles';
import Tickets from './pages/Tickets';
import { ResetPassword } from './pages/ResetPassword';
import Factures from './pages/Factures';
import { Familles } from './pages/Familles';
import { Fournisseurs } from './pages/Fournisseurs';
import Profile from './pages/Profile';
import { Login } from './pages/Login';

import {
  AuthProvider,
  useAuth,
} from './contexts/AuthContext';

import { AuthGuard } from './components/AuthGuard';
import { TranslationProvider } from './contexts/TranslationContext';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#f57c00',
      light: '#ffb74d',
      dark: '#ef6c00',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0066ff',
      light: '#4d94ff',
      dark: '#0052cc',
    },
    secondary: {
      main: '#ff6b35',
      light: '#ff9558',
      dark: '#cc5522',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
    },
  },
});

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Empêche un utilisateur déjà connecté de revenir
 * sur la page de connexion.
 */
const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </TranslationProvider>
  );
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  const savedTheme = localStorage.getItem('theme');
  const [darkMode, setDarkMode] = useState(savedTheme === 'dark');

  const theme = darkMode ? darkTheme : lightTheme;

  const isHomePage = location.pathname === '/';

  const isPublicPage =
    location.pathname === '/login' ||
    location.pathname === '/reset-password';

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {!isLoading && isAuthenticated && !isPublicPage && (
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isHomePage || isPublicPage ? 0 : 3,
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/"
            element={
              <AuthGuard>
                <Accueil />
              </AuthGuard>
            }
          />

          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />

          <Route
            path="/articles"
            element={
              <AuthGuard>
                <Articles />
              </AuthGuard>
            }
          />

          <Route
            path="/tickets"
            element={
              <AuthGuard>
                <Tickets />
              </AuthGuard>
            }
          />

          <Route
            path="/factures"
            element={
              <AuthGuard>
                <Factures />
              </AuthGuard>
            }
          />

          <Route
            path="/familles"
            element={
              <AuthGuard>
                <Familles />
              </AuthGuard>
            }
          />

          <Route
            path="/fournisseurs"
            element={
              <AuthGuard>
                <Fournisseurs />
              </AuthGuard>
            }
          />

          <Route
            path="/profile"
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? '/dashboard' : '/login'}
                replace
              />
            }
          />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

export default App;