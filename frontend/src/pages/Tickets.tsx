import React, { useState, useEffect } from 'react';
import {
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
  IconButton,
  Tooltip,
  alpha,
  Grid,
} from '@mui/material';
import { 
  Search, 
  Refresh, 
  Visibility, 
  PictureAsPdf, 
  CloudDone,
  Download,
  Email,
  Close,
  Send,
  AttachFile,
} from '@mui/icons-material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { useTranslation } from '../contexts/TranslationContext';

interface Ticket {
  Numero: string;
  Date: string;
  Total_TTC: string;
  Total_HT: string;
  Total_TVA: string;
  Etat: string;
  Code_Magasin: string; // CORRIGÉ : Code_Magasin avec M majuscule
  Caisse: string;
  Client_No: string;
  Client_Nom: string;
  has_pdf?: boolean;
  nomMagasin?: string; // Pour stocker le nom du magasin
}

interface Facture {
  Numero: string;
  Date: string;
  Total_TTC: string;
  Total_HT: string;
  Total_TVA: string;
  Etat: string;
  Code_magasin: string;
  Caisse: string;
  Client_No: string;
  Client_Nom: string;
  has_pdf?: boolean;
  nomMagasin?: string; // Pour stocker le nom du magasin
}

const Tickets: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [magasins, setMagasins] = useState<any[]>([]);
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // États pour la modal d'export
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExportPeriod, setSelectedExportPeriod] = useState('aujourd\'hui');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  // États pour la modal d'email
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: '',
    cc: '',
    bcc: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  // Charger les tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Récupérer d'abord les magasins
      let magasinsRes;
      try {
        magasinsRes = await axios.get('http://localhost:3000/api/magasins');
      } catch (port3000Error) {
        magasinsRes = await axios.get('http://localhost:3001/api/magasins');
      }
      const magasinsData = magasinsRes.data.data || [];
      setMagasins(magasinsData);
      
      // Ensuite récupérer les tickets
      const response = await axios.get('http://localhost:3000/api/tickets');
      const ticketsData = response.data.data || [];
      
      // Associer les noms de magasins aux tickets
      console.log('🏪 Début mapping des magasins pour', ticketsData.length, 'tickets');
      
      const ticketsAvecNoms = ticketsData.map((ticket: Ticket) => {
        // UTILISER Code_Magasin PRIORITAIREMENT (le vrai champ de la base)
        const codeMagasin = ticket.Code_Magasin || ticket.Caisse || '1';
        
        // RECHERCHE AVEC LE BON CHAMP
        const magasin = magasinsData.find((m: any) => 
          m.code_magasin === codeMagasin || m.codeMagasin === codeMagasin
        );
        
        return {
          ...ticket,
          nomMagasin: magasin?.nom_magasin || `Magasin ${codeMagasin}`
        };
      });
      
      console.log('✅ Mapping terminé, premier ticket:', ticketsAvecNoms[0]?.nomMagasin);
      
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

  // Filtrage et pagination
  const filteredTickets = tickets.filter(ticket =>
    ticket.Numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.Client_Nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.Date?.includes(searchTerm)
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount: string | null) => {
    return amount ? `${parseFloat(amount).toFixed(2)} €` : '0.00 €';
  };

  // Fonction pour ouvrir la modal d'email
  const handleOpenEmailModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEmailData({
      to: '',
      subject: `Facture MEGA-CENTRAL N°${ticket.Numero}`,
      message: `Bonjour ${ticket.Client_Nom || 'Client'},\n\nVeuillez trouver ci-joint votre facture N°${ticket.Numero} d'un montant de ${formatCurrency(ticket.Total_TTC)}.\n\nCette facture a été générée le ${new Date().toLocaleDateString('fr-FR')}.\n\nPour toute question, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe MEGA-CENTRAL`,
      cc: '',
      bcc: ''
    });
    setEmailModalOpen(true);
  };

  // Fonction pour fermer la modal d'email
  const handleCloseEmailModal = () => {
    setEmailModalOpen(false);
    setSelectedTicket(null);
    setEmailData({
      to: '',
      subject: '',
      message: '',
      cc: '',
      bcc: ''
    });
  };

  // Fonction pour envoyer l'email avec la facture
  const handleSendEmail = async () => {
    if (!selectedTicket || !emailData.to) {
      setSnackbar({
        open: true,
        message: 'Veuillez renseigner l\'adresse email du destinataire',
        severity: 'error'
      });
      return;
    }

    try {
      setSendingEmail(true);

      // Générer le PDF
      const doc = new jsPDF();
      
      // En-tête
      doc.setFontSize(20);
      doc.text('FACTURE - MEGA-CENTRAL', 105, 20, { align: 'center' });
      
      // Informations principales
      doc.setFontSize(12);
      doc.text(`Facture N°: ${selectedTicket.Numero}`, 20, 40);
      doc.text(`Date: ${selectedTicket.Date}`, 20, 50);
      doc.text(`Client: ${selectedTicket.Client_Nom || 'Non spécifié'}`, 20, 60);
      
      // Ligne de séparation
      doc.line(20, 70, 190, 70);
      
      // Détails des montants
      doc.setFontSize(14);
      doc.text('DETAILS DES MONTANTS', 105, 85, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Total HT: ${formatCurrency(selectedTicket.Total_HT)}`, 20, 100);
      doc.text(`Total TVA: ${formatCurrency(selectedTicket.Total_TVA)}`, 20, 110);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total TTC: ${formatCurrency(selectedTicket.Total_TTC)}`, 20, 125);
      
      // Pied de page
      doc.line(20, 170, 190, 170);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('MEGA-Central - Système de Centralisation des Ventes', 105, 180, { align: 'center' });
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 190, { align: 'center' });
      
      // Convertir en base64
      const pdfBase64 = doc.output('datauristring').replace('data:application/pdf;base64,', '');

      // Envoyer l'email avec le PDF en pièce jointe
      const emailPayload = {
        to: emailData.to,
        subject: emailData.subject,
        message: emailData.message,
        cc: emailData.cc,
        bcc: emailData.bcc,
        attachment: {
          filename: `facture-${selectedTicket.Numero}.pdf`,
          content: pdfBase64,
          type: 'application/pdf'
        }
      };

      await axios.post('http://localhost:3000/api/send-email', emailPayload);

      setSnackbar({
        open: true,
        message: `Facture N°${selectedTicket.Numero} envoyée avec succès à ${emailData.to}`,
        severity: 'success'
      });

      handleCloseEmailModal();

    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.',
        severity: 'error'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Export Excel par période
  const handleExportByPeriod = () => {
    try {
      // Filtrer les tickets selon la période sélectionnée
      let filteredTicketsForExport = tickets;
      
      if (selectedExportPeriod !== 'personnaliser') {
        const dateRange = getDateRange(selectedExportPeriod);
        const startDate = dateRange.start;
        const endDate = dateRange.end;
        
        filteredTicketsForExport = tickets.filter(ticket => {
          const ticketDate = ticket.Date ? ticket.Date.replace(/-/g, '') : '';
          return ticketDate >= startDate.replace(/-/g, '') && ticketDate <= endDate.replace(/-/g, '');
        });
      } else if (exportStartDate && exportEndDate) {
        filteredTicketsForExport = tickets.filter(ticket => {
          const ticketDate = ticket.Date ? ticket.Date.replace(/-/g, '') : '';
          const start = exportStartDate.replace(/-/g, '');
          const end = exportEndDate.replace(/-/g, '');
          return ticketDate >= start && ticketDate <= end;
        });
      }

      const excelData = filteredTicketsForExport.map(ticket => ({
        'Numéro Ticket': ticket.Numero,
        'Date': ticket.Date,
        'Magasin': ticket.nomMagasin || 'Non spécifié',
        'Client': ticket.Client_Nom || 'Non spécifié',
        'Total HT': parseFloat(ticket.Total_HT || '0').toFixed(2),
        'Total TVA': parseFloat(ticket.Total_TVA || '0').toFixed(2),
        'Total TTC': parseFloat(ticket.Total_TTC || '0').toFixed(2),
        'État': ticket.Etat || 'Normal'
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tickets");

      const fileName = `Tickets_MEGACentral_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setSnackbar({
        open: true,
        message: `Export réussi : ${filteredTicketsForExport.length} tickets exportés`,
        severity: 'success'
      });
      
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export Excel',
        severity: 'error'
      });
    }
  };

  // Fonction pour obtenir la plage de dates (copiée depuis Dashboard)
  const getDateRange = (period: string) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    switch (period) {
      case 'aujourd\'hui':
        return {
          start: startOfDay.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'semaine':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          start: startOfWeek.toISOString().split('T')[0],
          end: endOfWeek.toISOString().split('T')[0]
        };
      case 'mois':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          start: startOfMonth.toISOString().split('T')[0],
          end: endOfMonth.toISOString().split('T')[0]
        };
      case 'trimestre':
        const quarter = Math.floor(today.getMonth() / 3);
        const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        return {
          start: startOfQuarter.toISOString().split('T')[0],
          end: endOfQuarter.toISOString().split('T')[0]
        };
      case 'annee':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        return {
          start: startOfYear.toISOString().split('T')[0],
          end: endOfYear.toISOString().split('T')[0]
        };
      default:
        return {
          start: startOfDay.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
    }
  };

  // Export Excel (ancienne fonction, gardée pour compatibilité)
  const handleExportExcel = () => {
    try {
      const excelData = filteredTickets.map(ticket => ({
        'Numéro Ticket': ticket.Numero,
        'Date': ticket.Date,
        'Magasin': ticket.nomMagasin || 'Non spécifié',
        'Client': ticket.Client_Nom || 'Non spécifié',
        'Total HT': parseFloat(ticket.Total_HT || '0').toFixed(2),
        'Total TVA': parseFloat(ticket.Total_TVA || '0').toFixed(2),
        'Total TTC': parseFloat(ticket.Total_TTC || '0').toFixed(2),
        'État': ticket.Etat || 'Normal'
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tickets");

      const fileName = `Tickets_MEGACentral_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setSnackbar({
        open: true,
        message: 'Export Excel réussi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export Excel',
        severity: 'error'
      });
    }
  };

  // Export PDF - Récupération depuis la base de données
  const handleExportPDF = async (ticket: Ticket) => {
    try {
      setLoading(true);
      console.log('=== TÉLÉCHARGEMENT TICKET PDF DEPUIS BASE64 ===');
      console.log('Ticket:', ticket);

      // Récupérer le PDF base64 déjà stocké dans la base de données
      const response = await axios.get(`http://localhost:3000/api/tickets/pdf/${ticket.Numero}`);
      
      if (!response.data.has_pdf || !response.data.pdf_base64) {
        throw new Error('Aucun PDF disponible pour ce ticket dans la base de données');
      }

      let pdfBase64 = response.data.pdf_base64;
      console.log('PDF base64 récupéré:', pdfBase64.substring(0, 150) + '...');

      // Nettoyer et convertir le base64
      // Gérer les différents formats possibles
      
      // CAS 1: Format double encodé (problème actuel)
      if (pdfBase64.includes('data:application/pdf;base64,data:application/pdf')) {
        pdfBase64 = pdfBase64.replace(/data:application\/pdf;base64,/, '').replace(/data:application\/pdf[^,]*,/, '');
      }
      // CAS 2: Format avec filename
      else if (pdfBase64.includes('data:application/pdf;filename=')) {
        pdfBase64 = pdfBase64.replace(/data:application\/pdf[^,]*,/, '');
      }
      // CAS 3: Format normal avec un seul préfixe
      else if (pdfBase64.includes('data:application/pdf;base64,')) {
        pdfBase64 = pdfBase64.replace('data:application/pdf;base64,', '');
      } 
      // CAS 4: Format générique base64,
      else if (pdfBase64.includes('base64,')) {
        pdfBase64 = pdfBase64.split('base64,')[1];
      }

      // Nettoyer les caractères invalides
      pdfBase64 = pdfBase64.replace(/\s/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
      
      console.log('Base64 nettoyé:', pdfBase64.substring(0, 100) + '...');
      console.log('Longueur base64:', pdfBase64.length);

      // Vérifier si le base64 est valide
      if (!pdfBase64 || pdfBase64.length === 0) {
        throw new Error('Base64 vide ou invalide');
      }

      // Vérifier que le base64 commence par JVBER (signature PDF)
      if (!pdfBase64.startsWith('JVBER')) {
        console.error('Base64 ne commence pas par JVBER, débute par:', pdfBase64.substring(0, 50));
        throw new Error('Le base64 ne contient pas de données PDF valides');
      }

      // Vérifier la longueur (doit être multiple de 4)
      const paddingLength = (4 - (pdfBase64.length % 4)) % 4;
      pdfBase64 += '='.repeat(paddingLength);

      // Convertir le base64 en blob pour le téléchargement
      try {
        const binaryString = window.atob(pdfBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        
        // Créer une URL pour le téléchargement
        const url = window.URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement
        const link = document.createElement('a');
        link.href = url;
        // Utiliser le filename du backend comme les factures
        link.download = response.data.filename || `${ticket.Numero}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Nettoyer l'URL
        window.URL.revokeObjectURL(url);

        console.log('PDF téléchargé avec succès depuis la base de données !');
        
        setSnackbar({
          open: true,
          message: `Ticket ${ticket.Numero} téléchargé avec succès`,
          severity: 'success'
        });
      } catch (atobError) {
        console.error('Erreur lors de la conversion base64:', atobError);
        console.error('Base64 qui cause l\'erreur:', pdfBase64.substring(0, 200));
        throw new Error('Format base64 invalide dans la base de données');
      }
      
    } catch (err) {
      console.error('ERREUR TÉLÉCHARGEMENT PDF:', err);
      setSnackbar({
        open: true,
        message: `Erreur lors du téléchargement du PDF: ${(err as Error).message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Voir détails du ticket
  const handleViewTicket = async (ticketNumber: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/tickets/${ticketNumber}`);
      const ticketDetails = response.data.data;
      
      setSnackbar({
        open: true,
        message: `📋 ${t.tickets.ticketDetails} ${ticketNumber}\n${t.tickets.client}: ${ticketDetails.Client_Nom || t.tickets.nonSpecifie}\n${t.tickets.totalTTC}: ${formatCurrency(ticketDetails.Total_TTC)}`,
        severity: 'info'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: t.tickets.erreurDetails,
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">
              {t.tickets.title}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => setExportDialogOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Exporter
            </Button>
          </Box>
          
          <Box display="flex" gap={2} mb={3}>
            <TextField
              fullWidth
              placeholder={t.tickets.recherchePlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{t.tickets.numero}</strong></TableCell>
                  <TableCell><strong>{t.tickets.date}</strong></TableCell>
                  <TableCell><strong>{t.tickets.totalHT}</strong></TableCell>
                  <TableCell><strong>{t.tickets.totalTVA}</strong></TableCell>
                  <TableCell><strong>{t.tickets.totalTTC}</strong></TableCell>
                  <TableCell><strong>{t.tickets.client}</strong></TableCell>
                  <TableCell><strong>Magasin</strong></TableCell>
                  <TableCell><strong>{t.tickets.actions}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ticket) => (
                    <TableRow key={ticket.Numero}>
                      <TableCell>{ticket.Numero}</TableCell>
                      <TableCell>{ticket.Date}</TableCell>
                      <TableCell>{formatCurrency(ticket.Total_HT)}</TableCell>
                      <TableCell>{formatCurrency(ticket.Total_TVA)}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {formatCurrency(ticket.Total_TTC)}
                      </TableCell>
                      <TableCell>{ticket.Client_Nom || t.tickets.nonSpecifie}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {ticket.nomMagasin}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} alignItems="center">
                          <Button
                            variant="contained"
                            startIcon={<PictureAsPdf />}
                            onClick={() => handleExportPDF(ticket)}
                            sx={{ minWidth: 'auto', px: 1 }}
                            title="Télécharger le ticket"
                          >
                            PDF
                          </Button>
                          
                          {ticket.has_pdf && (
                            <CloudDone 
                              fontSize="small" 
                              color="success" 
                              titleAccess="Ticket disponible"
                            />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredTickets.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t.tickets.lignesParPage}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t.tickets.sur} ${count}`}
          />
        </CardContent>
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

      {/* Modal d'export par période */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          color: 'primary.main',
          textAlign: 'center',
          pb: 2
        }}>
          Exporter les Tickets
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Choisissez la période pour exporter les tickets
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
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
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Date de début"
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Date de fin"
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedExportPeriod !== 'personnaliser' 
                ? `Export des tickets du ${getDateRange(selectedExportPeriod).start} au ${getDateRange(selectedExportPeriod).end}`
                : exportStartDate && exportEndDate 
                  ? `Export des tickets du ${exportStartDate} au ${exportEndDate}`
                  : 'Veuillez sélectionner les dates'
              }
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button 
            onClick={() => setExportDialogOpen(false)}
            sx={{ mr: 2 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleExportByPeriod}
            variant="contained"
            sx={{ px: 4 }}
            disabled={selectedExportPeriod === 'personnaliser' && (!exportStartDate || !exportEndDate)}
          >
            Exporter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal d'envoi d'email */}
      <Dialog 
        open={emailModalOpen} 
        onClose={handleCloseEmailModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          borderBottom: '2px solid #e0e0e0',
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Email sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Envoyer la facture par email
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Facture N°{selectedTicket?.Numero} - {selectedTicket?.Client_Nom}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseEmailModal} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box 
            display="flex" 
            alignItems="center" 
            gap={2} 
            mb={3} 
            p={2}
            sx={{ 
              bgcolor: alpha('#1976d2', 0.1), 
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#1976d2', 0.3)
            }}>
            <AttachFile sx={{ color: '#1976d2' }} />
            <Typography variant="body2" color="text.secondary">
              <strong>Pièce jointe:</strong> ticket-{selectedTicket?.Numero}.pdf ({formatCurrency(selectedTicket?.Total_TTC || null)})
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email du destinataire *"
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Objet"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="h6" color="primary">📧</Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Copie (CC)"
                type="email"
                value={emailData.cc}
                onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
                variant="outlined"
                placeholder="email@example.com"
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Copie cachée (BCC)"
                type="email"
                value={emailData.bcc}
                onChange={(e) => setEmailData({ ...emailData, bcc: e.target.value })}
                variant="outlined"
                placeholder="email@example.com"
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={6}
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                variant="outlined"
                placeholder="Rédigez votre message ici..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={handleCloseEmailModal} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSendEmail}
            variant="contained"
            disabled={sendingEmail || !emailData.to}
            startIcon={sendingEmail ? <CircularProgress size={20} /> : <Send />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #2196f3)',
              }
            }}
          >
            {sendingEmail ? 'Envoi en cours...' : 'Envoyer la facture'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tickets;
