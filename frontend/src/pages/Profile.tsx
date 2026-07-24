import React from 'react';
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  AdminPanelSettings,
  AccountCircle,
  VerifiedUser,
  Security,
  Lock,
  Shield,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const { user } = useAuth();

  if (!user) {
    return (
      <Box
        sx={{
          p: 2,
          minHeight: '100vh',
          background: isDarkMode
            ? 'linear-gradient(135deg, #07111f 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #eef4ff 0%, #f8fafc 45%, #ffffff 100%)',
        }}
      >
        <Alert severity="error" sx={{ borderRadius: 2.5 }}>
          Utilisateur non connecté
        </Alert>
      </Box>
    );
  }

  const isAdmin = user.role === 'admin';
  const roleLabel = isAdmin ? 'Administrateur' : 'Manager';

  const statCards = [
    {
      label: 'Profil',
      value: 'Actif',
      description: 'Session',
      color: '#2563eb',
      icon: <AccountCircle fontSize="small" />,
    },
    {
      label: 'Rôle',
      value: roleLabel,
      description: 'Accès',
      color: isAdmin ? '#16a34a' : '#f97316',
      icon: <VerifiedUser fontSize="small" />,
    },
    {
      label: 'Sécurité',
      value: 'Protégé',
      description: 'Non modifiable',
      color: '#7c3aed',
      icon: <Lock fontSize="small" />,
    },
    {
      label: 'Compte',
      value: user.login || '-',
      description: 'Identifiant',
      color: '#0ea5e9',
      icon: <Badge fontSize="small" />,
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        minHeight: '100vh',
        background: isDarkMode
          ? 'linear-gradient(135deg, #07111f 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #eef4ff 0%, #f8fafc 45%, #ffffff 100%)',
      }}
    >
      <Box
        sx={{
          mb: 2,
          p: { xs: 2, md: 2.5 },
          borderRadius: 3.5,
          background: isAdmin
            ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #0f172a 100%)'
            : 'linear-gradient(135deg, #475569 0%, #334155 55%, #0f172a 100%)',
          color: '#fff',
          boxShadow: isAdmin
            ? '0 16px 45px rgba(37,99,235,0.22)'
            : '0 16px 45px rgba(15,23,42,0.22)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            right: -70,
            top: -100,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 130,
            height: 130,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.07)',
            right: 155,
            bottom: -75,
          },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar
              sx={{
                width: 58,
                height: 58,
                bgcolor: 'rgba(255,255,255,0.16)',
                border: '2px solid rgba(255,255,255,0.35)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
              }}
            >
              <Person sx={{ fontSize: 32 }} />
            </Avatar>

            <Box>
              <Typography variant="h5" fontWeight={950}>
                Mon profil
              </Typography>

              <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontWeight: 600, fontSize: '0.85rem', mt: 0.3 }}>
                Informations personnelles de l’utilisateur connecté
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.2 }}>
                <Chip
                  size="small"
                  icon={<VerifiedUser />}
                  label={roleLabel}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.16)',
                    color: '#fff',
                    fontWeight: 900,
                    border: '1px solid rgba(255,255,255,0.25)',
                    '& .MuiChip-icon': { color: '#fff' },
                  }}
                />

                <Chip
                  size="small"
                  icon={<AccountCircle />}
                  label={`Login : ${user.login || '-'}`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.16)',
                    color: '#fff',
                    fontWeight: 900,
                    border: '1px solid rgba(255,255,255,0.25)',
                    '& .MuiChip-icon': { color: '#fff' },
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          <Box
            sx={{
              px: 2,
              py: 1.2,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.24)',
              minWidth: 190,
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Security fontSize="small" />

              <Box>
                <Typography fontWeight={950} fontSize="0.9rem">
                  Compte sécurisé
                </Typography>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.78rem' }}>
                  Accès contrôlé
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
                border: `1px solid ${alpha(stat.color, 0.18)}`,
                boxShadow: isDarkMode
                  ? '0 12px 30px rgba(0,0,0,0.2)'
                  : '0 12px 30px rgba(15,23,42,0.06)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 16px 35px ${alpha(stat.color, 0.14)}`,
                },
              }}
            >
              <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" fontWeight={800} fontSize="0.78rem">
                      {stat.label}
                    </Typography>

                    <Typography variant="h6" fontWeight={950} sx={{ color: stat.color, mt: 0.2 }}>
                      {stat.value}
                    </Typography>

                    <Typography color="text.secondary" fontSize="0.78rem">
                      {stat.description}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.5,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: alpha(stat.color, 0.12),
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
              border: `1px solid ${alpha('#2563eb', 0.12)}`,
              boxShadow: isDarkMode
                ? '0 16px 45px rgba(0,0,0,0.2)'
                : '0 16px 45px rgba(15,23,42,0.06)',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1.8} alignItems="center" textAlign="center">
                <Avatar
                  sx={{
                    width: 78,
                    height: 78,
                    bgcolor: isAdmin ? alpha('#2563eb', 0.14) : alpha('#64748b', 0.16),
                    color: isAdmin ? '#2563eb' : '#64748b',
                    border: `2px solid ${isAdmin ? alpha('#2563eb', 0.2) : alpha('#64748b', 0.2)}`,
                  }}
                >
                  {isAdmin ? <AdminPanelSettings sx={{ fontSize: 42 }} /> : <Person sx={{ fontSize: 42 }} />}
                </Avatar>

                <Box>
                  <Typography variant="h6" fontWeight={950}>
                    {user.prenom} {user.nom}
                  </Typography>

                  <Typography color="text.secondary" fontWeight={600} fontSize="0.85rem">
                    {user.email}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  icon={<Shield />}
                  label={roleLabel}
                  color={isAdmin ? 'primary' : 'default'}
                  sx={{
                    fontWeight: 900,
                    borderRadius: 2,
                  }}
                />

                <Divider flexItem />

                <Typography color="text.secondary" lineHeight={1.6} fontSize="0.85rem">
                  Le rôle utilisateur est protégé et ne peut pas être modifié depuis cette page.
                  Les droits d’accès sont appliqués automatiquement dans les modules sensibles.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
              border: `1px solid ${alpha('#2563eb', 0.12)}`,
              boxShadow: isDarkMode
                ? '0 16px 45px rgba(0,0,0,0.2)'
                : '0 16px 45px rgba(15,23,42,0.06)',
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha('#94a3b8', 0.2)}` }}>
              <Typography variant="subtitle1" fontWeight={950}>
                Informations personnelles
              </Typography>

              <Typography color="text.secondary" fontWeight={600} fontSize="0.85rem">
                Données du compte actuellement connecté
              </Typography>
            </Box>

            <CardContent sx={{ p: 2 }}>
              <Grid container spacing={1.7}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Login"
                    value={user.login || ''}
                    disabled
                    InputProps={{
                      startAdornment: <Badge sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Rôle"
                    value={roleLabel}
                    disabled
                    InputProps={{
                      startAdornment: <VerifiedUser sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nom"
                    value={user.nom || ''}
                    disabled
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Prénom"
                    value={user.prenom || ''}
                    disabled
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    value={user.email || ''}
                    disabled
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Paper
            elevation={0}
            sx={{
              mt: 1.5,
              p: 1.8,
              borderRadius: 3,
              bgcolor: isDarkMode ? alpha('#2563eb', 0.08) : alpha('#2563eb', 0.06),
              border: `1px solid ${alpha('#2563eb', 0.14)}`,
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="flex-start">
              <Lock color="primary" fontSize="small" />

              <Typography color="text.secondary" lineHeight={1.6} fontSize="0.85rem">
                Cette page est uniquement consultative. Les informations sensibles comme le rôle,
                le login et les autorisations doivent être modifiées uniquement par un administrateur
                via la configuration sécurisée du système.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
