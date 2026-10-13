import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ErrorOutline,
  GetApp,
  Inventory,
  Refresh,
  Search,
  ShoppingCart,
  Store,
  WarningAmber,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { PermissionAlert, usePermissionAlert } from '../components/PermissionAlert';

interface StockItem {
  id: number;
  magasin_id: number;
  article_id: number;
  quantite_stock: number | string;
  seuil_min: number | string | null;
  seuil_max: number | string | null;
  magasin_nom: string;
  article_libelle: string;
  article_code_barres: string;
  niveau_alerte: string;
}

interface Magasin {
  id: number;
  nom_magasin?: string;
  Nom_Magasin?: string;
  nom?: string;
}

const normalizeAlert = (niveau?: string) => {
  const value = String(niveau || 'normal').toLowerCase();

  if (value === 'critique') return 'critique';
  if (value === 'faible' || value === 'bas') return 'bas';
  if (value === 'excessif') return 'excessif';
  return 'normal';
};

const getAlertLabel = (niveau?: string) => {
  const value = normalizeAlert(niveau);
  if (value === 'critique') return 'CRITIQUE';
  if (value === 'bas') return 'FAIBLE';
  if (value === 'excessif') return 'EXCESSIF';
  return 'NORMAL';
};

const getAlertColor = (niveau?: string) => {
  const value = normalizeAlert(niveau);
  if (value === 'critique') return 'error';
  if (value === 'bas') return 'warning';
  if (value === 'excessif') return 'info';
  return 'success';
};

const toNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const Stock: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const { user } = useAuth();
  const { alert, showPermissionAlert, closeAlert } = usePermissionAlert();
  const isAdmin = user?.role === 'admin';

  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockUnavailable, setStockUnavailable] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [magasinFilter, setMagasinFilter] = useState('');
  const [alertFilter, setAlertFilter] = useState('');

  const [page, setPage] = useState(1);
  const rowsPerPage = 50;
  const [totalRows, setTotalRows] = useState(0);

  const fetchMagasins = async () => {
    try {
      const response = await api.get('/magasins');
      setMagasins(response.data.data || response.data || []);
    } catch (err) {
      console.error('Erreur magasins:', err);
    }
  };

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      setStockUnavailable(false);

      const params = new URLSearchParams();

      if (magasinFilter) params.append('magasinId', magasinFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (alertFilter) params.append('alert', alertFilter.toLowerCase());

      params.append('withStockOnly', 'true');
      params.append('page', String(page));
      params.append('limit', String(rowsPerPage));

      const response = await api.get(`/stock-magasin?${params.toString()}`);

      const data = response.data.data || [];
      const filteredData = data.filter((stock: StockItem) => toNumber(stock.quantite_stock) > 0);

      setStocks(filteredData);
      setTotalRows(response.data.total ?? filteredData.length);
    } catch (err: any) {
      console.error('Erreur stocks:', err);
      if (err.response?.data?.code === 'STORE_STOCK_NOT_IN_SCHEMA') {
        setStocks([]);
        setTotalRows(0);
        setStockUnavailable(true);
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Erreur lors du chargement des stocks');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMagasins();
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [magasinFilter, searchTerm, alertFilter, page]);

  const statistiques = useMemo(() => {
    return stocks.reduce(
      (acc, stock) => {
        const quantite = toNumber(stock.quantite_stock);
        const alerte = normalizeAlert(stock.niveau_alerte);

        acc.total_articles += 1;
        acc.quantite_totale += quantite;

        if (alerte === 'critique') acc.alertes_critiques += 1;
        else if (alerte === 'bas') acc.alertes_faibles += 1;
        else if (alerte === 'excessif') acc.stocks_excessifs += 1;
        else acc.stocks_normaux += 1;

        return acc;
      },
      {
        total_articles: 0,
        alertes_critiques: 0,
        alertes_faibles: 0,
        stocks_normaux: 0,
        stocks_excessifs: 0,
        quantite_totale: 0,
      }
    );
  }, [stocks]);

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  const handleRefresh = () => {
    fetchMagasins();
    fetchStocks();
  };

  const handleResetFilters = () => {
    setMagasinFilter('');
    setSearchTerm('');
    setAlertFilter('');
    setPage(1);
  };

  const handleCommander = (stock: StockItem) => {
    if (!isAdmin) {
      showPermissionAlert('Création de commande non autorisée. Cette action nécessite un compte administrateur.');
      return;
    }

    navigate('/commandes', {
      state: {
        fromStock: true,
        articleId: stock.article_id,
        articleLibelle: stock.article_libelle,
        magasinId: stock.magasin_id,
        magasinNom: stock.magasin_nom,
        quantiteActuelle: toNumber(stock.quantite_stock),
        seuilMin: stock.seuil_min,
        seuilMax: stock.seuil_max,
        niveauAlerte: normalizeAlert(stock.niveau_alerte),
      },
    });
  };

  const handleExportCSV = () => {
    if (!isAdmin) {
      showPermissionAlert('Export du stock non autorisé. Cette action nécessite un compte administrateur.');
      return;
    }

    if (stocks.length === 0) return;

    const headers = ['Magasin', 'Article', 'Code Barres', 'Quantité', 'Seuil Min', 'Seuil Max', 'Alerte'];

    const rows = stocks.map((stock) => [
      stock.magasin_nom || '-',
      stock.article_libelle || '-',
      stock.article_code_barres || '-',
      String(toNumber(stock.quantite_stock)),
      String(stock.seuil_min ?? ''),
      String(stock.seuil_max ?? ''),
      getAlertLabel(stock.niveau_alerte),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `stocks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };
const quantiteParMagasin = useMemo(() => {
  const result: Record<string, number> = {};

  stocks.forEach((stock) => {
    const magasin = stock.magasin_nom || 'Magasin inconnu';
    result[magasin] = (result[magasin] || 0) + toNumber(stock.quantite_stock);
  });

  return result;
}, [stocks]);

const magasinsCards = Object.entries(quantiteParMagasin)
  .slice(0, 3)
  .map(([magasin, quantite], index) => ({
    label: magasin,
    value: quantite,
    description: 'Unités en stock',
    color: ['#f97316', '#7c3aed', '#0ea5e9'][index % 3],
    icon: <Store fontSize="small" />,
  }));

const statCards = [
  {
    label: 'Lignes stock',
    value: statistiques.total_articles,
    description: 'Articles disponibles',
    color: '#2563eb',
    icon: <Inventory fontSize="small" />,
  },
  {
    label: 'Quantité totale',
    value: statistiques.quantite_totale,
    description: 'Unités disponibles',
    color: '#16a34a',
    icon: <Store fontSize="small" />,
  },
  ...magasinsCards,
];
  

  if (loading && stocks.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '45vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: isDarkMode
            ? 'linear-gradient(135deg, #07111f 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #eef4ff 0%, #f8fafc 45%, #ffffff 100%)',
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="subtitle1" sx={{ ml: 2 }}>
          Chargement des stocks disponibles...
        </Typography>
      </Box>
    );
  }

  if (stockUnavailable) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
          Gestion des stocks
        </Typography>
        <Alert severity="info">
          La structure MegaCaisse ne contient pas les quantités de stock disponibles par article et par magasin.
          Cette page restera indisponible tant que ces données ne seront pas fournies par MegaCaisse.
        </Alert>
      </Box>
    );
  }

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
              <Inventory sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={950}>
                Gestion des stocks
              </Typography>

              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.85rem' }}>
                Quantités disponibles, seuils et commandes de réapprovisionnement
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                px: 2.2,
                py: 1,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 900,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.45)',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Actualiser
            </Button>

            <Tooltip title={isAdmin ? 'Exporter le stock' : 'Action réservée à l’administrateur'}>
              <span>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<GetApp />}
                  onClick={handleExportCSV}
                  disabled={!isAdmin || stocks.length === 0}
                  sx={{
                    px: 2.2,
                    py: 1,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 900,
                    bgcolor: '#fff',
                    color: '#1d4ed8',
                    '&:hover': { bgcolor: '#eff6ff', transform: 'translateY(-2px)' },
                  }}
                >
                  Exporter CSV
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={2.4} key={stat.label}>
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
          boxShadow: isDarkMode ? '0 14px 38px rgba(0,0,0,0.2)' : '0 14px 38px rgba(15,23,42,0.06)',
        }}
      >
        <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Magasin</InputLabel>

                <Select
                  value={magasinFilter}
                  label="Magasin"
                  onChange={(e) => {
                    setMagasinFilter(String(e.target.value));
                    setPage(1);
                  }}
                >
                  <MenuItem value="">Tous les magasins</MenuItem>

                  {magasins.map((magasin) => (
                    <MenuItem key={magasin.id} value={String(magasin.id)}>
                      {magasin.nom_magasin || magasin.Nom_Magasin || magasin.nom || `Magasin ${magasin.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Rechercher un article"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Niveau d'alerte</InputLabel>

                <Select
                  value={alertFilter}
                  label="Niveau d'alerte"
                  onChange={(e) => {
                    setAlertFilter(String(e.target.value));
                    setPage(1);
                  }}
                >
                  <MenuItem value="">Tous les niveaux</MenuItem>
                  <MenuItem value="critique">CRITIQUE</MenuItem>
                  <MenuItem value="bas">FAIBLE</MenuItem>
                  <MenuItem value="excessif">EXCESSIF</MenuItem>
                  <MenuItem value="normal">NORMAL</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleResetFilters}
                disabled={loading}
                sx={{ height: 40, borderRadius: 2.5, textTransform: 'none', fontWeight: 800 }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
          border: `1px solid ${alpha('#2563eb', 0.12)}`,
          boxShadow: isDarkMode ? '0 16px 45px rgba(0,0,0,0.2)' : '0 16px 45px rgba(15,23,42,0.06)',
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
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Typography variant="subtitle1" fontWeight={950}>
              Liste des stocks disponibles
            </Typography>

            <Chip
              size="small"
              label={`${totalRows} résultat(s)`}
              color="primary"
              sx={{ fontWeight: 900, borderRadius: 2 }}
            />
          </Stack>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_event, value) => {
              setPage(value);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 'calc(100vh - 340px)' }}>
          <Table stickyHeader size="small">
            <TableHead sx={{ bgcolor: isDarkMode ? alpha('#2563eb', 0.12) : alpha('#2563eb', 0.08) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Magasin</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Article</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Code-barres</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Quantité</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Seuil min</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Seuil max</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Alerte</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {stocks.map((stock) => {
                const quantite = toNumber(stock.quantite_stock);
                const alertLevel = normalizeAlert(stock.niveau_alerte);
                const mustOrder = alertLevel === 'critique' || alertLevel === 'bas';

                return (
                  <TableRow
                    key={stock.id}
                    hover
                    sx={{
                      bgcolor:
                        alertLevel === 'critique'
                          ? alpha('#ef4444', isDarkMode ? 0.16 : 0.08)
                          : alertLevel === 'bas'
                            ? alpha('#f97316', isDarkMode ? 0.14 : 0.07)
                            : 'inherit',
                      '&:hover': {
                        bgcolor: isDarkMode ? alpha('#2563eb', 0.08) : alpha('#2563eb', 0.04),
                      },
                      '& td': { py: 0.8, fontSize: '0.82rem' },
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={800} fontSize="0.84rem">
                        {stock.magasin_nom || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={900} fontSize="0.84rem">
                        {stock.article_libelle || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={stock.article_code_barres || '-'}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1.5, fontWeight: 700, height: 23, fontSize: '0.72rem' }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={950} fontSize="0.84rem">
                        {quantite}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">{stock.seuil_min ?? '-'}</TableCell>
                    <TableCell align="right">{stock.seuil_max ?? '-'}</TableCell>

                    <TableCell align="center">
                      <Chip
                        label={getAlertLabel(stock.niveau_alerte)}
                        color={getAlertColor(stock.niveau_alerte) as any}
                        size="small"
                        sx={{ fontWeight: 900, borderRadius: 1.5, height: 24, fontSize: '0.7rem' }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      {mustOrder ? (
                        <Tooltip title={isAdmin ? 'Créer une commande pour cet article' : 'Action réservée à l’administrateur'}>
                          <span>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<ShoppingCart fontSize="small" />}
                              onClick={() => handleCommander(stock)}
                              disabled={!isAdmin}
                              color={alertLevel === 'critique' ? 'error' : 'warning'}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 900,
                                fontSize: '0.72rem',
                                py: 0.45,
                                px: 1.2,
                              }}
                            >
                              Commander
                            </Button>
                          </span>
                        </Tooltip>
                      ) : (
                        <Typography color="text.secondary" fontWeight={800}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {stocks.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucun stock disponible avec ces filtres.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <PermissionAlert message={alert.message} open={alert.open} onClose={closeAlert} />
    </Box>
  );
};

export default Stock;
