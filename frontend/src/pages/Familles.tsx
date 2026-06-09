import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  AccountTree,
  Category,
  Refresh,
  Search,
  Store,
} from '@mui/icons-material';

import axios from 'axios';

interface Famille2 {
  F2CLEUNIK: number;
  Description: string;
  F1CLEUNIK: number;
  famille1_libelle?: string;
}

const Familles: React.FC = () => {
  const [familles2, setFamilles2] = useState<Famille2[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFamilles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        'http://localhost:3000/api/familles/familles2'
      );

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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: 3,
        background:
          'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, #ffffff 45%, rgba(245,124,0,0.08) 100%)',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 5,
            overflow: 'hidden',
            position: 'relative',
            color: 'white',
            background:
              'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0f172a 100%)',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: '50%',
              right: -60,
              top: -80,
              background: 'rgba(255,255,255,0.12)',
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              width: 150,
              height: 150,
              borderRadius: '50%',
              right: 170,
              bottom: -90,
              background: 'rgba(255,255,255,0.08)',
            }}
          />

          <Box sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  bgcolor: 'rgba(255,255,255,0.18)',
                  border: '2px solid rgba(255,255,255,0.35)',
                }}
              >
                <AccountTree sx={{ fontSize: 38 }} />
              </Avatar>

              <Box>
                <Typography variant="h4" fontWeight={900}>
                  Gestion des Sous-Familles
                </Typography>

                <Typography sx={{ opacity: 0.9, mt: 0.5 }}>
                  Consultation des sous-catégories d’articles et de leur famille principale.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
              <Chip
                icon={<AccountTree />}
                label={`${familles2.length} sous-familles`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: 'white',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              />

              <Chip
                icon={<Category />}
                label="Sans gestion de remise"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: 'white',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              />
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <AccountTree />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary">
                      Total sous-familles
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {familles2.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <Search />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary">
                      Résultats affichés
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {filteredFamilles.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#0f172a' }}>
                    <Category />
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary">
                      Type affiché
                    </Typography>
                    <Typography variant="h6" fontWeight={800}>
                      Sous-familles
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)',
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <TextField
                label="Rechercher une sous-famille"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1, minWidth: 280 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="outlined"
                onClick={() => setSearchTerm('')}
              >
                Effacer
              </Button>

              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={fetchFamilles}
              >
                Actualiser
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.10)',
          }}
        >
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                  }}
                >
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Store fontSize="small" />
                      ID
                    </Box>
                  </TableCell>

                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountTree fontSize="small" />
                      Description
                    </Box>
                  </TableCell>

                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category fontSize="small" />
                      Famille principale
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredFamilles.map((famille) => (
                  <TableRow
                    key={famille.F2CLEUNIK}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(25,118,210,0.06)',
                      },
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={famille.F2CLEUNIK}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        {famille.Description || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={famille.famille1_libelle || `Famille ${famille.F1CLEUNIK}`}
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {filteredFamilles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Box sx={{ py: 5, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                          Aucune sous-famille trouvée.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

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
           
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export { Familles };