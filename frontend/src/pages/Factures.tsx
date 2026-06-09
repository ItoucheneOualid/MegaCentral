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
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Description, 
  PictureAsPdf, 
  Download, 
  CloudDone,
  Email,
  Close,
  Send,
  AttachFile,
  InsertDriveFile,
} from '@mui/icons-material';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Déclaration pour jsPDF global et autoTable
declare global {
  interface Window {
    jsPDF: any;
  }
}

// Extension de jsPDF pour autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: { finalY: number };
  }
}

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
  Email_Client?: string; // Ajout de l'email du client
  has_pdf?: boolean; // Indique si un PDF existe en base
  nomMagasin?: string; // Pour stocker le nom du magasin
}

const Factures: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [magasins, setMagasins] = useState<any[]>([]);

  // Forcer le rechargement complet de la page
  const [forceRefresh, setForceRefresh] = useState(0);

  // Fonction pour forcer le rafraîchissement
  const forcePageRefresh = () => {
    setForceRefresh(prev => prev + 1);
    window.location.reload();
  };

  // États pour la modal d'export
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExportPeriod, setSelectedExportPeriod] = useState('aujourd\'hui');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  // États pour la modal d'email
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedFactureForEmail, setSelectedFactureForEmail] = useState<Facture | null>(null);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: '',
    cc: '',
    bcc: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const fetchFactures = async () => {
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
      
      // Ensuite récupérer les factures
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/factures`);
      const facturesData = response.data.data || [];
      
      // Associer les noms de magasins aux factures
      const facturesAvecNoms = facturesData.map((facture: Facture) => {
        console.log('Facture:', facture.Numero);
        console.log('Tous les champs de la facture:', Object.keys(facture));
        console.log('Code_magasin:', facture.Code_magasin);
        console.log('TOUS LES MAGASINS DISPONIBLES:', magasinsData);
        
        // Extraire le code magasin depuis le numéro de facture (format: X-YYYYYY-SEQ)
        let codeMagasin = facture.Code_magasin || facture.Caisse || facture.magasin || facture.Magasin;
        
        if (!codeMagasin && facture.Numero) {
          // Le numéro de facture est probablement au format: X-YYYYYY-SEQ
          const numeroParts = facture.Numero.split('-');
          if (numeroParts.length >= 1) {
            codeMagasin = numeroParts[0]; // Prendre la première partie
            console.log('Code magasin extrait du numéro:', codeMagasin);
          }
        }
        
        // Fallback par défaut
        if (!codeMagasin) {
          codeMagasin = '1';
        }
        
        console.log('Code magasin final utilisé:', codeMagasin);
        
        const magasin = magasinsData.find((m: any) => 
          (m.code_magasin === codeMagasin) || 
          (m.codeMagasin === codeMagasin)
        );
        
        console.log('Magasin trouvé pour', codeMagasin, ':', magasin);
        console.log('Nom du magasin:', magasin?.nom_magasin || magasin?.nomMagasin);
        
        return {
          ...facture,
          nomMagasin: magasin?.nom_magasin || magasin?.nomMagasin || `Magasin ${codeMagasin}`
        };
      });
      
      setFactures(facturesAvecNoms);
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredFactures = factures.filter(facture =>
    facture.Numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facture.Client_Nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facture.Date?.includes(searchTerm)
  );

  const handleSelectFacture = (facture: Facture) => {
    setSelectedFacture(facture);
  };

  const getEtatColor = (etat: string) => {
    switch (etat?.toLowerCase()) {
      case 'payée':
        return 'success';
      case 'en attente':
        return 'warning';
      case 'annulée':
        return 'error';
      default:
        return 'info';
    }
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

  // Export Excel par période
  const handleExportByPeriod = () => {
    try {
      // Filtrer les factures selon la période sélectionnée
      let filteredFacturesForExport = factures;
      
      if (selectedExportPeriod !== 'personnaliser') {
        const dateRange = getDateRange(selectedExportPeriod);
        const startDate = dateRange.start;
        const endDate = dateRange.end;
        
        filteredFacturesForExport = factures.filter(facture => {
          const factureDate = facture.Date ? facture.Date.replace(/-/g, '') : '';
          return factureDate >= startDate.replace(/-/g, '') && factureDate <= endDate.replace(/-/g, '');
        });
      } else if (exportStartDate && exportEndDate) {
        filteredFacturesForExport = factures.filter(facture => {
          const factureDate = facture.Date ? facture.Date.replace(/-/g, '') : '';
          const start = exportStartDate.replace(/-/g, '');
          const end = exportEndDate.replace(/-/g, '');
          return factureDate >= start && factureDate <= end;
        });
      }

      const excelData = filteredFacturesForExport.map(facture => ({
        'Numéro Facture': facture.Numero,
        'Date': facture.Date,
        'Type': facture.Type || 'Standard',
        'Client': facture.Client_Nom || facture.Client_No || 'Non spécifié',
        'Total HT': parseFloat(facture.Total_B_HT || '0').toFixed(2),
        'Total TVA': parseFloat(facture.Total_Tva || '0').toFixed(2),
        'Total TTC': parseFloat(facture.Total_TTC || '0').toFixed(2),
        'État': getEtatLabel(facture.Etat),
        'Magasin': facture.Code_magasin || 'Non spécifié'
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Factures");

      const fileName = `Factures_MEGACentral_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setSnackbar({
        open: true,
        message: `Export réussi : ${filteredFacturesForExport.length} factures exportées`,
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

  // Fonction d'export PDF individuel
  const handleExportSinglePDF = async (facture: Facture) => {
    try {
      console.log('Export PDF individuel de la facture:', facture.Numero);
      
      // Créer le PDF avec jsPDF standard
      const doc = new jsPDF();
      
      // En-tête
      doc.setFontSize(16);
      doc.text('FACTURE - MEGA-Central', 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 25, { align: 'center' });
      
      // Informations de la facture
      doc.setFontSize(12);
      doc.text(`Facture N°: ${facture.Numero || ''}`, 20, 45);
      doc.text(`Date: ${facture.Date || ''}`, 20, 55);
      doc.text(`Type: ${facture.Type || 'Standard'}`, 20, 65);
      doc.text(`Client: ${facture.Client_Nom || facture.Client_No || '-'}`, 20, 75);
      doc.text(`Magasin: ${facture.Code_magasin || '-'}`, 20, 85);
      
      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 95, 190, 95);
      
      // Détails des montants
      doc.setFontSize(14);
      doc.text('DETAILS DES MONTANTS', 105, 110, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Total HT: ${formatCurrency(facture.Total_B_HT)}`, 20, 125);
      doc.text(`Total TVA: ${formatCurrency(facture.Total_Tva)}`, 20, 135);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total TTC: ${formatCurrency(facture.Total_TTC)}`, 20, 150);
      
      // Pied de page
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 190, 190, 190);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('MEGA-Central - Système de Centralisation des Ventes', 105, 200, { align: 'center' });
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 210, { align: 'center' });
      
      // Télécharger
      const fileName = `facture-${facture.Numero}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
      
      console.log('PDF individuel généré avec succès !');
      
    } catch (err) {
      console.error('ERREUR EXPORT INDIVIDUEL:', err);
      setError('Erreur lors de la génération du PDF individuel');
    }
  };

  // Fonction pour télécharger une facture PDF depuis la base de données (base64)
  const handleDownloadFacturePDF = async (facture: Facture) => {
    try {
      setLoading(true);
      console.log('=== TÉLÉCHARGEMENT FACTURE PDF DEPUIS BASE64 ===');
      console.log('Facture:', facture);

      // Récupérer le PDF base64 déjà stocké dans la base de données
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/factures/${facture.VTCLEUNIK}/pdf`);
      
      if (!response.data.has_pdf || !response.data.pdf_base64) {
        throw new Error('Aucun PDF disponible pour cette facture dans la base de données');
      }

      let pdfBase64 = response.data.pdf_base64;
      console.log('PDF base64 récupéré:', pdfBase64.substring(0, 150) + '...');

      // Nettoyer et convertir le base64
      // Gérer les différents formats possibles
      
      // CAS 1: Format avec filename (problème actuel)
      if (pdfBase64.includes('data:application/pdf;filename=')) {
        pdfBase64 = pdfBase64.replace(/data:application\/pdf[^,]*,/, '');
      }
      // CAS 2: Format normal avec un seul préfixe
      else if (pdfBase64.includes('data:application/pdf;base64,')) {
        pdfBase64 = pdfBase64.replace('data:application/pdf;base64,', '');
      } 
      // CAS 3: Format générique base64,
      else if (pdfBase64.includes('base64,')) {
        pdfBase64 = pdfBase64.split('base64,')[1];
      }

      // Nettoyer les caractères invalides (espaces, retours à la ligne, etc.)
      pdfBase64 = pdfBase64.replace(/\s/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
      
      console.log('Base64 nettoyé:', pdfBase64.substring(0, 100) + '...');
      console.log('Longueur base64:', pdfBase64.length);

      // Vérifier si le base64 est valide
      if (!pdfBase64 || pdfBase64.length === 0) {
        throw new Error('Base64 vide ou invalide');
      }

      // Vérifier que le base64 commence par JVBER (signature PDF)
      if (!pdfBase64.startsWith('JVBER')) {
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
        link.download = response.data.filename || `facture-${facture.Numero}-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Nettoyer l'URL
        window.URL.revokeObjectURL(url);

        console.log('PDF téléchargé avec succès depuis la base de données !');
      } catch (atobError) {
        console.error('Erreur lors de la conversion base64:', atobError);
        console.error('Base64 qui cause l\'erreur:', pdfBase64.substring(0, 200));
        throw new Error('Format base64 invalide dans la base de données');
      }
      
    } catch (err) {
      console.error('ERREUR TÉLÉCHARGEMENT PDF:', err);
      setError('Erreur lors du téléchargement du PDF: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'export PDF global (désactivée - on utilise handleDownloadFacturePDF)
  const handleExportPDF = () => {
    console.log('Export PDF global désactivé - utilisez handleDownloadFacturePDF');
  };

  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount || amount === '') return '0.00 €';
    const numAmount = parseFloat(amount);
    return isNaN(numAmount) ? '0.00 €' : `${numAmount.toFixed(2)} €`;
  };

  // Fonction pour ouvrir la modal d'email
  const handleOpenEmailModal = (facture: Facture) => {
    setSelectedFactureForEmail(facture);
    
    // Récupérer l'email du client depuis la facture si disponible
    const clientEmail = facture.Email_Client || '';
    
    setEmailData({
      to: clientEmail,  // Email pré-rempli depuis la base de données
      subject: `Facture MEGA-CENTRAL N°${facture.Numero}`,
      message: `Bonjour ${facture.Client_Nom || facture.Client_No || 'Client'},\n\nVeuillez trouver ci-joint votre facture N°${facture.Numero} d'un montant de ${formatCurrency(facture.Total_TTC)}.\n\nCette facture a été générée le ${new Date().toLocaleDateString('fr-FR')}.\n\nPour toute question, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe MEGA-CENTRAL`,
      cc: '',
      bcc: ''
    });
    setEmailModalOpen(true);
  };

  // Fonction pour fermer la modal d'email
  const handleCloseEmailModal = () => {
    setEmailModalOpen(false);
    setSelectedFactureForEmail(null);
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
    if (!selectedFactureForEmail || !emailData.to) {
      setSnackbar({
        open: true,
        message: 'Veuillez renseigner l\'adresse email du destinataire',
        severity: 'error'
      });
      return;
    }

    try {
      setSendingEmail(true);

      // Générer le PDF de la facture
      const doc = new jsPDF();
      
      // En-tête
      doc.setFontSize(20);
      doc.text('FACTURE - MEGA-CENTRAL', 105, 20, { align: 'center' });
      
      // Informations principales
      doc.setFontSize(12);
      doc.text(`Facture N°: ${selectedFactureForEmail.Numero}`, 20, 40);
      doc.text(`Date: ${selectedFactureForEmail.Date}`, 20, 50);
      doc.text(`Type: ${selectedFactureForEmail.Type || 'Standard'}`, 20, 60);
      doc.text(`Client: ${selectedFactureForEmail.Client_Nom || selectedFactureForEmail.Client_No || 'Non spécifié'}`, 20, 70);
      doc.text(`Magasin: ${selectedFactureForEmail.Code_magasin || '-'}`, 20, 80);
      
      // Ligne de séparation
      doc.line(20, 90, 190, 90);
      
      // Détails des montants
      doc.setFontSize(14);
      doc.text('DETAILS DES MONTANTS', 105, 105, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Total HT: ${formatCurrency(selectedFactureForEmail.Total_B_HT)}`, 20, 120);
      doc.text(`Total TVA: ${formatCurrency(selectedFactureForEmail.Total_Tva)}`, 20, 130);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total TTC: ${formatCurrency(selectedFactureForEmail.Total_TTC)}`, 20, 145);
      
      // Pied de page
      doc.line(20, 190, 190, 190);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('MEGA-Central - Système de Centralisation des Ventes', 105, 200, { align: 'center' });
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 210, { align: 'center' });
      
      // Utiliser le même PDF que le téléchargement (depuis la base de données)
      console.log('=== ENVOI EMAIL - UTILISATION PDF DEPUIS BASE ===');
      
      // Récupérer le PDF base64 déjà stocké dans la base de données
      const pdfResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/factures/${selectedFactureForEmail.VTCLEUNIK}/pdf`);
      
      if (!pdfResponse.data.has_pdf || !pdfResponse.data.pdf_base64) {
        throw new Error('Aucun PDF disponible pour cette facture dans la base de données');
      }

      let pdfBase64 = pdfResponse.data.pdf_base64;
      console.log('PDF base64 récupéré depuis base:', pdfBase64.substring(0, 150) + '...');
      console.log('Taille PDF base:', pdfBase64.length, 'caractères');

      // Nettoyer le base64 comme pour le téléchargement
      if (pdfBase64.includes('data:application/pdf;filename=')) {
        pdfBase64 = pdfBase64.replace(/data:application\/pdf[^,]*,/, '');
      }
      else if (pdfBase64.includes('data:application/pdf;base64,')) {
        pdfBase64 = pdfBase64.replace('data:application/pdf;base64,', '');
      } 
      else if (pdfBase64.includes('base64,')) {
        pdfBase64 = pdfBase64.split('base64,')[1];
      }

      console.log('PDF base64 nettoyé:', pdfBase64.substring(0, 150) + '...');
      console.log('Taille PDF nettoyé:', pdfBase64.length, 'caractères');

      // Envoyer l'email avec le même PDF que le téléchargement
      const emailPayload = {
        to: emailData.to,
        subject: emailData.subject,
        message: emailData.message,
        cc: emailData.cc,
        bcc: emailData.bcc,
        attachment: pdfBase64  // Même PDF que le téléchargement
      };
      
      console.log('📦 Payload email:', {
        attachmentSize: emailPayload.attachment.length,
        totalSize: JSON.stringify(emailPayload).length
      });

      await axios.post(`${process.env.REACT_APP_API_URL}/api/send-email`, emailPayload);

      setSnackbar({
        open: true,
        message: `Facture N°${selectedFactureForEmail.Numero} envoyée avec succès à ${emailData.to}`,
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
        <Alert 
          severity="error" 
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
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        GESTION DES FACTURES
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="RECHERCHER UNE FACTURE"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 300, flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ borderRadius: 2 }}
            >
              FILTRES
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => {
                setForceRefresh(prev => prev + 1);
                setTimeout(() => setExportDialogOpen(true), 100);
              }}
              sx={{ 
                borderRadius: 2, 
                ml: 1,
                backgroundColor: 'primary.main', // Bleu principal comme les autres boutons
                '&:hover': { backgroundColor: 'primary.dark' },
                fontWeight: 'bold',
                border: '2px solid primary.main', // Bordure bleue pour cohérence
                boxShadow: '0 0 10px rgba(25, 118, 210, 0.3)' // Ombre bleue
              }}
            >
              EXPORTER
            </Button>
          </Box>
          {selectedFacture && (
            <Box mt={2} p={2} sx={{ backgroundColor: 'info.light', borderRadius: 2 }}>
              <Typography variant="body2" color="info.dark">
                📄 FACTURE SÉLECTIONNÉE : {selectedFacture.Numero} - {selectedFacture.Client_Nom}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>TYPE</strong></TableCell>
                  <TableCell><strong>NUMÉRO</strong></TableCell>
                  <TableCell><strong>DATE</strong></TableCell>
                  <TableCell><strong>TOTAL TTC</strong></TableCell>
                  <TableCell><strong>TOTAL HT</strong></TableCell>
                  <TableCell><strong>CLIENT NOM</strong></TableCell>
                  <TableCell><strong>MAGASIN</strong></TableCell>
                  <TableCell><strong>ACTIONS</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFactures
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((facture) => (
                    <TableRow 
                      key={facture.VTCLEUNIK} 
                      hover
                      selected={selectedFacture?.VTCLEUNIK === facture.VTCLEUNIK}
                      onClick={() => handleSelectFacture(facture)}
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedFacture?.VTCLEUNIK === facture.VTCLEUNIK ? 'action.selected' : 'inherit',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        }
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={facture.Type || 'Standard'}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Description fontSize="small" />
                          {facture.Numero}
                        </Box>
                      </TableCell>
                      <TableCell>{facture.Date}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {formatCurrency(facture.Total_TTC)}
                      </TableCell>
                      <TableCell>{formatCurrency(facture.Total_B_HT)}</TableCell>
                      <TableCell>{facture.Client_Nom || facture.Client_No || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {facture.nomMagasin}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<InsertDriveFile />}
                            onClick={() => handleDownloadFacturePDF(facture)}
                            sx={{ 
                              borderRadius: 1,
                              backgroundColor: 'primary.main',
                              '&:hover': { backgroundColor: 'primary.dark' },
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}
                          >
                            PDF
                          </Button>
                          
                          <Tooltip title="Envoyer par email">
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              startIcon={<Email />}
                              onClick={() => handleOpenEmailModal(facture)}
                              sx={{ 
                                borderRadius: 1,
                                borderColor: 'primary.main',
                                '&:hover': {
                                  borderColor: 'primary.dark',
                                  bgcolor: 'primary.50'
                                }
                              }}
                            >
                              Email
                            </Button>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={filteredFactures.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </CardContent>
      </Card>

      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {filteredFactures.length} facture(s) trouvée(s)
        </Typography>
        <Button variant="contained" color="primary" onClick={fetchFactures}>
          Actualiser
        </Button>
      </Box>

      {/* Snackbar pour les notifications */}
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
          EXPORTER LES FACTURES
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            CHOISISSEZ LA PÉRIODE POUR EXPORTER LES FACTURES
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>PÉRIODE</InputLabel>
            <Select
              value={selectedExportPeriod}
              onChange={(e) => setSelectedExportPeriod(e.target.value)}
              label="PÉRIODE"
            >
              <MenuItem value="aujourd'hui">AUJOURD'HUI</MenuItem>
              <MenuItem value="semaine">CETTE SEMAINE</MenuItem>
              <MenuItem value="mois">CE MOIS</MenuItem>
              <MenuItem value="trimestre">CE TRIMESTRE</MenuItem>
              <MenuItem value="annee">CETTE ANNÉE</MenuItem>
              <MenuItem value="personnaliser">PERSONNALISER</MenuItem>
            </Select>
          </FormControl>

          {selectedExportPeriod === 'personnaliser' && (
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="DATE DE DÉBUT"
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="DATE DE FIN"
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
                ? `EXPORT DES FACTURES DU ${getDateRange(selectedExportPeriod).start} AU ${getDateRange(selectedExportPeriod).end}`
                : exportStartDate && exportEndDate 
                  ? `EXPORT DES FACTURES DU ${exportStartDate} AU ${exportEndDate}`
                  : 'VEUILLEZ SÉLECTIONNER LES DATES'
              }
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button 
            onClick={() => setExportDialogOpen(false)}
            sx={{ mr: 2 }}
          >
            ANNULER
          </Button>
          <Button 
            onClick={handleExportByPeriod}
            variant="contained"
            sx={{ px: 4 }}
            disabled={selectedExportPeriod === 'personnaliser' && (!exportStartDate || !exportEndDate)}
          >
            EXPORTER
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
                Facture N°{selectedFactureForEmail?.Numero} - {selectedFactureForEmail?.Client_Nom || selectedFactureForEmail?.Client_No}
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
              <strong>Pièce jointe:</strong> facture-{selectedFactureForEmail?.Numero}.pdf ({formatCurrency(selectedFactureForEmail?.Total_TTC)})
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
                helperText={selectedFactureForEmail?.Email_Client ? "Email récupéré automatiquement depuis la base de données" : "Veuillez saisir l'email du client"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: selectedFactureForEmail?.Email_Client && (
                    <InputAdornment position="end">
                      <Chip 
                        label="Auto" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                        sx={{ fontSize: '10px', height: '20px' }}
                      />
                    </InputAdornment>
                  )
                }}
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

export default Factures;
