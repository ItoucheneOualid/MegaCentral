import React, { useState, useEffect } from 'react';
import {
  alpha,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Search,
  PictureAsPdf,
  CloudDone,
  Download,
  ConfirmationNumber,
  Store,
  ReceiptLong,
} from '@mui/icons-material';
import api from '../services/api';
import * as XLSX from 'xlsx';
import { useTranslation } from '../contexts/TranslationContext';

interface Ticket {
  Numero: string;
  Date: string;
  Total_TTC: string;
  Total_HT: string;
  Total_TVA: string;
  Etat: string;
  Code_Magasin: string;
  Caisse: string;
  Client_No: string;
  Client_Nom: string;
  has_pdf?: boolean;
  nomMagasin?: string;
}

const Tickets: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExportPeriod, setSelectedExportPeriod] = useState("aujourd'hui");
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const formatCurrency = (amount: string | null) => {
    const value = Number(amount || 0);

    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(isNaN(value) ? 0 : value);
  };

  const nombreMagasins = new Set(tickets.map((ticket) => ticket.nomMagasin).filter(Boolean)).size;

  const statCards = [
    {
      label: 'Tickets',
      value: tickets.length,
      description: 'Enregistrés',
      color: '#2563eb',
      icon: <ConfirmationNumber fontSize="small" />,
    },
    {
      label: 'Magasins',
      value: nombreMagasins,
      description: 'Points de vente',
      color: '#7c3aed',
      icon: <Store fontSize="small" />,
    },
  ];

  const fetchTickets = async () => {
    try {
      setLoading(true);

      let magasinsRes;

      try {
        magasinsRes = await api.get('/magasins');
      } catch {
        magasinsRes = await api.get('/magasins');
      }

      const magasinsData = magasinsRes.data.data || [];

      const response = await api.get('/tickets');
      const ticketsData = response.data.data || [];

      const ticketsAvecNoms = ticketsData.map((ticket: Ticket) => {
        const codeMagasin = ticket.Code_Magasin || ticket.Caisse || '1';

        const magasin = magasinsData.find(
          (m: any) => m.code_magasin === codeMagasin || m.codeMagasin === codeMagasin
        );

        return {
          ...ticket,
          nomMagasin: magasin?.nom_magasin || `Magasin ${codeMagasin}`,
        };
      });

      setTickets(ticketsAvecNoms);
      setError(null);
    } catch (err) {
      setError(t.tickets.erreurChargement);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.Numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.Client_Nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.Date?.includes(searchTerm)
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getDateRange = (period: string) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    switch (period) {
      case "aujourd'hui":
        return {
          start: startOfDay.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };

      case 'semaine': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return {
          start: startOfWeek.toISOString().split('T')[0],
          end: endOfWeek.toISOString().split('T')[0],
        };
      }

      case 'mois': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        return {
          start: startOfMonth.toISOString().split('T')[0],
          end: endOfMonth.toISOString().split('T')[0],
        };
      }

      case 'trimestre': {
        const quarter = Math.floor(today.getMonth() / 3);
        const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(today.getFullYear(), quarter * 3 + 3, 0);

        return {
          start: startOfQuarter.toISOString().split('T')[0],
          end: endOfQuarter.toISOString().split('T')[0],
        };
      }

      case 'annee': {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);

        return {
          start: startOfYear.toISOString().split('T')[0],
          end: endOfYear.toISOString().split('T')[0],
        };
      }

      default:
        return {
          start: startOfDay.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
    }
  };

  const handleExportByPeriod = () => {
    try {
      let filteredTicketsForExport = tickets;

      if (selectedExportPeriod !== 'personnaliser') {
        const dateRange = getDateRange(selectedExportPeriod);
        const startDate = dateRange.start;
        const endDate = dateRange.end;

        filteredTicketsForExport = tickets.filter((ticket) => {
          const ticketDate = ticket.Date ? ticket.Date.replace(/-/g, '') : '';
          return ticketDate >= startDate.replace(/-/g, '') && ticketDate <= endDate.replace(/-/g, '');
        });
      } else if (exportStartDate && exportEndDate) {
        filteredTicketsForExport = tickets.filter((ticket) => {
          const ticketDate = ticket.Date ? ticket.Date.replace(/-/g, '') : '';
          const start = exportStartDate.replace(/-/g, '');
          const end = exportEndDate.replace(/-/g, '');

          return ticketDate >= start && ticketDate <= end;
        });
      }

      const excelData = filteredTicketsForExport.map((ticket) => ({
        'Numéro Ticket': ticket.Numero,
        Date: ticket.Date,
        Magasin: ticket.nomMagasin || 'Non spécifié',
        Client: ticket.Client_Nom || 'Non spécifié',
        'Total HT': parseFloat(ticket.Total_HT || '0').toFixed(2),
        'Total TTC': parseFloat(ticket.Total_TTC || '0').toFixed(2),
        État: ticket.Etat || 'Normal',
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
      XLSX.writeFile(wb, `Tickets_MEGACentral_${new Date().toISOString().slice(0, 10)}.xlsx`);

      setSnackbar({
        open: true,
        message: `Export réussi : ${filteredTicketsForExport.length} tickets exportés`,
        severity: 'success',
      });

      setExportDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);

      setSnackbar({
        open: true,
        message: "Erreur lors de l'export Excel",
        severity: 'error',
      });
    }
  };

  const handleExportPDF = async (ticket: Ticket) => {
    try {
      setLoading(true);

      const response = await api.get(`/tickets/pdf/${ticket.Numero}`);

      if (!response.data.has_pdf || !response.data.pdf_base64) {
        throw new Error('Aucun PDF disponible pour ce ticket dans la base de données');
      }

      let pdfBase64 = response.data.pdf_base64;

      if (pdfBase64.includes('data:application/pdf;base64,data:application/pdf')) {
        pdfBase64 = pdfBase64.replace(/data:application\/pdf;base64,/, '').replace(/data:application\/pdf[^,]*,/, '');
      } else if (pdfBase64.includes('data:application/pdf;filename=')) {
        pdfBase64 = pdfBase64.replace(/data:application\/pdf[^,]*,/, '');
      } else if (pdfBase64.includes('data:application/pdf;base64,')) {
        pdfBase64 = pdfBase64.replace('data:application/pdf;base64,', '');
      } else if (pdfBase64.includes('base64,')) {
        pdfBase64 = pdfBase64.split('base64,')[1];
      }

      pdfBase64 = pdfBase64.replace(/\s/g, '').replace(/[^A-Za-z0-9+/=]/g, '');

      if (!pdfBase64 || pdfBase64.length === 0) {
        throw new Error('Base64 vide ou invalide');
      }

      if (!pdfBase64.startsWith('JVBER')) {
        throw new Error('Le base64 ne contient pas de données PDF valides');
      }

      const paddingLength = (4 - (pdfBase64.length % 4)) % 4;
      pdfBase64 += '='.repeat(paddingLength);

      const binaryString = window.atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = response.data.filename || `${ticket.Numero}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: `Ticket ${ticket.Numero} téléchargé avec succès`,
        severity: 'success',
      });
    } catch (err) {
      console.error('ERREUR TÉLÉCHARGEMENT PDF:', err);

      setSnackbar({
        open: true,
        message: `Erreur lors du téléchargement du PDF: ${(err as Error).message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const paginationTop = (
    <TablePagination
      rowsPerPageOptions={[10, 25, 50, 100]}
      component="div"
      count={filteredTickets.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      labelRowsPerPage="Lignes"
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t.tickets.sur} ${count}`}
      sx={{
        borderRadius: 2,
        '.MuiTablePagination-toolbar': {
          minHeight: 42,
          px: 1,
        },
        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
          fontSize: '0.8rem',
          m: 0,
        },
        '.MuiTablePagination-actions button': {
          p: 0.5,
        },
      }}
    />
  );

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

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error" sx={{ borderRadius: 2.5 }}>
          {error}
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
              <ReceiptLong sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={950}>
                {t.tickets.title}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.85rem' }}>
                Consultation, export et téléchargement des tickets
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => setExportDialogOpen(true)}
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
            Exporter
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={6} key={stat.label}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
                border: `1px solid ${alpha(stat.color, 0.18)}`,
                boxShadow: isDarkMode ? '0 12px 30px rgba(0,0,0,0.2)' : '0 12px 30px rgba(15,23,42,0.06)',
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
          <TextField
            fullWidth
            size="small"
            placeholder={t.tickets.recherchePlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
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
              Liste des tickets
            </Typography>

            <Chip
              size="small"
              label={`${filteredTickets.length} résultat(s)`}
              color="primary"
              sx={{ fontWeight: 900, borderRadius: 2 }}
            />
          </Stack>

          {paginationTop}
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 'calc(100vh - 330px)' }}>
          <Table stickyHeader size="small">
            <TableHead
              sx={{
                bgcolor: isDarkMode ? alpha('#2563eb', 0.12) : alpha('#2563eb', 0.08),
              }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>{t.tickets.numero}</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>{t.tickets.date}</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>{t.tickets.totalHT}</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>{t.tickets.totalTTC}</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>{t.tickets.client}</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Magasin</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>{t.tickets.actions}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ticket) => (
                <TableRow
                  key={ticket.Numero}
                  hover
                  sx={{
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
                      label={ticket.Numero}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 800,
                        borderRadius: 1.5,
                        height: 23,
                        fontSize: '0.72rem',
                      }}
                    />
                  </TableCell>

                  <TableCell>{ticket.Date}</TableCell>
                  <TableCell>{formatCurrency(ticket.Total_HT)}</TableCell>

                  <TableCell>
                    <Typography fontWeight={900} color="primary" fontSize="0.84rem">
                      {formatCurrency(ticket.Total_TTC)}
                    </Typography>
                  </TableCell>

                  <TableCell>{ticket.Client_Nom || t.tickets.nonSpecifie}</TableCell>

                  <TableCell>
                    <Typography fontWeight={800} fontSize="0.84rem">
                      {ticket.nomMagasin}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PictureAsPdf fontSize="small" />}
                        onClick={() => handleExportPDF(ticket)}
                        sx={{
                          minWidth: 'auto',
                          px: 1,
                          py: 0.4,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                        }}
                      >
                        PDF
                      </Button>

                      {ticket.has_pdf && <CloudDone fontSize="small" color="success" titleAccess="Ticket disponible" />}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {filteredTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucun ticket trouvé</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 950, color: 'primary.main', textAlign: 'center', pb: 1 }}>
          Exporter les Tickets
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
            Choisissez la période pour exporter les tickets
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Période</InputLabel>

            <Select
              value={selectedExportPeriod}
              onChange={(e) => setSelectedExportPeriod(e.target.value)}
              label="Période"
            >
              <MenuItem value="aujourd'hui">Aujourd'hui</MenuItem>
              <MenuItem value="semaine">Cette semaine</MenuItem>
              <MenuItem value="mois">Ce mois</MenuItem>
              <MenuItem value="trimestre">Ce trimestre</MenuItem>
              <MenuItem value="annee">Cette année</MenuItem>
              <MenuItem value="personnaliser">Personnaliser</MenuItem>
            </Select>
          </FormControl>

          {selectedExportPeriod === 'personnaliser' && (
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <TextField
                size="small"
                label="Date de début"
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                size="small"
                label="Date de fin"
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedExportPeriod !== 'personnaliser'
                ? `Export des tickets du ${getDateRange(selectedExportPeriod).start} au ${
                    getDateRange(selectedExportPeriod).end
                  }`
                : exportStartDate && exportEndDate
                  ? `Export des tickets du ${exportStartDate} au ${exportEndDate}`
                  : 'Veuillez sélectionner les dates'}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={() => setExportDialogOpen(false)} sx={{ mr: 1, borderRadius: 2.5 }}>
            Annuler
          </Button>

          <Button
            onClick={handleExportByPeriod}
            variant="contained"
            sx={{ px: 3, borderRadius: 2.5, fontWeight: 900 }}
            disabled={selectedExportPeriod === 'personnaliser' && (!exportStartDate || !exportEndDate)}
          >
            Exporter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tickets;
