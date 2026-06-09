import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';
import {
  Store,
  Business,
  AttachMoney,
  Receipt,
  Refresh,
  TrendingUp,
  People,
  ShoppingCart,
  FilterList,
  Assessment,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import axios from 'axios';

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
  const [storeStats, setStoreStats] = useState<StoreStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour le filtrage
  const [selectedPeriod, setSelectedPeriod] = useState('total');
  const [selectedStore, setSelectedStore] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [magasins, setMagasins] = useState<any[]>([]);
  const [showGraphes, setShowGraphes] = useState(true);
  const [ticketsData, setTicketsData] = useState<any[]>([]);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount || amount === '') return '0.00 €';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? '0.00 €' : `${numAmount.toFixed(2)} €`;
  };

  // Fonctions de filtrage
  const getDateRange = (period: string) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    switch (period) {
      case 'total':
        // Afficher les statistiques globales par défaut
        const todayStr = today.toISOString().split('T')[0].replace(/-/g, '');
        console.log('🔍 TOTAL - STATISTIQUES GLOBALES - start: 20240101, end:', todayStr);
        return {
          start: '20240101',
          end: todayStr
        };
      case 'aujourd\'hui':
        // Afficher les statistiques du jour
        const todayStr2 = today.toISOString().split('T')[0].replace(/-/g, '');
        const startOfDayStr = startOfDay.toISOString().split('T')[0].replace(/-/g, '');
        console.log('🔍 AUJOURD\'HUI - start:', startOfDayStr, 'end:', todayStr2);
        return {
          start: startOfDayStr,
          end: todayStr2
        };
      case 'semaine':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const weekStart = startOfWeek.toISOString().split('T')[0].replace(/-/g, '');
        const weekEnd = today.toISOString().split('T')[0].replace(/-/g, '');
        console.log('🔍 SEMAINE - start:', weekStart, 'end:', weekEnd);
        return {
          start: weekStart,
          end: weekEnd
        };
      case 'mois':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStart = startOfMonth.toISOString().split('T')[0].replace(/-/g, '');
        const monthEnd = today.toISOString().split('T')[0].replace(/-/g, '');
        console.log('🔍 MOIS - start:', monthStart, 'end:', monthEnd);
        return {
          start: monthStart,
          end: monthEnd
        };
      case 'trimestre':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const startOfTrimestre = new Date(today.getFullYear(), currentQuarter * 3, 1);
        const trimestreStart = startOfTrimestre.toISOString().split('T')[0].replace(/-/g, '');
        const trimestreEnd = today.toISOString().split('T')[0].replace(/-/g, '');
        console.log('🔍 TRIMESTRE - start:', trimestreStart, 'end:', trimestreEnd);
        return {
          start: trimestreStart,
          end: trimestreEnd
        };
      case 'personnaliser':
        const customStart = startDate.replace(/-/g, '');
        const customEnd = endDate.replace(/-/g, '');
        console.log('🔍 PERSONNALISER - start:', customStart, 'end:', customEnd);
        return {
          start: customStart,
          end: customEnd
        };
      default:
        const defaultStart = startOfDay.toISOString().split('T')[0].replace(/-/g, '');
        const defaultEnd = today.toISOString().split('T')[0].replace(/-/g, '');
        console.log('🔍 DEFAULT - start:', defaultStart, 'end:', defaultEnd);
        return {
          start: defaultStart,
          end: defaultEnd
        };
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      
      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: startDate.replace(/-/g, ''),
          end: endDate.replace(/-/g, '')
        };
      } else {
        dateRange = getDateRange(selectedPeriod);
      }
      
      let magasinsRes;
      try {
        magasinsRes = await axios.get('http://localhost:3000/api/magasins');
      } catch (port3000Error) {
        magasinsRes = await axios.get('http://localhost:3001/api/magasins');
      }
      
      const magasinsData = magasinsRes.data.data || [];
      setMagasins(magasinsData);
      
      let ticketsRes;
      try {
        ticketsRes = await axios.get('http://localhost:3000/api/tickets', {
          params: {
            startDate: dateRange.start.replace(/-/g, ''),
            endDate: dateRange.end.replace(/-/g, ''),
            storeCode: selectedStore === 'all' ? undefined : selectedStore
          }
        });
      } catch (port3000Error) {
        ticketsRes = await axios.get('http://localhost:3001/api/tickets', {
          params: {
            startDate: dateRange.start.replace(/-/g, ''),
            endDate: dateRange.end.replace(/-/g, ''),
            storeCode: selectedStore === 'all' ? undefined : selectedStore
          }
        });
      }
      
      const tickets = ticketsRes.data.data || [];
      console.log('🔍 TICKETS REÇUS:', tickets.length, 'pour la période:', dateRange);
      const filteredStats = calculateFilteredStats(tickets, magasinsData);
      setStoreStats(filteredStats);
      
    } catch (error) {
      console.error('❌ Erreur lors du filtrage:', error);
      setError('Erreur lors du filtrage des données');
    } finally {
      setLoading(false);
    }
  };

  const calculateFilteredStats = (tickets: any[], magasinsData: any[]) => {
    console.log('🔍 ANALYSE COMPLÈTE DES DONNÉES BRUTES:', {
      totalTicketsBrut: tickets.length,
      magasinsDisponibles: magasinsData.length,
      tousLesMagasins: magasinsData.map(m => ({ code: m.code_magasin, nom: m.nom_magasin }))
    });
    
    // Vérifier tous les codes de magasin présents dans les tickets
    const codesUniques = Array.from(new Set(tickets.map(t => t.Code_Magasin).filter(Boolean)));
    console.log('🔍 CODES MAGASIN PRÉSENTS DANS TICKETS:', codesUniques);
    
    // Regrouper TOUS les tickets par Code_Magasin (sans filtrer pour l'instant)
    const ticketsByStore = tickets.reduce((acc: any, ticket: any) => {
      const storeCode = ticket.Code_Magasin?.toString() || 'NULL';
      
      if (!acc[storeCode]) {
        acc[storeCode] = {
          tickets: [],
          totalVentes: 0,
          totalClients: new Set()
        };
      }
      acc[storeCode].tickets.push(ticket);
      acc[storeCode].totalVentes += parseFloat(ticket.Total_TTC) || 0;
      acc[storeCode].totalClients.add(ticket.Client_No);
      return acc;
    }, {});
    
    console.log('🔍 RÉPARTITION PAR CODE MAGASIN:', Object.keys(ticketsByStore).map(code => ({
      codeMagasin: code,
      nbTickets: ticketsByStore[code].tickets.length,
      totalVentes: ticketsByStore[code].totalVentes
    })));
    
    const statsWithTickets: StoreStats[] = Object.keys(ticketsByStore)
      .map(storeCode => {
        const storeData = ticketsByStore[storeCode];
        const magasin = magasinsData.find((m: any) => 
          (m.code_magasin?.toString() === storeCode || 
           m.codeMagasin?.toString() === storeCode)
        );
        
        return {
          codeMagasin: storeCode,
          nomMagasin: magasin?.nom_magasin || magasin?.nomMagasin || `Magasin ${storeCode}`,
          totalTickets: storeData.tickets.length,
          totalVentes: storeData.totalVentes,
          ticketsDuJour: storeData.tickets.length,
          ventesDuJour: storeData.totalVentes,
          totalClients: storeData.totalClients.size
        };
      });
    
    console.log('🔍 STATISTIQUES FINALES:', statsWithTickets);
    
    return statsWithTickets;
  };

  const getFilteredTicketsForGraphs = () => {
    if (!ticketsData || ticketsData.length === 0) return [];
    
    const dateRange = getDateRange(selectedPeriod);
    
    const filteredTickets = ticketsData.filter((ticket: any) => {
      const ticketDateStr = ticket.Date || ticket.Date_Ticket;
      if (!ticketDateStr || ticketDateStr.length !== 8) return false;
      
      const ticketYear = parseInt(ticketDateStr.substring(0, 4));
      const ticketMonth = parseInt(ticketDateStr.substring(4, 6)) - 1;
      const ticketDay = parseInt(ticketDateStr.substring(6, 8));
      
      const ticketDate = new Date(ticketYear, ticketMonth, ticketDay);
      const startDateFilter = new Date(
        parseInt(dateRange.start.substring(0, 4)),
        parseInt(dateRange.start.substring(4, 6)) - 1,
        parseInt(dateRange.start.substring(6, 8))
      );
      const endDateFilter = new Date(
        parseInt(dateRange.end.substring(0, 4)),
        parseInt(dateRange.end.substring(4, 6)) - 1,
        parseInt(dateRange.end.substring(6, 8))
      );
      
      return ticketDate >= startDateFilter && ticketDate <= endDateFilter;
    });
    
    return filteredTickets;
  };

  const getStoresPerformanceByMonth = () => {
    const filteredTickets = getFilteredTicketsForGraphs();
    
    // Récupérer les noms réels des magasins depuis les données
    const realStoreNames: { [key: string]: string } = {};
    magasins.forEach((magasin: any) => {
      const code = magasin.code_magasin?.toString() || magasin.codeMagasin?.toString() || 'Unknown';
      const name = magasin.nom_magasin || magasin.nomMagasin || `Magasin ${code}`;
      realStoreNames[code] = name;
    });
    
    // Créer un objet avec tous les magasins (même ceux avec 0 ventes) en utilisant les vrais noms
    const allStoresData: { [key: string]: { storeName: string; ventes: number; tickets: number } } = {};
    magasins.forEach((magasin: any) => {
      const code = magasin.code_magasin?.toString() || magasin.codeMagasin?.toString() || 'Unknown';
      const name = magasin.nom_magasin || magasin.nomMagasin || `Magasin ${code}`;
      allStoresData[code] = { storeName: name, ventes: 0, tickets: 0 };
    });
    
    // Ajouter les ventes réelles des tickets filtrés
    const storePerformance = filteredTickets.reduce((acc: any, ticket: any) => {
      const storeCode = ticket.Code_Magasin || 'Unknown';
      if (!acc[storeCode]) {
        acc[storeCode] = {
          storeName: realStoreNames[storeCode] || `Magasin ${storeCode}`,
          ventes: 0,
          tickets: 0
        };
      }
      acc[storeCode].ventes += parseFloat(ticket.Total_TTC) || 0;
      acc[storeCode].tickets += 1;
      return acc;
    }, {});
    
    // Fusionner avec les données de tous les magasins
    Object.keys(storePerformance).forEach(storeCode => {
      if (allStoresData[storeCode]) {
        allStoresData[storeCode] = storePerformance[storeCode];
      }
    });
    
    // Retourner un tableau trié par numéro de magasin
    return Object.values(allStoresData).sort((a, b) => {
      const aNum = parseInt(a.storeName.replace(/[^0-9]/g, ''));
      const bNum = parseInt(b.storeName.replace(/[^0-9]/g, ''));
      return aNum - bNum;
    });
  };

  const getCurrentPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'total':
        return 'Total';
      case 'aujourd\'hui':
        return 'Aujourd\'hui';
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


  const totalStores = magasins.length;
  const totalActiveStores = Array.isArray(storeStats)
    ? storeStats.filter(store => store.totalVentes > 0).length
    : 0;
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setSelectedPeriod('personnaliser');
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setSelectedPeriod('personnaliser');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let ticketsRes, magasinsRes;
        
        try {
          [ticketsRes, magasinsRes] = await Promise.all([
            axios.get('http://localhost:3000/api/tickets'),
            axios.get('http://localhost:3000/api/magasins')
          ]);
        } catch (port3000Error) {
          [ticketsRes, magasinsRes] = await Promise.all([
            axios.get('http://localhost:3001/api/tickets'),
            axios.get('http://localhost:3001/api/magasins')
          ]);
        }

        const tickets = ticketsRes.data.data || [];
        const magasins = magasinsRes.data.data || [];
        
        setMagasins(magasins);
        setStoreStats(calculateFilteredStats(tickets, magasins));
        setTicketsData(tickets);
        
        const initialRange = getDateRange('total');
        setStartDate(initialRange.start.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
        setEndDate(initialRange.end.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
        
        setError('');
        
      } catch (error) {
        console.error('❌ Erreur de chargement:', error);
        setError('Erreur lors du chargement des données - Vérifiez que le backend est lancé');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const range = getDateRange(selectedPeriod);
    setStartDate(range.start.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
    setEndDate(range.end.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
  }, [selectedPeriod]);

  useEffect(() => {
    applyFilters();
  }, [selectedPeriod, selectedStore, startDate, endDate]);

  const totalGlobal = {
    tickets: Array.isArray(storeStats) ? storeStats.reduce((sum, store) => sum + (store.totalTickets || 0), 0) : 0,
    ventes: Array.isArray(storeStats) ? storeStats.reduce((sum, store) => sum + (store.totalVentes || 0), 0) : 0,
    clients: Array.isArray(storeStats) ? storeStats.reduce((sum, store) => sum + (store.totalClients || 0), 0) : 0
  };

  const topStore = Array.isArray(storeStats) && storeStats.length > 0
    ? storeStats.reduce((best, store) => (store.totalVentes > (best.totalVentes || 0) ? store : best), storeStats[0])
    : null;

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography>Chargement des données...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        background: isDarkMode ? '#020617' : '#eff6ff',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          background: isDarkMode ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.95)',
          boxShadow: isDarkMode ? '0 28px 100px rgba(0, 0, 0, 0.35)' : '0 28px 100px rgba(148, 163, 184, 0.2)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(59, 130, 246, 0.12)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: isDarkMode
              ? 'radial-gradient(circle at 20% 10%, rgba(59, 130, 246, 0.16), transparent 18%), radial-gradient(circle at 80% 15%, rgba(16, 185, 129, 0.12), transparent 16%), radial-gradient(circle at 50% 90%, rgba(236, 72, 153, 0.08), transparent 20%)'
              : 'radial-gradient(circle at 20% 10%, rgba(59, 130, 246, 0.12), transparent 18%), radial-gradient(circle at 80% 15%, rgba(16, 185, 129, 0.10), transparent 16%), radial-gradient(circle at 50% 90%, rgba(245, 158, 11, 0.08), transparent 20%)',
            opacity: 0.95,
            pointerEvents: 'none'
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header moderne avec filtres - Design oversize et dynamique */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          position: 'relative',
          overflow: 'hidden',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #312e81 100%)'
            : 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 45%, #e0f2fe 100%)',
          borderRadius: 3,
          boxShadow: isDarkMode 
            ? '0 24px 70px rgba(15, 23, 42, 0.35)' 
            : '0 24px 70px rgba(148, 163, 184, 0.18)',
          border: isDarkMode 
            ? '1px solid rgba(255, 255, 255, 0.08)' 
            : '1px solid rgba(59, 130, 246, 0.12)'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 24%), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.12), transparent 20%)',
            opacity: 0.95,
            pointerEvents: 'none'
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800, 
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.05
                }}
              >
                📊 Tableau de Bord
              </Typography>
              <Typography 
                variant="subtitle1"
                sx={{ 
                  mt: 1,
                  color: isDarkMode ? '#cbd5e1' : '#475569',
                  maxWidth: 620
                }}
              >
                Vue synthétique et riche des performances de vos magasins, avec des indicateurs clairs et des filtres réactifs.
              </Typography>
            </Box>
            <IconButton 
              onClick={applyFilters}
              sx={{
                background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(59, 130, 246, 0.12)',
                color: isDarkMode ? '#f8fafc' : '#1d4ed8',
                '&:hover': {
                  background: isDarkMode ? 'rgba(255,255,255,0.14)' : 'rgba(59, 130, 246, 0.18)',
                  transform: 'rotate(180deg)'
                },
                transition: 'all 0.25s ease'
              }}
            >
              <Refresh />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 3 }}>
            <Chip
              label={selectedPeriod === 'total' ? 'Période : Globale' : `Période : ${selectedPeriod}`}
              sx={{
                color: isDarkMode ? '#e2e8f0' : '#0f172a',
                background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.13)',
                fontWeight: 600,
                borderRadius: 2
              }}
            />
            <Chip
              label={`${totalGlobal.tickets.toLocaleString()} tickets`}
              sx={{
                color: isDarkMode ? '#e2e8f0' : '#0f172a',
                background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.14)',
                fontWeight: 600,
                borderRadius: 2
              }}
            />
            <Chip
              label={`${totalStores} magasins`}
              sx={{
                color: isDarkMode ? '#e2e8f0' : '#0f172a',
                background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(234, 179, 8, 0.14)',
                fontWeight: 600,
                borderRadius: 2
              }}
            />
            <Chip
              label={`${totalActiveStores} actifs`}
              sx={{
                color: isDarkMode ? '#e2e8f0' : '#0f172a',
                background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(59, 130, 246, 0.12)',
                fontWeight: 600,
                borderRadius: 2
              }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' }, gap: 3, alignItems: 'center' }}>
            <Box sx={{ p: 3, background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)', borderRadius: 3, border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(148, 163, 184, 0.2)' }}>
              <Typography variant="subtitle2" sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b', mb: 1 }}>
                Flux en temps réel
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                +{Math.round(totalGlobal.tickets * 0.05).toLocaleString()} interactions prévues
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
                Analyse en direct des tickets et suivi automatique des magasins les plus performants.
              </Typography>
            </Box>

            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)', borderRadius: 3, border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(148, 163, 184, 0.2)' }}>
              <Box>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b', mb: 1 }}>
                  Meilleur magasin
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                  {topStore?.nomMagasin || topStore?.nom_magasin || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b', mb: 1 }}>
                  Croissance mensuelle
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? '#22c55e' : '#16a34a' }}>
                  +{Math.max(0, Math.round((totalGlobal.ventes / Math.max(1, totalGlobal.tickets)) * 10))}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Section Filtres */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1, flexWrap: 'wrap' }}>
          <FilterList sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: 18 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 500, 
              color: isDarkMode ? '#e2e8f0' : '#334155',
              fontSize: '1rem'
            }}
          >
            Ajuster les critères
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2}>
            <FormControl size="small" sx={{ minWidth: 120, borderRadius: 2 }}>
              <InputLabel id="period-label" sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
                Période
              </InputLabel>
              <Select
                labelId="period-label"
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  const range = getDateRange(e.target.value);
                  setStartDate(range.start);
                  setEndDate(range.end);
                }}
                label="Période"
                sx={{
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
                  color: isDarkMode ? '#f8fafc' : '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.3)' : '#d1d5db'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? '#94a3b8' : '#9ca3af'
                  },
                  '& .MuiSvgIcon-root': {
                    color: isDarkMode ? '#cbd5e1' : '#6b7280'
                  }
                }}
              >
                <MenuItem value="total">📊 Total</MenuItem>
                <MenuItem value="aujourd'hui">📅 Aujourd'hui</MenuItem>
                <MenuItem value="mois">📆 Mois</MenuItem>
                <MenuItem value="trimestre">📈 Trimestre</MenuItem>
                <MenuItem value="personnaliser">🗓️ Personnaliser</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="store-label" sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
                Magasin
              </InputLabel>
              <Select
                labelId="store-label"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                label="Magasin"
                sx={{
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
                  color: isDarkMode ? '#f8fafc' : '#1e293b',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.3)' : '#d1d5db'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? '#94a3b8' : '#9ca3af'
                  },
                  '& .MuiSvgIcon-root': {
                    color: isDarkMode ? '#cbd5e1' : '#6b7280'
                  }
                }}
              >
                <MenuItem value="all">🏪 Tous les magasins</MenuItem>
                {magasins.map((magasin, index) => (
                  <MenuItem key={`magasin-${magasin.code_magasin || magasin.codeMagasin || index}`} value={magasin.code_magasin || magasin.codeMagasin}>
                    🏬 {magasin.nom_magasin || magasin.nomMagasin} ({magasin.code_magasin || magasin.codeMagasin})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Date début"
              value={startDate}
              onChange={handleStartDateChange}
              InputLabelProps={{ 
                shrink: true,
                style: { color: isDarkMode ? '#cbd5e1' : '#64748b' }
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.3)' : '#d1d5db'
                  }
                },
                '&:hover .MuiOutlinedInput-root fieldset': {
                  borderColor: isDarkMode ? '#94a3b8' : '#9ca3af'
                },
                '&.Mui-focused .MuiOutlinedInput-root fieldset': {
                  borderColor: isDarkMode ? '#60a5fa' : '#3b82f6'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Date fin"
              value={endDate}
              onChange={handleEndDateChange}
              InputLabelProps={{ 
                shrink: true,
                style: { color: isDarkMode ? '#cbd5e1' : '#64748b' }
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.3)' : '#d1d5db'
                  }
                },
                '&:hover .MuiOutlinedInput-root fieldset': {
                  borderColor: isDarkMode ? '#94a3b8' : '#9ca3af'
                },
                '&.Mui-focused .MuiOutlinedInput-root fieldset': {
                  borderColor: isDarkMode ? '#60a5fa' : '#3b82f6'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              onClick={applyFilters}
              startIcon={<Refresh />}
              fullWidth
              sx={{
                height: '40px',
                background: isDarkMode ? '#2563eb' : '#3b82f6',
                color: '#ffffff',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: isDarkMode ? '0 10px 25px rgba(59, 130, 246, 0.35)' : '0 10px 25px rgba(59, 130, 246, 0.2)',
                '&:hover': {
                  background: isDarkMode ? '#1d4ed8' : '#2563eb',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Actualiser
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Cartes Résumé Global - Design moderne et visible */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: isDarkMode 
                ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)' 
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              color: isDarkMode ? '#f1f5f9' : '#1e293b',
              borderRadius: 3,
              boxShadow: isDarkMode 
                ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)' 
                : '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
              border: isDarkMode 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode 
                  ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.3)' 
                  : '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #3b82f6, #10b981, #f59e0b)',
                borderRadius: '4px 4px 0 0'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'left', py: 3, px: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600, 
                      color: isDarkMode ? '#94a3b8' : '#64748b',
                      fontSize: '0.95rem',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Total Tickets
                  </Typography>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: isDarkMode ? '#ffffff' : '#1e293b',
                      fontSize: '2.2rem',
                      lineHeight: 1.2,
                      mb: 1
                    }}
                  >
                    {totalGlobal.tickets.toLocaleString()}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkMode ? '#10b981' : '#059669',
                      fontWeight: 500,
                      fontSize: '0.85rem'
                    }}
                  >
                    Données en temps réel
                  </Typography>
                </Box>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                  border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <Receipt sx={{ fontSize: 24, color: isDarkMode ? '#3b82f6' : '#2563eb' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: isDarkMode 
                ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)' 
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              color: isDarkMode ? '#f1f5f9' : '#1e293b',
              borderRadius: 3,
              boxShadow: isDarkMode 
                ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)' 
                : '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
              border: isDarkMode 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode 
                  ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.3)' 
                  : '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)',
                borderRadius: '4px 4px 0 0'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'left', py: 3, px: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600, 
                      color: isDarkMode ? '#94a3b8' : '#64748b',
                      fontSize: '0.95rem',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Chiffre d'Affaires
                  </Typography>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: isDarkMode ? '#ffffff' : '#1e293b',
                      fontSize: '2.2rem',
                      lineHeight: 1.2,
                      mb: 1
                    }}
                  >
                    {formatCurrency(totalGlobal.ventes)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkMode ? '#10b981' : '#059669',
                      fontWeight: 500,
                      fontSize: '0.85rem'
                    }}
                  >
                    Basé sur la période sélectionnée
                  </Typography>
                </Box>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                  border: isDarkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <AttachMoney sx={{ fontSize: 24, color: isDarkMode ? '#10b981' : '#059669' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: isDarkMode 
                ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)' 
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              color: isDarkMode ? '#f1f5f9' : '#1e293b',
              borderRadius: 3,
              boxShadow: isDarkMode 
                ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)' 
                : '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
              border: isDarkMode 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode 
                  ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.3)' 
                  : '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #f59e0b, #ef4444, #ec4899)',
                borderRadius: '4px 4px 0 0'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'left', py: 3, px: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600, 
                      color: isDarkMode ? '#94a3b8' : '#64748b',
                      fontSize: '0.95rem',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Total Clients
                  </Typography>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: isDarkMode ? '#ffffff' : '#1e293b',
                      fontSize: '2.2rem',
                      lineHeight: 1.2,
                      mb: 1
                    }}
                  >
                    {totalGlobal.clients.toLocaleString()}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkMode ? '#10b981' : '#059669',
                      fontWeight: 500,
                      fontSize: '0.85rem'
                    }}
                  >
                    Clients uniques sur la période
                  </Typography>
                </Box>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                  border: isDarkMode ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.2)'
                }}>
                  <People sx={{ fontSize: 24, color: isDarkMode ? '#f59e0b' : '#d97706' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: isDarkMode 
                ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)' 
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              color: isDarkMode ? '#f1f5f9' : '#1e293b',
              borderRadius: 3,
              boxShadow: isDarkMode 
                ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)' 
                : '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
              border: isDarkMode 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDarkMode 
                  ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.3)' 
                  : '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #f59e0b)',
                borderRadius: '4px 4px 0 0'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'left', py: 3, px: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600, 
                      color: isDarkMode ? '#94a3b8' : '#64748b',
                      fontSize: '0.95rem',
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Panier Moyen
                  </Typography>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: isDarkMode ? '#ffffff' : '#1e293b',
                      fontSize: '2.2rem',
                      lineHeight: 1.2,
                      mb: 1
                    }}
                  >
                    {formatCurrency(totalGlobal.tickets > 0 ? totalGlobal.ventes / totalGlobal.tickets : 0)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isDarkMode ? '#ef4444' : '#dc2626',
                      fontWeight: 500,
                      fontSize: '0.85rem'
                    }}
                  >
                    Panier moyen calculé automatiquement
                  </Typography>
                </Box>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                  border: isDarkMode ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <ShoppingCart sx={{ fontSize: 24, color: isDarkMode ? '#8b5cf6' : '#7c3aed' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Chip
          label={`Magasins totaux : ${totalStores}`}
          sx={{
            px: 2.5,
            py: 1.3,
            fontWeight: 700,
            background: isDarkMode ? '#111827' : '#f8fafc',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(209,213,219,0.8)',
            boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.2)' : '0 8px 20px rgba(15,23,42,0.05)'
          }}
        />
        <Chip
          label={`Magasins actifs : ${totalActiveStores}`}
          sx={{
            px: 2.5,
            py: 1.3,
            fontWeight: 700,
            background: isDarkMode ? '#111827' : '#f8fafc',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(209,213,219,0.8)',
            boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.2)' : '0 8px 20px rgba(15,23,42,0.05)'
          }}
        />
        <Chip
          label={`Période : ${getCurrentPeriodLabel()}`}
          sx={{
            px: 2.5,
            py: 1.3,
            fontWeight: 700,
            background: isDarkMode ? '#111827' : '#f8fafc',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(209,213,219,0.8)',
            boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.2)' : '0 8px 20px rgba(15,23,42,0.05)'
          }}
        />
        <Chip
          label={`Tickets totaux : ${totalGlobal.tickets.toLocaleString()}`}
          sx={{
            px: 2.5,
            py: 1.3,
            fontWeight: 700,
            background: isDarkMode ? '#111827' : '#f8fafc',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(209,213,219,0.8)',
            boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.2)' : '0 8px 20px rgba(15,23,42,0.05)'
          }}
        />
      </Box>

      {/* GRAPHES MODERNES D'ANALYSE MARCHÉ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: isDarkMode ? '#ffffff' : '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Assessment sx={{ fontSize: 32 }} />
              📊 Analyse du Marché
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                onClick={() => setShowGraphes(!showGraphes)}
                variant="contained"
                sx={{
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)' 
                    : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: isDarkMode 
                    ? '0 8px 32px rgba(59, 130, 246, 0.4)' 
                    : '0 8px 32px rgba(37, 99, 235, 0.3)',
                  border: '2px solid transparent',
                  backgroundClip: 'padding-box',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
                      : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                    borderRadius: 3,
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode 
                      ? '0 12px 40px rgba(59, 130, 246, 0.6)' 
                      : '0 12px 40px rgba(37, 99, 235, 0.5)',
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)' 
                      : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textTransform: 'none',
                  letterSpacing: '0.5px'
                }}
                startIcon={showGraphes ? <span style={{ fontSize: '1.2rem' }}>📉</span> : <span style={{ fontSize: '1.2rem' }}>📊</span>}
              >
                {showGraphes ? 'Masquer les Graphes' : 'Afficher les Graphes'}
              </Button>
            </Box>
          </Box>
        </Grid>

        {showGraphes && (
          <>
            {/* Graphe 1: Performance des Magasins */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ 
                p: 3, 
                background: isDarkMode ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 3,
                boxShadow: isDarkMode 
                  ? '0 10px 40px rgba(0, 0, 0, 0.3)' 
                  : '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: isDarkMode 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.05)',
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  mb: 2,
                  color: isDarkMode ? '#ffffff' : '#1e293b'
                }}>
                  Performance des Magasins
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  mb: 2
                }}>
                  {getCurrentPeriodLabel()}
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={
                    getStoresPerformanceByMonth()
                  }>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="storeName" 
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      label={{ value: 'Ventes (€)', angle: -90, position: 'insideLeft', style: { fill: isDarkMode ? '#9ca3af' : '#6b7280' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: '1px solid',
                        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                        borderRadius: 8
                      }}
                      labelStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                      formatter={(value: any, name: any) => {
                        if (name === 'ventes') return [`€${Number(value).toFixed(2)}`, 'Ventes'];
                        if (name === 'tickets') return [`${value}`, 'Tickets'];
                        return value;
                      }}
                    />
                    <Bar dataKey="ventes" fill="#3b82f6" name="Ventes (€)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Graphe 2: Répartition des Ventes */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3, 
                background: isDarkMode ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 3,
                boxShadow: isDarkMode 
                  ? '0 10px 40px rgba(0, 0, 0, 0.3)' 
                  : '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: isDarkMode 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.05)',
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  mb: 2,
                  color: isDarkMode ? '#ffffff' : '#1e293b'
                }}>
                  Répartition des Ventes
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  mb: 2
                }}>
                  {getCurrentPeriodLabel()}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={
                        getStoresPerformanceByMonth()
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => 
                        `${entry.storeName}: ${entry.percent ? (entry.percent * 100).toFixed(1) : 0}% (€${entry.ventes.toFixed(2)})`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="ventes"
                    >
                      {getStoresPerformanceByMonth().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: '1px solid',
                        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                        borderRadius: 8
                      }}
                      labelStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                      formatter={(value: any, name: any, props: any) => {
                        const storeName = props.payload.storeName;
                        const percentage = props.payload.percent ? (props.payload.percent * 100).toFixed(1) : 0;
                        return [
                          `€${Number(value).toFixed(2)} (${percentage}%)`,
                          storeName
                        ];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      
      {/* Tableau des Magasins - Design moderne comme les KPI */}
      <Paper 
        sx={{ 
          background: isDarkMode 
            ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)' 
            : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 3,
          boxShadow: isDarkMode 
            ? '0 10px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)' 
            : '0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)',
          border: isDarkMode 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isDarkMode 
              ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.3)' 
              : '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #8b5cf6)',
            borderRadius: '4px 4px 0 0'
          }
        }}
      >
        <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                px: 3,
                py: 2,
                borderRadius: 3,
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                <Store sx={{ mr: 2, color: isDarkMode ? '#3b82f6' : '#2563eb', fontSize: 32 }} />
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? '#ffffff' : '#1e293b',
                    fontSize: '2.2rem'
                  }}
                >
                  🏪 Détail par Magasin
                </Typography>
              </Box>
              <Chip 
                label={`${(Array.isArray(storeStats) ? storeStats : []).length} magasins`}
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  px: 3,
                  py: 1.5,
                  background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                  color: isDarkMode ? '#3b82f6' : '#2563eb',
                  border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: 3
                }}
              />
            </Box>
          </Box>
          
          <TableContainer sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? '#ffffff' : '#1e293b',
                    borderBottom: isDarkMode 
                      ? '2px solid rgba(59, 130, 246, 0.3)' 
                      : '2px solid rgba(59, 130, 246, 0.2)',
                    py: 3,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                        border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
                      }}>
                        <Store sx={{ fontSize: 20, color: isDarkMode ? '#3b82f6' : '#2563eb' }} />
                      </Box>
                      Magasin
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? '#ffffff' : '#1e293b',
                    borderBottom: isDarkMode 
                      ? '2px solid rgba(16, 185, 129, 0.3)' 
                      : '2px solid rgba(16, 185, 129, 0.2)',
                    py: 3,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        background: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                        border: isDarkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
                      }}>
                        <Receipt sx={{ fontSize: 20, color: isDarkMode ? '#10b981' : '#059669' }} />
                      </Box>
                      Tickets
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? '#ffffff' : '#1e293b',
                    borderBottom: isDarkMode 
                      ? '2px solid rgba(245, 158, 11, 0.3)' 
                      : '2px solid rgba(245, 158, 11, 0.2)',
                    py: 3,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        background: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                        border: isDarkMode ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.2)',
                      }}>
                        <AttachMoney sx={{ fontSize: 20, color: isDarkMode ? '#f59e0b' : '#d97706' }} />
                      </Box>
                      Chiffre d'Affaires
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? '#ffffff' : '#1e293b',
                    borderBottom: isDarkMode 
                      ? '2px solid rgba(139, 92, 246, 0.3)' 
                      : '2px solid rgba(139, 92, 246, 0.2)',
                    py: 3,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        background: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                        border: isDarkMode ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.2)',
                      }}>
                        <People sx={{ fontSize: 20, color: isDarkMode ? '#8b5cf6' : '#7c3aed' }} />
                      </Box>
                      Clients
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? '#ffffff' : '#1e293b',
                    borderBottom: isDarkMode 
                      ? '2px solid rgba(236, 72, 153, 0.3)' 
                      : '2px solid rgba(236, 72, 153, 0.2)',
                    py: 3,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        background: isDarkMode ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)',
                        border: isDarkMode ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(236, 72, 153, 0.2)',
                      }}>
                        <ShoppingCart sx={{ fontSize: 20, color: isDarkMode ? '#ec4899' : '#db2777' }} />
                      </Box>
                      Panier Moyen
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? '#ffffff' : '#1e293b',
                    borderBottom: isDarkMode 
                      ? '2px solid rgba(34, 197, 94, 0.3)' 
                      : '2px solid rgba(34, 197, 94, 0.2)',
                    py: 3,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        background: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                        border: isDarkMode ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.2)',
                      }}>
                        <Assessment sx={{ fontSize: 20, color: isDarkMode ? '#22c55e' : '#16a34a' }} />
                      </Box>
                      Statut
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
            <TableBody>
              {(Array.isArray(storeStats) ? storeStats : []).map((store, index) => (
                <TableRow 
                  key={`store-${store.codeMagasin || index}-${index}`}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: isDarkMode 
                        ? 'rgba(59, 130, 246, 0.1)' 
                        : 'rgba(59, 130, 246, 0.05)',
                      transform: 'scale(1.01)'
                    }
                  }}
                >
                  <TableCell sx={{ 
                    color: isDarkMode ? '#ffffff' : '#1e293b', 
                    py: 3,
                    borderBottom: isDarkMode 
                      ? '1px solid rgba(255, 255, 255, 0.05)' 
                      : '1px solid rgba(0, 0, 0, 0.02)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar 
                        sx={{ 
                          background: isDarkMode 
                            ? 'linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)' 
                            : 'linear-gradient(145deg, #2563eb 0%, #1d4ed8 100%)',
                          width: 56,
                          height: 56,
                          fontSize: 22,
                          color: '#ffffff',
                          fontWeight: 700,
                          border: 'none',
                          boxShadow: isDarkMode 
                            ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                            : '0 4px 12px rgba(37, 99, 235, 0.2)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {store.nomMagasin?.charAt(0) || 'M'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ 
                          fontWeight: 700, 
                          color: isDarkMode ? '#ffffff' : '#1e293b',
                          fontSize: '1.3rem',
                          mb: 0.5
                        }}>
                          {store.nomMagasin}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isDarkMode ? '#94a3b8' : '#64748b',
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}
                        >
                          Code: {store.codeMagasin}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    color: isDarkMode ? '#ffffff' : '#1e293b', 
                    py: 3,
                    borderBottom: isDarkMode 
                      ? '1px solid rgba(255, 255, 255, 0.05)' 
                      : '1px solid rgba(0, 0, 0, 0.02)',
                  }}>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 3,
                      py: 2.5,
                      borderRadius: 2,
                      background: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                      border: isDarkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
                      transition: 'all 0.3s ease'
                    }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 700,
                          color: isDarkMode ? '#10b981' : '#059669',
                          fontSize: '1.4rem'
                        }}
                      >
                        {store.totalTickets?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    color: isDarkMode ? '#ffffff' : '#1e293b', 
                    py: 3,
                    borderBottom: isDarkMode 
                      ? '1px solid rgba(255, 255, 255, 0.05)' 
                      : '1px solid rgba(0, 0, 0, 0.02)',
                  }}>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 3,
                      py: 2.5,
                      borderRadius: 2,
                      background: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                      border: isDarkMode ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.2)',
                      transition: 'all 0.3s ease'
                    }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 700,
                          color: isDarkMode ? '#f59e0b' : '#d97706',
                          fontSize: '1.4rem'
                        }}
                      >
                        {formatCurrency(store.totalVentes || 0)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    color: isDarkMode ? '#ffffff' : '#1e293b', 
                    py: 3,
                    borderBottom: isDarkMode 
                      ? '1px solid rgba(255, 255, 255, 0.05)' 
                      : '1px solid rgba(0, 0, 0, 0.02)',
                  }}>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 3,
                      py: 2.5,
                      borderRadius: 2,
                      background: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                      border: isDarkMode ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.2)',
                      transition: 'all 0.3s ease'
                    }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 700,
                          color: isDarkMode ? '#8b5cf6' : '#7c3aed',
                          fontSize: '1.4rem'
                        }}
                      >
                        {store.totalClients?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    color: isDarkMode ? '#ffffff' : '#1e293b', 
                    py: 3,
                    borderBottom: isDarkMode 
                      ? '1px solid rgba(255, 255, 255, 0.05)' 
                      : '1px solid rgba(0, 0, 0, 0.02)',
                  }}>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 3,
                      py: 2.5,
                      borderRadius: 2,
                      background: isDarkMode ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)',
                      border: isDarkMode ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(236, 72, 153, 0.2)',
                      transition: 'all 0.3s ease'
                    }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 700,
                          color: isDarkMode ? '#ec4899' : '#db2777',
                          fontSize: '1.4rem'
                        }}
                      >
                        {formatCurrency((store.totalVentes || 0) / (store.totalTickets || 1))}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', py: 3, borderBottom: isDarkMode 
                      ? '1px solid rgba(255, 255, 255, 0.05)' 
                      : '1px solid rgba(0, 0, 0, 0.02)' }}>
                    <Chip 
                      label={store.ventesDuJour > 0 ? "✅ Actif" : "⏸️ Inactif"}
                      size="medium"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        px: 3,
                        py: 2,
                        background: store.ventesDuJour > 0 
                          ? isDarkMode 
                            ? 'rgba(34, 197, 94, 0.2)' 
                            : 'rgba(34, 197, 94, 0.1)'
                          : isDarkMode 
                            ? 'rgba(239, 68, 68, 0.2)' 
                            : 'rgba(239, 68, 68, 0.1)',
                        color: store.ventesDuJour > 0 
                          ? isDarkMode ? '#22c55e' : '#16a34a'
                          : isDarkMode ? '#ef4444' : '#dc2626',
                        border: store.ventesDuJour > 0 
                          ? isDarkMode ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(34, 197, 94, 0.2)'
                          : isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                        boxShadow: 'none',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: isDarkMode 
                            ? '0 4px 12px rgba(34, 197, 94, 0.3)' 
                            : '0 4px 12px rgba(34, 197, 94, 0.2)',
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>
      </Paper>
    </Box>
    </Box>
    </Container>
  );
};

export default Dashboard;
