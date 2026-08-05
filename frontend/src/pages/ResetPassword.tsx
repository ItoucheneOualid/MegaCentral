import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';

import {
  LockReset,
  Visibility,
  VisibilityOff,
  ArrowBack,
  Security,
} from '@mui/icons-material';

import {
  useSearchParams,
  useNavigate,
} from 'react-router-dom';

import api from '../services/api';
import { apiConfig } from '../config/apiConfig';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!token) {
      setError(
        'Lien de réinitialisation invalide ou incomplet.'
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (password.length < 8) {
      setError(
        'Le mot de passe doit contenir au moins 8 caractères.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Les mots de passe ne correspondent pas.'
      );
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post(
        apiConfig.endpoints.auth.resetPassword,
        {
          token,
          password,
        }
      );

      setMessage(
        response.data?.message ||
          'Mot de passe modifié avec succès.'
      );

      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Erreur lors de la modification du mot de passe.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at top left, rgba(37,99,235,0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(14,165,233,0.35), transparent 35%), linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 45%, #E0F2FE 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(37,99,235,0.18)',
          filter: 'blur(10px)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: -140,
          left: -120,
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'rgba(14,165,233,0.18)',
          filter: 'blur(12px)',
        }}
      />

      <Card
        sx={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 6,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow:
            '0 30px 90px rgba(15,23,42,0.18)',
        }}
      >
        <Box
          sx={{
            height: 7,
            background:
              'linear-gradient(90deg, #2563EB, #06B6D4)',
          }}
        />

        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() =>
              navigate('/login', { replace: true })
            }
            sx={{
              mb: 3,
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Retour connexion
          </Button>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 86,
                height: 86,
                mx: 'auto',
                mb: 2,
                background:
                  'linear-gradient(135deg, #2563EB, #06B6D4)',
                boxShadow:
                  '0 18px 40px rgba(37,99,235,0.35)',
              }}
            >
              <LockReset fontSize="large" />
            </Avatar>

            <Chip
              icon={<Security />}
              label="Lien sécurisé"
              sx={{
                mb: 2,
                fontWeight: 700,
                background: '#EFF6FF',
                color: '#1D4ED8',
              }}
            />

            <Typography
              variant="h3"
              fontWeight={900}
              color="#0F172A"
              sx={{ letterSpacing: '-1px' }}
            >
              Nouveau mot de passe
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 1.5,
                maxWidth: 380,
                mx: 'auto',
              }}
            >
              Entrez votre nouveau mot de passe puis
              confirmez-le pour récupérer l’accès à votre
              compte.
            </Typography>
          </Box>

          {!token && (
            <Alert
              severity="error"
              sx={{ mb: 2.5, borderRadius: 3 }}
            >
              Ce lien de récupération est invalide ou
              incomplet. Effectuez une nouvelle demande
              depuis la page de connexion.
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
          >
            <TextField
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              label="Nouveau mot de passe"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              disabled={isLoading || !token}
              helperText="Au moins 8 caractères"
              sx={{ mb: 2.5 }}
              InputProps={{
                sx: { borderRadius: 3 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={
                        showPassword
                          ? 'Masquer le mot de passe'
                          : 'Afficher le mot de passe'
                      }
                      onClick={() =>
                        setShowPassword(
                          (currentValue) =>
                            !currentValue
                        )
                      }
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              required
              type={
                showConfirmPassword
                  ? 'text'
                  : 'password'
              }
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              disabled={isLoading || !token}
              sx={{ mb: 2.5 }}
              InputProps={{
                sx: { borderRadius: 3 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? 'Masquer la confirmation'
                          : 'Afficher la confirmation'
                      }
                      onClick={() =>
                        setShowConfirmPassword(
                          (currentValue) =>
                            !currentValue
                        )
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {message && (
              <Alert
                severity="success"
                sx={{ mb: 2.5, borderRadius: 3 }}
              >
                {message}
              </Alert>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2.5, borderRadius: 3 }}
              >
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={
                isLoading ||
                !token ||
                Boolean(message)
              }
              sx={{
                py: 1.7,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 800,
                background:
                  'linear-gradient(90deg, #2563EB, #06B6D4)',
                boxShadow:
                  '0 16px 35px rgba(37,99,235,0.32)',
                '&:hover': {
                  background:
                    'linear-gradient(90deg, #1D4ED8, #0891B2)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress
                  size={24}
                  color="inherit"
                />
              ) : (
                'Modifier le mot de passe'
              )}
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
            }}
          >
            Après modification, vous serez redirigé vers
            la page de connexion.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};