import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  Business,
  ArrowBack,
} from '@mui/icons-material';
import axios from 'axios';

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    login: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    voirPrixAchat?: number;
  };
}

export const LoginForm: React.FC = () => {
  const theme = useTheme();

  const [credentials, setCredentials] = useState({
    login: '',
    password: '',
  });

  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        'http://localhost:3000/api/auth/login',
        credentials
      );

      if (response.data.success && response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      } else {
        setError(response.data.message || 'Erreur lors de la connexion');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Login ou mot de passe incorrect'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/forgot-password',
        {
          identifier: forgotIdentifier,
        }
      );

      setSuccessMessage(
        response.data?.message ||
          'Si ce compte existe, un lien de récupération a été envoyé.'
      );

      setForgotIdentifier('');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Erreur lors de la demande de récupération'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          theme.palette.mode === 'dark'
            ? '#0B1020'
            : 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 980,
          minHeight: 560,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          borderRadius: 5,
          overflow: 'hidden',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 25px 80px rgba(0,0,0,0.55)'
              : '0 25px 80px rgba(30,41,59,0.16)',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 5,
            color: 'white',
            background:
              'linear-gradient(160deg, #2563EB 0%, #1E40AF 45%, #0F172A 100%)',
          }}
        >
          <Box>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                mb: 3,
                bgcolor: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Business fontSize="large" />
            </Avatar>

            <Typography variant="h3" fontWeight={800} gutterBottom>
              MEGA-Central
            </Typography>

            <Typography sx={{ opacity: 0.85, fontSize: '1.05rem' }}>
              Gérez vos magasins, utilisateurs et opérations commerciales
              depuis une seule interface moderne.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <Typography fontWeight={700} gutterBottom>
              🇧🇪 Plateforme commerciale
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Connexion sécurisée pour les administrateurs et utilisateurs.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: { xs: 3, sm: 5 },
            background:
              theme.palette.mode === 'dark'
                ? 'rgba(15,23,42,0.98)'
                : '#FFFFFF',
          }}
        >
          {!isForgotMode ? (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  color={theme.palette.mode === 'dark' ? 'white' : '#0F172A'}
                >
                  Connexion
                </Typography>
                <Typography
                  variant="body2"
                  color={
                    theme.palette.mode === 'dark'
                      ? 'grey.400'
                      : 'text.secondary'
                  }
                >
                  Entrez vos identifiants pour accéder au tableau de bord.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Login"
                  name="login"
                  value={credentials.login}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2.5 }}
                />

                <TextField
                  fullWidth
                  label="Mot de passe"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 1.5 }}
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </Button>
                    ),
                  }}
                />

                <Box sx={{ textAlign: 'right', mb: 2.5 }}>
                  <Button
                    variant="text"
                    onClick={() => {
                      setIsForgotMode(true);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Mot de passe oublié ?
                  </Button>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {successMessage && (
                  <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
                    {successMessage}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.6,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #2563EB, #1D4ED8)',
                    boxShadow: '0 12px 30px rgba(37,99,235,0.35)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #1D4ED8, #1E40AF)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      <LockOutlined sx={{ mr: 1 }} />
                      Se connecter
                    </>
                  )}
                </Button>
              </Box>

             <Box
  sx={{
    mt: 4,
    p: 2.5,
    borderRadius: 3,
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : '#F8FAFC',
    border:
      theme.palette.mode === 'dark'
        ? '1px solid rgba(255,255,255,0.08)'
        : '1px solid #E2E8F0',
  }}
>
  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
    Accès sécurisé
  </Typography>

  <Typography variant="body2">
    Contactez l’administrateur si vous avez oublié votre mot de passe.
  </Typography>
</Box>
            </>
          ) : (
            <>
              <Box sx={{ mb: 4 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => {
                    setIsForgotMode(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  sx={{
                    mb: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Retour
                </Button>

                <Typography
                  variant="h4"
                  fontWeight={800}
                  color={theme.palette.mode === 'dark' ? 'white' : '#0F172A'}
                >
                  Récupération
                </Typography>

                <Typography
                  variant="body2"
                  color={
                    theme.palette.mode === 'dark'
                      ? 'grey.400'
                      : 'text.secondary'
                  }
                >
                  Entrez votre login ou votre email pour recevoir les
                  instructions de récupération.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleForgotPassword}>
                <TextField
                  fullWidth
                  label="Login ou email"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  required
                  sx={{ mb: 2.5 }}
                />

                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {successMessage && (
                  <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
                    {successMessage}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.6,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #2563EB, #1D4ED8)',
                    boxShadow: '0 12px 30px rgba(37,99,235,0.35)',
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Envoyer le lien de récupération'
                  )}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
};