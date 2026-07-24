import React, { useState, useEffect } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
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
  Typography,
  useTheme,
  Alert,
} from '@mui/material';

import {
  Store,
  AttachMoney,
  Receipt,
  Refresh,
  People,
  ShoppingCart,
  FilterList,
  Assessment,
  Dashboard as DashboardIcon,
  TrendingUp,
} from '@mui/icons-material';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import api from '../services/api';
import { apiConfig } from '../config/apiConfig';

interface StoreStats {
  codeMagasin: string;
  totalTickets: number;
  totalVentes: number;
  ticketsDuJour: number;
  ventesDuJour: number;
  nomMagasin: string;
  totalClients: number;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [storeStats, setStoreStats] = useState<StoreStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedPeriod, setSelectedPeriod] = useState('total');
  const [selectedStore, setSelectedStore] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [magasins, setMagasins] = useState<any[]>([]);
  const [showGraphes, setShowGraphes] = useState(true);
  const [ticketsData, setTicketsData] = useState<any[]>([]);

  const formatCurrency = (amount: string | number | null | undefined) => {
    const numAmount =
      typeof amount === 'string'
        ? Number(amount.replace(',', '.'))
        : Number(amount || 0);

    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(isNaN(numAmount) ? 0 : numAmount);
  };

  const getDateRange = (period: string) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    switch (period) {
      case 'total': {
        const todayStr = today.toISOString().split('T')[0].replace(/-/g, '');
        return { start: '20240101', end: todayStr };
      }

      case "aujourd'hui": {
        const todayStr = today.toISOString().split('T')[0].replace(/-/g, '');
        const startOfDayStr = startOfDay.toISOString().split('T')[0].replace(/-/g, '');
        return { start: startOfDayStr, end: todayStr };
      }

      case 'semaine': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        return {
          start: startOfWeek.toISOString().split('T')[0].replace(/-/g, ''),
          end: today.toISOString().split('T')[0].replace(/-/g, ''),
        };
      }

      case 'mois': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return {
          start: startOfMonth.toISOString().split('T')[0].replace(/-/g, ''),
          end: today.toISOString().split('T')[0].replace(/-/g, ''),
        };
      }

      case 'trimestre': {
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const startOfTrimestre = new Date(today.getFullYear(), currentQuarter * 3, 1);

        return {
          start: startOfTrimestre.toISOString().split('T')[0].replace(/-/g, ''),
          end: today.toISOString().split('T')[0].replace(/-/g, ''),
        };
      }

      case 'personnaliser':
        return {
          start: startDate.replace(/-/g, ''),
          end: endDate.replace(/-/g, ''),
        };

      default:
        return {
          start: startOfDay.toISOString().split('T')[0].replace(/-/g, ''),
          end: today.toISOString().split('T')[0].replace(/-/g, ''),
        };
    }
  };

  const calculateFilteredStats = (tickets: any[], magasinsData: any[]) => {
    const ticketsByStore = tickets.reduce((acc: any, ticket: any) => {
      const storeCode = ticket.Code_Magasin?.toString() || 'NULL';

      if (!acc[storeCode]) {
        acc[storeCode] = {
          tickets: [],
          totalVentes: 0,
          totalClients: new Set(),
        };
      }

      acc[storeCode].tickets.push(ticket);
      acc[storeCode].totalVentes += parseFloat(ticket.Total_TTC) || 0;

      if (ticket.Client_No) {
        acc[storeCode].totalClients.add(ticket.Client_No);
      }

      return acc;
    }, {});

    return Object.keys(ticketsByStore).map((storeCode) => {
      const storeData = ticketsByStore[storeCode];

      const magasin = magasinsData.find(
        (m: any) =>
          m.code_magasin?.toString() === storeCode ||
          m.codeMagasin?.toString() === storeCode
      );

      return {
        codeMagasin: storeCode,
        nomMagasin: magasin?.nom_magasin || magasin?.nomMagasin || `Magasin ${storeCode}`,
        totalTickets: storeData.tickets.length,
        totalVentes: storeData.totalVentes,
        ticketsDuJour: storeData.tickets.length,
        ventesDuJour: storeData.totalVentes,
        totalClients: storeData.totalClients.size,
      };
    });
  };

  const dateRangeInvalid =
    selectedPeriod === 'personnaliser' &&
    !!startDate &&
    !!endDate &&
    endDate < startDate;

  const applyFilters = async () => {
    if (dateRangeInvalid) {
      setError('La date de fin doit être supérieure ou égale à la date de début.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const dateRange =
  selectedPeriod === 'personnaliser'
    ? {
        start: startDate.replace(/-/g, ''),
        end: endDate.replace(/-/g, ''),
      }
    : getDateRange(selectedPeriod);

      let magasinsRes;

      try {
        magasinsRes = await api.get(apiConfig.endpoints.magasins);
      } catch {
        magasinsRes = await api.get(apiConfig.endpoints.magasins);
      }

      const magasinsData = magasinsRes.data.data || [];
      setMagasins(magasinsData);

      let ticketsRes;

      try {
        ticketsRes = await api.get(apiConfig.endpoints.tickets, {
          params: {
            startDate: dateRange.start,
            endDate: dateRange.end,
            storeCode: selectedStore === 'all' ? undefined : selectedStore,
          },
        });
      } catch {
        ticketsRes = await api.get(apiConfig.endpoints.tickets, {
          params: {
            startDate: dateRange.start,
            endDate: dateRange.end,
            storeCode: selectedStore === 'all' ? undefined : selectedStore,
          },
        });
      }

      const tickets = ticketsRes.data.data || [];

      setTicketsData(tickets);
      setStoreStats(calculateFilteredStats(tickets, magasinsData));
    } catch (error) {
      console.error('Erreur dashboard:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStoresPerformanceByMonth = () => {
    const realStoreNames: { [key: string]: string } = {};

    magasins.forEach((magasin: any) => {
      const code = magasin.code_magasin?.toString() || magasin.codeMagasin?.toString() || 'Unknown';
      realStoreNames[code] = magasin.nom_magasin || magasin.nomMagasin || `Magasin ${code}`;
    });

    const allStoresData: { [key: string]: { storeName: string; ventes: number; tickets: number } } = {};

    magasins.forEach((magasin: any) => {
      const code = magasin.code_magasin?.toString() || magasin.codeMagasin?.toString() || 'Unknown';
      const name = magasin.nom_magasin || magasin.nomMagasin || `Magasin ${code}`;

      allStoresData[code] = {
        storeName: name,
        ventes: 0,
        tickets: 0,
      };
    });

    ticketsData.forEach((ticket: any) => {
      const storeCode = ticket.Code_Magasin || 'Unknown';

      if (!allStoresData[storeCode]) {
        allStoresData[storeCode] = {
          storeName: realStoreNames[storeCode] || `Magasin ${storeCode}`,
          ventes: 0,
          tickets: 0,
        };
      }

      allStoresData[storeCode].ventes += parseFloat(ticket.Total_TTC) || 0;
      allStoresData[storeCode].tickets += 1;
    });

    return Object.values(allStoresData).sort((a, b) => b.ventes - a.ventes);
  };

  const getCurrentPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'total':
        return 'Total';
      case "aujourd'hui":
        return "Aujourd'hui";
      case 'semaine':
        return 'Cette semaine';
      case 'mois':
        return 'Ce mois';
      case 'trimestre':
        return 'Ce trimestre';
      case 'personnaliser':
        return 'Période personnalisée';
      default:
        return 'Total';
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    setSelectedPeriod('personnaliser');

    if (endDate && endDate < value) {
      setError('La date de fin doit être supérieure ou égale à la date de début.');
    } else {
      setError('');
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    setSelectedPeriod('personnaliser');

    if (startDate && value < startDate) {
      setError('La date de fin doit être supérieure ou égale à la date de début.');
    } else {
      setError('');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let ticketsRes;
        let magasinsRes;

        try {
          [ticketsRes, magasinsRes] = await Promise.all([
            api.get(apiConfig.endpoints.tickets),
            api.get(apiConfig.endpoints.magasins),
          ]);
        } catch {
          [ticketsRes, magasinsRes] = await Promise.all([
            api.get(apiConfig.endpoints.tickets),
            api.get(apiConfig.endpoints.magasins),
          ]);
        }

        const tickets = ticketsRes.data.data || [];
        const magasinsData = magasinsRes.data.data || [];

        setMagasins(magasinsData);
        setTicketsData(tickets);
        setStoreStats(calculateFilteredStats(tickets, magasinsData));

        const initialRange = getDateRange('total');
        setStartDate(initialRange.start.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
        setEndDate(initialRange.end.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));

        setError('');
      } catch (error) {
        console.error('Erreur dashboard:', error);
        setError('Erreur lors du chargement des données - Vérifiez que le backend est lancé');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

useEffect(() => {
  if (selectedPeriod !== 'personnaliser') {
    const range = getDateRange(selectedPeriod);

    setStartDate(range.start.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
    setEndDate(range.end.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));

    setTimeout(() => {
      applyFilters();
    }, 0);
  }
}, [selectedPeriod]);

  useEffect(() => {
    if (startDate && endDate && !dateRangeInvalid) {
      applyFilters();
    }
  }, [selectedStore]);

  const totalGlobal = {
    tickets: storeStats.reduce((sum, store) => sum + (store.totalTickets || 0), 0),
    ventes: storeStats.reduce((sum, store) => sum + (store.totalVentes || 0), 0),
    clients: storeStats.reduce((sum, store) => sum + (store.totalClients || 0), 0),
  };

  const totalStores = magasins.length;
  const totalActiveStores = storeStats.filter((store) => store.totalVentes > 0).length;

  const topStore =
    storeStats.length > 0
      ? storeStats.reduce((best, store) =>
          store.totalVentes > (best.totalVentes || 0) ? store : best
        )
      : null;

  const statCards = [
    {
      label: 'Total tickets',
      value: totalGlobal.tickets.toLocaleString(),
      description: 'Tickets filtrés',
      color: '#2563eb',
      icon: <Receipt fontSize="small" />,
    },
    {
      label: "Chiffre d'affaires",
      value: formatCurrency(totalGlobal.ventes),
      description: 'Période sélectionnée',
      color: '#16a34a',
      icon: <AttachMoney fontSize="small" />,
    },
    {
      label: 'Clients identifiés',
      value: totalGlobal.clients.toLocaleString(),
      description: 'Clients uniques',
      color: '#f97316',
      icon: <People fontSize="small" />,
    },
    {
      label: 'Panier moyen',
      value: formatCurrency(totalGlobal.tickets > 0 ? totalGlobal.ventes / totalGlobal.tickets : 0),
      description: 'Moyenne ticket',
      color: '#7c3aed',
      icon: <ShoppingCart fontSize="small" />,
    },
  ];

  const chartData = getStoresPerformanceByMonth();
  const colors = ['#2563eb', '#16a34a', '#f97316', '#7c3aed', '#ec4899', '#0ea5e9'];

  if (loading && storeStats.length === 0) {
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
          Chargement du tableau de bord...
        </Typography>
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
        '@keyframes softPulse': {
          '0%, 100%': {
            boxShadow: '0 0 0 rgba(37,99,235,0)',
          },
          '50%': {
            boxShadow: '0 0 34px rgba(37,99,235,0.18)',
          },
        },
        '@keyframes cardFloat': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-4px)',
          },
        },
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
          animation: 'softPulse 5s ease-in-out infinite',
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
              <DashboardIcon sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={950}>
                Tableau de bord
              </Typography>

              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.85rem' }}>
                Vue globale des ventes, tickets, magasins et performances
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowGraphes(!showGraphes)}
              startIcon={<Assessment />}
              sx={{
                px: 2.2,
                py: 1,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 900,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.45)',
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {showGraphes ? 'Masquer graphes' : 'Afficher graphes'}
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={applyFilters}
              disabled={dateRangeInvalid}
              startIcon={<Refresh />}
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
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, flexWrap: 'wrap' }}>
            <FilterList fontSize="small" color="primary" />

            <Typography variant="subtitle1" fontWeight={950}>
              Filtres
            </Typography>

            <Chip size="small" label={`Période : ${getCurrentPeriodLabel()}`} color="primary" sx={{ fontWeight: 800 }} />
            <Chip size="small" label={`${totalStores} magasins`} sx={{ fontWeight: 800 }} />
            <Chip size="small" label={`${totalActiveStores} actifs`} color="success" sx={{ fontWeight: 800 }} />
          </Stack>

          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Période</InputLabel>

                <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} label="Période">
                  <MenuItem value="total">Total</MenuItem>
                  <MenuItem value="aujourd'hui">Aujourd'hui</MenuItem>
                  <MenuItem value="semaine">Cette semaine</MenuItem>
                  <MenuItem value="mois">Ce mois</MenuItem>
                  <MenuItem value="trimestre">Ce trimestre</MenuItem>
                  <MenuItem value="personnaliser">Personnaliser</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Magasin</InputLabel>

                <Select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} label="Magasin">
                  <MenuItem value="all">Tous les magasins</MenuItem>

                  {magasins.map((magasin, index) => (
                    <MenuItem
                      key={`magasin-${magasin.code_magasin || magasin.codeMagasin || index}`}
                      value={magasin.code_magasin || magasin.codeMagasin}
                    >
                      {magasin.nom_magasin || magasin.nomMagasin} ({magasin.code_magasin || magasin.codeMagasin})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date début"
                value={startDate}
                onChange={handleStartDateChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date fin"
                value={endDate}
                onChange={handleEndDateChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: startDate }}
                error={dateRangeInvalid}
                helperText={dateRangeInvalid ? 'Date fin invalide' : ''}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={applyFilters}
                disabled={dateRangeInvalid}
                startIcon={<Refresh />}
                sx={{
                  height: 40,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 900,
                }}
              >
                Appliquer les filtres
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {statCards.map((stat, index) => (
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
                animation: `cardFloat ${3.2 + index * 0.25}s ease-in-out infinite`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 18px 42px ${alpha(stat.color, 0.18)}`,
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

      <Card
        sx={{
          mb: 2,
          borderRadius: 3.5,
          overflow: 'hidden',
          bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
          border: `1px solid ${alpha('#2563eb', 0.22)}`,
          boxShadow: isDarkMode
            ? '0 22px 65px rgba(37,99,235,0.18)'
            : '0 22px 65px rgba(37,99,235,0.12)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #2563eb, #16a34a, #f97316, #7c3aed)',
          },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.4,
            borderBottom: `1px solid ${alpha('#94a3b8', 0.2)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(15,23,42,0.95))'
              : 'linear-gradient(135deg, rgba(37,99,235,0.10), rgba(255,255,255,0.95))',
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Typography variant="h6" fontWeight={950}>
              🏪 Détail par magasin
            </Typography>

            <Chip
              size="small"
              label={`${storeStats.length} magasin(s)`}
              color="primary"
              sx={{ fontWeight: 900, borderRadius: 2 }}
            />
          </Stack>

          {topStore && (
            <Chip
              size="small"
              icon={<TrendingUp />}
              label={`Meilleur : ${topStore.nomMagasin}`}
              color="success"
              sx={{ fontWeight: 900, borderRadius: 2 }}
            />
          )}
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Table stickyHeader size="small">
            <TableHead
              sx={{
                bgcolor: isDarkMode ? alpha('#2563eb', 0.18) : alpha('#2563eb', 0.1),
              }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: 950, fontSize: '0.86rem', py: 1.2 }}>Magasin</TableCell>
                <TableCell sx={{ fontWeight: 950, fontSize: '0.86rem', py: 1.2 }}>Code</TableCell>
                <TableCell align="right" sx={{ fontWeight: 950, fontSize: '0.86rem', py: 1.2 }}>
                  Tickets
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 950, fontSize: '0.86rem', py: 1.2 }}>
                  Chiffre d'affaires
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 950, fontSize: '0.86rem', py: 1.2 }}>
                  Clients
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 950, fontSize: '0.86rem', py: 1.2 }}>
                  Panier moyen
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 950, fontSize: '0.86rem', py: 1.2 }}>
                  Statut
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {storeStats.map((store) => {
                const panierMoyen = store.totalTickets > 0 ? store.totalVentes / store.totalTickets : 0;
                const actif = store.totalVentes > 0;
                const isBest = topStore?.codeMagasin === store.codeMagasin;

                return (
                  <TableRow
                    key={store.codeMagasin}
                    hover
                    sx={{
                      background: isBest
                        ? isDarkMode
                          ? alpha('#16a34a', 0.12)
                          : alpha('#16a34a', 0.08)
                        : 'inherit',
                      '&:hover': {
                        bgcolor: isDarkMode ? alpha('#2563eb', 0.1) : alpha('#2563eb', 0.06),
                      },
                      '& td': {
                        py: 1.15,
                        fontSize: '0.88rem',
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={0.9} alignItems="center">
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: 2,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha('#2563eb', 0.12),
                            color: '#2563eb',
                          }}
                        >
                          <Store fontSize="small" />
                        </Box>

                        <Box>
                          <Typography fontWeight={950} fontSize="0.9rem">
                            {store.nomMagasin}
                          </Typography>

                          {isBest && (
                            <Typography fontSize="0.72rem" color="success.main" fontWeight={900}>
                              Meilleure performance
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={store.codeMagasin}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 900,
                          borderRadius: 1.5,
                          height: 24,
                          fontSize: '0.74rem',
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={900}>{store.totalTickets.toLocaleString()}</Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={950} color="primary" fontSize="0.92rem">
                        {formatCurrency(store.totalVentes)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">{store.totalClients.toLocaleString()}</TableCell>

                    <TableCell align="right">{formatCurrency(panierMoyen)}</TableCell>

                    <TableCell align="center">
                      <Chip
                        label={actif ? 'Actif' : 'Sans vente'}
                        color={actif ? 'success' : 'default'}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          borderRadius: 1.5,
                          height: 24,
                          fontSize: '0.72rem',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

              {storeStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucune donnée trouvée pour les filtres sélectionnés</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {showGraphes && (
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
                border: `1px solid ${alpha('#2563eb', 0.12)}`,
                boxShadow: isDarkMode ? '0 16px 45px rgba(0,0,0,0.2)' : '0 16px 45px rgba(15,23,42,0.06)',
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha('#94a3b8', 0.2)}` }}>
                <Typography variant="subtitle1" fontWeight={950}>
                  Performance des magasins
                </Typography>

                <Typography color="text.secondary" fontSize="0.85rem">
                  {getCurrentPeriodLabel()}
                </Typography>
              </Box>

              <CardContent sx={{ p: 2 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
                    <XAxis
                      dataKey="storeName"
                      tick={{ fill: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: 11 }}
                      angle={-35}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fill: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                        borderRadius: 10,
                      }}
                      formatter={(value: any, name: any) => {
                        if (name === 'ventes') return [formatCurrency(Number(value)), 'Ventes'];
                        if (name === 'tickets') return [value, 'Tickets'];
                        return value;
                      }}
                    />
                    <Bar dataKey="ventes" fill="#2563eb" name="Ventes" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
                border: `1px solid ${alpha('#2563eb', 0.12)}`,
                boxShadow: isDarkMode ? '0 16px 45px rgba(0,0,0,0.2)' : '0 16px 45px rgba(15,23,42,0.06)',
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha('#94a3b8', 0.2)}` }}>
                <Typography variant="subtitle1" fontWeight={950}>
                  Répartition des ventes
                </Typography>

                <Typography color="text.secondary" fontSize="0.85rem">
                  Par magasin
                </Typography>
              </Box>

              <CardContent sx={{ p: 2 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="ventes" nameKey="storeName">
                      {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                        borderRadius: 10,
                      }}
                      formatter={(value: any, _name: any, props: any) => [
                        formatCurrency(Number(value)),
                        props.payload.storeName,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
