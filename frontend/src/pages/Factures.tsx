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
  CircularProgress,
  Alert,
  Chip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Grid,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Search,
  Description,
  Download,
  Email,
  Close,
  Send,
  AttachFile,
  InsertDriveFile,
  ReceiptLong,
  Store,
  PictureAsPdf,
} from '@mui/icons-material';
import api from '../services/api';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
import { PermissionAlert, usePermissionAlert } from '../components/PermissionAlert';
import { apiConfig } from '../config/apiConfig';

interface Facture {
  VTCLEUNIK: number;
  Numero: string;
  Date: string;
  Type: string;
  Client_No: string;
  Client_Nom: string;
  Total_B_HT: string;
  Total_Tva: string;
  Total_TTC: string;
  Etat: string;
  Code_magasin: string;
  Caisse?: string;
  magasin?: string;
  Magasin?: string;
  Peppol_Statut: string;
  Email_Client?: string;
  has_pdf?: boolean;
  nomMagasin?: string;
}

const Factures: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const { user } = useAuth();
  const { alert, showPermissionAlert, closeAlert } = usePermissionAlert();
  const isAdmin = user?.role === 'admin';

  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExportPeriod, setSelectedExportPeriod] = useState("aujourd'hui");
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedFactureForEmail, setSelectedFactureForEmail] = useState<Facture | null>(null);

  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: '',
    cc: '',
    bcc: '',
  });

  const [sendingEmail, setSendingEmail] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const formatCurrency = (amount: string | null | undefined) => {
    const numAmount = Number(String(amount ?? '0').replace(',', '.'));

    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(isNaN(numAmount) ? 0 : numAmount);
  };

  const facturesAvecPdf = factures.filter((facture) => facture.has_pdf).length;
  const nombreMagasins = new Set(factures.map((facture) => facture.nomMagasin).filter(Boolean)).size;

  const statCards = [
    {
      label: 'Factures',
      value: factures.length,
      description: 'Enregistrées',
      color: '#2563eb',
      icon: <ReceiptLong fontSize="small" />,
    },
    {
      label: 'PDF disponibles',
      value: facturesAvecPdf,
      description: 'Documents',
      color: '#f97316',
      icon: <PictureAsPdf fontSize="small" />,
    },
    {
      label: 'Magasins',
      value: nombreMagasins,
      description: 'Points de vente',
      color: '#7c3aed',
      icon: <Store fontSize="small" />,
    },
  ];

  const formatFactureDateForCompare = (date?: string) => {
    return date ? date.replace(/-/g, '') : '';
  };

  const fetchFactures = async () => {
    try {
      setLoading(true);

      let magasinsRes;

      try {
        magasinsRes = await api.get(apiConfig.endpoints.magasins);
      } catch {
        magasinsRes = await api.get(apiConfig.endpoints.magasins);
      }

      const magasinsData = magasinsRes.data.data || [];

      const response = await api.get(apiConfig.endpoints.factures);
      const facturesData = response.data.data || [];

      const facturesAvecNoms = facturesData.map((facture: Facture) => {
        let codeMagasin = facture.Code_magasin || facture.Caisse || facture.magasin || facture.Magasin;

        if (!codeMagasin && facture.Numero) {
          const numeroParts = facture.Numero.split('-');
          if (numeroParts.length >= 1) {
            codeMagasin = numeroParts[0];
          }
        }

        if (!codeMagasin) {
          codeMagasin = '1';
        }

        const magasin = magasinsData.find(
          (m: any) => m.code_magasin === codeMagasin || m.codeMagasin === codeMagasin
        );

        return {
          ...facture,
          nomMagasin: magasin?.nom_magasin || magasin?.nomMagasin || `Magasin ${codeMagasin}`,
        };
      });

      setFactures(facturesAvecNoms);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des factures');
      console.error('Error fetching factures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const filteredFactures = factures.filter(
    (facture) =>
      facture.Numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.Client_Nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.Date?.includes(searchTerm)
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectFacture = (facture: Facture) => {
    setSelectedFacture(facture);
  };

  const getEtatLabel = (etat: string) => {
    switch (etat?.toLowerCase()) {
      case 'payée':
        return 'Payée';
      case 'en attente':
        return 'En attente';
      case 'annulée':
        return 'Annulée';
      default:
        return etat || 'Normal';
    }
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
      let filteredFacturesForExport = factures;

      if (selectedExportPeriod !== 'personnaliser') {
        const dateRange = getDateRange(selectedExportPeriod);
        const startDate = dateRange.start;
        const endDate = dateRange.end;

        filteredFacturesForExport = factures.filter((facture) => {
          const factureDate = formatFactureDateForCompare(facture.Date);
          return factureDate >= startDate.replace(/-/g, '') && factureDate <= endDate.replace(/-/g, '');
        });
      } else if (exportStartDate && exportEndDate) {
        filteredFacturesForExport = factures.filter((facture) => {
          const factureDate = formatFactureDateForCompare(facture.Date);
          const start = exportStartDate.replace(/-/g, '');
          const end = exportEndDate.replace(/-/g, '');

          return factureDate >= start && factureDate <= end;
        });
      }

      const excelData = filteredFacturesForExport.map((facture) => ({
        'Numéro Facture': facture.Numero,
        Date: facture.Date,
        Type: facture.Type || 'Standard',
        Client: facture.Client_Nom || facture.Client_No || 'Non spécifié',
        'Total HT': parseFloat(facture.Total_B_HT || '0').toFixed(2),
        'Total TVA': parseFloat(facture.Total_Tva || '0').toFixed(2),
        'Total TTC': parseFloat(facture.Total_TTC || '0').toFixed(2),
        État: getEtatLabel(facture.Etat),
        Magasin: facture.nomMagasin || facture.Code_magasin || 'Non spécifié',
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, 'Factures');
      XLSX.writeFile(wb, `Factures_MEGACentral_${new Date().toISOString().slice(0, 10)}.xlsx`);

      setSnackbar({
        open: true,
        message: `Export réussi : ${filteredFacturesForExport.length} factures exportées`,
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

  const handleDownloadFacturePDF = async (facture: Facture) => {
    try {
      setLoading(true);

      const response = await api.get(`/factures/${facture.VTCLEUNIK}/pdf`);

      if (!response.data.has_pdf || !response.data.pdf_base64) {
        throw new Error('Aucun PDF disponible pour cette facture dans la base de données');
      }

      let pdfBase64 = response.data.pdf_base64;

      if (pdfBase64.includes('data:application/pdf;filename=')) {
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
      link.download = response.data.filename || `facture-${facture.Numero}-${new Date().toISOString().slice(0, 10)}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: `Facture ${facture.Numero} téléchargée avec succès`,
        severity: 'success',
      });
    } catch (err) {
      console.error('ERREUR TÉLÉCHARGEMENT PDF:', err);
      setError('Erreur lors du téléchargement du PDF: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmailModal = (facture: Facture) => {
    if (!isAdmin) {
      showPermissionAlert("Envoi d'email non autorisé. Cette action nécessite un compte administrateur.");
      return;
    }

    setSelectedFactureForEmail(facture);

    const clientEmail = facture.Email_Client || '';

    setEmailData({
      to: clientEmail,
      subject: `Facture MEGA-CENTRAL N°${facture.Numero}`,
      message: `Bonjour ${facture.Client_Nom || facture.Client_No || 'Client'},\n\nVeuillez trouver ci-joint votre facture N°${
        facture.Numero
      } d'un montant de ${formatCurrency(
        facture.Total_TTC
      )}.\n\nCette facture a été générée le ${new Date().toLocaleDateString(
        'fr-FR'
      )}.\n\nPour toute question, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe MEGA-CENTRAL`,
      cc: '',
      bcc: '',
    });

    setEmailModalOpen(true);
  };

  const handleCloseEmailModal = () => {
    setEmailModalOpen(false);
    setSelectedFactureForEmail(null);

    setEmailData({
      to: '',
      subject: '',
      message: '',
      cc: '',
      bcc: '',
    });
  };

  const handleSendEmail = async () => {
    if (!isAdmin) {
      showPermissionAlert("Envoi d'email non autorisé. Cette action nécessite un compte administrateur.");
      return;
    }

    if (!selectedFactureForEmail || !emailData.to) {
      setSnackbar({
        open: true,
        message: "Veuillez renseigner l'adresse email du destinataire",
        severity: 'error',
      });
      return;
    }

    try {
      setSendingEmail(true);

      const pdfResponse = await api.get(
        `/factures/${selectedFactureForEmail.VTCLEUNIK}/pdf`
      );

      if (!pdfResponse.data.has_pdf || !pdfResponse.data.pdf_base64) {
        throw new Error('Aucun PDF disponible pour cette facture dans la base de données');
      }

      let pdfBase64 = pdfResponse.data.pdf_base64;

      if (pdfBase64.includes('data:application/pdf;filename=')) {
        pdfBase64 = pdfBase64.replace(/data:application\/pdf[^,]*,/, '');
      } else if (pdfBase64.includes('data:application/pdf;base64,')) {
        pdfBase64 = pdfBase64.replace('data:application/pdf;base64,', '');
      } else if (pdfBase64.includes('base64,')) {
        pdfBase64 = pdfBase64.split('base64,')[1];
      }

      await api.post('/send-email', {
        to: emailData.to,
        subject: emailData.subject,
        message: emailData.message,
        cc: emailData.cc,
        bcc: emailData.bcc,
        attachment: pdfBase64,
      });

      setSnackbar({
        open: true,
        message: `Facture N°${selectedFactureForEmail.Numero} envoyée avec succès à ${emailData.to}`,
        severity: 'success',
      });

      handleCloseEmailModal();
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);

      setSnackbar({
        open: true,
        message: "Erreur lors de l'envoi de l'email. Veuillez réessayer.",
        severity: 'error',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const paginationTop = (
    <TablePagination
      rowsPerPageOptions={[10, 25, 50, 100]}
      component="div"
      count={filteredFactures.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      labelRowsPerPage="Lignes"
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
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
      <Box
        p={2}
        sx={{
          minHeight: '100vh',
          background: isDarkMode
            ? 'linear-gradient(135deg, #07111f 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #eef4ff 0%, #f8fafc 45%, #ffffff 100%)',
        }}
      >
        <Alert
          severity="error"
          sx={{ borderRadius: 2.5 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              Fermer
            </Button>
          }
        >
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
              <Description sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={950}>
                Gestion des factures
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.85rem' }}>
                Consultation, export, PDF et envoi par email
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Download />}
              onClick={() => setExportDialogOpen(true)}
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

            <Button
              variant="outlined"
              size="small"
              onClick={fetchFactures}
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
                },
              }}
            >
              Actualiser
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={4} md={4} key={stat.label}>
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
            label="Rechercher une facture"
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

          {selectedFacture && (
            <Box
              mt={1.5}
              p={1.5}
              sx={{
                bgcolor: isDarkMode ? alpha('#2563eb', 0.12) : alpha('#2563eb', 0.08),
                borderRadius: 2.5,
                border: `1px solid ${alpha('#2563eb', 0.16)}`,
              }}
            >
              <Typography variant="body2" color="primary" fontWeight={800}>
                📄 Facture sélectionnée : {selectedFacture.Numero} - {selectedFacture.Client_Nom}
              </Typography>
            </Box>
          )}
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
              Liste des factures
            </Typography>

            <Chip
              size="small"
              label={`${filteredFactures.length} résultat(s)`}
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
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Numéro</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Total TTC</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Total HT</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Magasin</TableCell>
                <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredFactures.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((facture) => (
                <TableRow
                  key={facture.VTCLEUNIK}
                  hover
                  selected={selectedFacture?.VTCLEUNIK === facture.VTCLEUNIK}
                  onClick={() => handleSelectFacture(facture)}
                  sx={{
                    cursor: 'pointer',
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
                      label={facture.Type || 'Standard'}
                      color="primary"
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

                  <TableCell>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Description fontSize="small" color="primary" />
                      <Typography fontWeight={900} fontSize="0.84rem">
                        {facture.Numero}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>{facture.Date}</TableCell>

                  <TableCell>
                    <Typography fontWeight={900} color="primary" fontSize="0.84rem">
                      {formatCurrency(facture.Total_TTC)}
                    </Typography>
                  </TableCell>

                  <TableCell>{formatCurrency(facture.Total_B_HT)}</TableCell>
                  <TableCell>{facture.Client_Nom || facture.Client_No || '-'}</TableCell>

                  <TableCell>
                    <Typography fontWeight={800} fontSize="0.84rem">
                      {facture.nomMagasin}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<InsertDriveFile fontSize="small" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFacturePDF(facture);
                        }}
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

                      <Tooltip title={isAdmin ? 'Envoyer par email' : 'Action réservée à l’administrateur'}>
                        <span>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<Email fontSize="small" />}
                            disabled={!isAdmin}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEmailModal(facture);
                            }}
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
                            Email
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {filteredFactures.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucune facture trouvée</Typography>
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
          Exporter les factures
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
            Choisissez la période pour exporter les factures
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

      <Dialog
        open={emailModalOpen}
        onClose={handleCloseEmailModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            py: 1.7,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Email sx={{ fontSize: 24 }} />

            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Envoyer la facture par email
              </Typography>

              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Facture N°{selectedFactureForEmail?.Numero} -{' '}
                {selectedFactureForEmail?.Client_Nom || selectedFactureForEmail?.Client_No}
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={handleCloseEmailModal} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.2 }}>
          <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            mb={2}
            p={1.5}
            sx={{
              bgcolor: alpha('#1976d2', 0.1),
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#1976d2', 0.3),
            }}
          >
            <AttachFile sx={{ color: '#1976d2' }} />

            <Typography variant="body2" color="text.secondary">
              <strong>Pièce jointe :</strong> facture-{selectedFactureForEmail?.Numero}.pdf (
              {formatCurrency(selectedFactureForEmail?.Total_TTC)})
            </Typography>
          </Box>

          <Grid container spacing={1.7}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Email du destinataire *"
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Objet"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={5}
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha('#94a3b8', 0.2)}` }}>
          <Button onClick={handleCloseEmailModal} variant="outlined" sx={{ borderRadius: 2.5, px: 2.5 }}>
            Annuler
          </Button>

          <Button
            onClick={handleSendEmail}
            variant="contained"
            disabled={sendingEmail || !emailData.to || !isAdmin}
            startIcon={sendingEmail ? <CircularProgress size={18} /> : <Send />}
            sx={{
              borderRadius: 2.5,
              px: 2.5,
              fontWeight: 900,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            }}
          >
            {sendingEmail ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogActions>
      </Dialog>

      <PermissionAlert message={alert.message} open={alert.open} onClose={closeAlert} />
    </Box>
  );
};

export default Factures;
