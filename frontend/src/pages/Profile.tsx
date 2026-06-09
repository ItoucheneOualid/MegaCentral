import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Chip,
  Divider,
  Stack,
  Paper,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  AdminPanelSettings,
  AccountCircle,
  VerifiedUser,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Utilisateur non connecté</Alert>
      </Box>
    );
  }

  const isAdmin = user.role === 'admin';
  const roleLabel = isAdmin ? 'Administrateur' : 'Manager';

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 90px)',
        p: 3,
        background:
          'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(255,255,255,1) 45%, rgba(245,124,0,0.08) 100%)',
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{
            mb: 1,
            fontWeight: 800,
            color: '#0f172a',
          }}
        >
          Mon profil
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 3,
            color: 'text.secondary',
          }}
        >
          Consultation des informations personnelles de l’utilisateur connecté.
        </Typography>

        <Card
          sx={{
            borderRadius: 5,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.12)',
            border: '1px solid rgba(255,255,255,0.7)',
          }}
        >
          <Box
            sx={{
              p: 4,
              color: 'white',
              background: isAdmin
                ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0f172a 100%)'
                : 'linear-gradient(135deg, #475569 0%, #64748b 50%, #0f172a 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: 220,
                height: 220,
                borderRadius: '50%',
                right: -60,
                top: -70,
                background: 'rgba(255,255,255,0.13)',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: '50%',
                right: 150,
                bottom: -80,
                background: 'rgba(255,255,255,0.09)',
              }}
            />

            <Stack direction="row" spacing={3} alignItems="center" sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'rgba(255,255,255,0.18)',
                  border: '3px solid rgba(255,255,255,0.45)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
                }}
              >
                <Person sx={{ fontSize: 54 }} />
              </Avatar>

              <Box>
                <Typography variant="h4" fontWeight={900}>
                  {user.prenom} {user.nom}
                </Typography>

                <Typography sx={{ opacity: 0.9, mt: 0.5 }}>
                  {user.email}
                </Typography>

                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} flexWrap="wrap">
                  <Chip
                    icon={<VerifiedUser />}
                    label={roleLabel}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.18)',
                      color: 'white',
                      fontWeight: 700,
                      border: '1px solid rgba(255,255,255,0.28)',
                    }}
                  />

                  <Chip
                    icon={<AccountCircle />}
                    label={`Login : ${user.login}`}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.18)',
                      color: 'white',
                      fontWeight: 700,
                      border: '1px solid rgba(255,255,255,0.28)',
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 4,
                    background: 'linear-gradient(145deg, #f8fafc, #ffffff)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AdminPanelSettings />
                    </Avatar>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Niveau d’accès
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {roleLabel}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary">
                    Le rôle est protégé et ne peut pas être modifié depuis cette page pour des raisons de sécurité.
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                    Informations personnelles
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Login"
                        value={user.login || ''}
                        disabled
                        InputProps={{
                          startAdornment: <Badge sx={{ mr: 1, color: 'primary.main' }} />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Rôle"
                        value={roleLabel}
                        disabled
                        InputProps={{
                          startAdornment: <VerifiedUser sx={{ mr: 1, color: 'primary.main' }} />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nom"
                        value={user.nom || ''}
                        disabled
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'primary.main' }} />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Prénom"
                        value={user.prenom || ''}
                        disabled
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'primary.main' }} />,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={user.email || ''}
                        disabled
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: 'primary.main' }} />,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 3,
                p: 2.5,
                borderRadius: 4,
                background: 'rgba(25,118,210,0.06)',
                border: '1px solid rgba(25,118,210,0.15)',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Cette page permet à l’administrateur ou au manager de consulter son profil utilisateur.
                Les informations sensibles comme le rôle ne sont pas modifiables depuis l’interface profil.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Profile;