import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import {
  AccountTree,
  Category,
  Refresh,
  Search,
  Inventory,
} from '@mui/icons-material';

import api from '../services/api';

interface Famille2 {
  F2CLEUNIK: number;
  Description: string;
  F1CLEUNIK: number;
  famille1_libelle?: string;
}

const Familles: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [familles2, setFamilles2] = useState<Famille2[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFamilles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/familles/familles2');
      setFamilles2(response.data.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des sous-familles:', err);
      setError('Erreur lors du chargement des sous-familles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilles();
  }, []);

  const filteredFamilles = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return familles2.filter((famille) => {
      return (
        famille.Description?.toLowerCase().includes(search) ||
        famille.famille1_libelle?.toLowerCase().includes(search) ||
        String(famille.F2CLEUNIK).includes(search)
      );
    });
  }, [familles2, searchTerm]);

  const famillesPrincipales = new Set(
    familles2.map((famille) => famille.famille1_libelle || famille.F1CLEUNIK).filter(Boolean)
  ).size;

  const statCards = [
    {
      label: 'Sous-familles',
      value: familles2.length,
      description: 'Enregistrées',
      color: '#2563eb',
      icon: <AccountTree fontSize="small" />,
    },
    {
      label: 'Familles principales',
      value: famillesPrincipales,
      description: 'Groupes parents',
      color: '#16a34a',
      icon: <Category fontSize="small" />,
    },
    {
      label: 'Résultats filtrés',
      value: filteredFamilles.length,
      description: 'Affichés',
      color: '#f97316',
      icon: <Search fontSize="small" />,
    },
    {
      label: 'Catalogue',
      value: 'Structuré',
      description: 'Organisation articles',
      color: '#7c3aed',
      icon: <Inventory fontSize="small" />,
    },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="45vh"
        sx={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #07111f 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #eef4ff 0%, #f8fafc 45%, #ffffff 100%)',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 1.5, md: 2 },
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
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #0f172a 100%)',
          color: '#fff',
          boxShadow: '0 16px 45px rgba(37,99,235,0.22)',
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
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.22)',
              }}
            >
              <AccountTree sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={950}>
                Organisation du catalogue produits
              </Typography>

              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.85rem' }}>
                Structure hiérarchique des familles et sous-familles d’articles
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchFamilles}
            size="small"
            sx={{
              px: 2.2,
              py: 1,
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 900,
              bgcolor: '#fff',
              color: '#1d4ed8',
              '&:hover': {
                bgcolor: '#eff6ff',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Actualiser
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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

      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
          border: `1px solid ${alpha('#2563eb', 0.12)}`,
          boxShadow: isDarkMode
            ? '0 14px 38px rgba(0,0,0,0.2)'
            : '0 14px 38px rgba(15,23,42,0.06)',
        }}
      >
        <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              label="Rechercher une sous-famille"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={() => setSearchTerm('')}
              sx={{
                borderRadius: 2.5,
                px: 2,
                height: 40,
                textTransform: 'none',
                fontWeight: 800,
                minWidth: { xs: '100%', md: 'auto' },
              }}
            >
              Effacer
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
          border: `1px solid ${alpha('#2563eb', 0.12)}`,
          boxShadow: isDarkMode
            ? '0 16px 45px rgba(0,0,0,0.2)'
            : '0 16px 45px rgba(15,23,42,0.06)',
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            borderBottom: `1px solid ${alpha('#94a3b8', 0.2)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            position: 'sticky',
            top: 0,
            zIndex: 5,
            bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
          }}
        >
          <Typography variant="subtitle1" fontWeight={950}>
            Liste des sous-familles
          </Typography>

          <Chip
            size="small"
            label={`${filteredFamilles.length} résultat(s)`}
            color="primary"
            sx={{ fontWeight: 900, borderRadius: 2 }}
          />
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 'calc(100vh - 330px)' }}>
          <Table stickyHeader size="small">
            <TableHead
              sx={{
                bgcolor: isDarkMode ? alpha('#2563eb', 0.12) : alpha('#2563eb', 0.08),
              }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Famille principale</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredFamilles.map((famille) => (
                <TableRow
                  key={famille.F2CLEUNIK}
                  hover
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isDarkMode ? alpha('#2563eb', 0.08) : alpha('#2563eb', 0.04),
                    },
                    '& td': {
                      py: 0.8,
                      fontSize: '0.82rem',
                    },
                  }}
                >
                  <TableCell>
                    <Chip
                      label={famille.F2CLEUNIK}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: 800,
                        borderRadius: 1.5,
                        height: 23,
                        fontSize: '0.72rem',
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: alpha('#2563eb', 0.12),
                          color: '#2563eb',
                        }}
                      >
                        <AccountTree sx={{ fontSize: 17 }} />
                      </Avatar>

                      <Typography fontWeight={900} fontSize="0.84rem">
                        {famille.Description || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={<Category fontSize="small" />}
                      label={famille.famille1_libelle || `Famille ${famille.F1CLEUNIK}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: 800,
                        borderRadius: 1.5,
                        height: 25,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {filteredFamilles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Aucune sous-famille trouvée
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Card
        sx={{
          mt: 2,
          borderRadius: 3,
          bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
          border: `1px solid ${alpha('#2563eb', 0.12)}`,
          boxShadow: isDarkMode
            ? '0 12px 30px rgba(0,0,0,0.18)'
            : '0 12px 30px rgba(15,23,42,0.06)',
        }}
      >
        <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
          <Typography color="text.secondary" lineHeight={1.6} fontSize="0.85rem">
            Cette section permet de consulter la structure hiérarchique du catalogue produits.
            Les sous-familles sont rattachées à leur famille principale afin de faciliter
            la gestion des articles, des statistiques et du reporting commercial.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export { Familles };
