import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  alpha,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
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
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add,
  Cancel,
  CheckCircle,
  Delete,
  Edit,
  Euro,
  GetApp,
  LocalShipping,
  Search,
  ShoppingCart,
  Store,
  Visibility,
} from '@mui/icons-material';
import api from '../services/api';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PermissionAlert, usePermissionAlert } from '../components/PermissionAlert';
import { apiConfig } from '../config/apiConfig';

const API_URL = apiConfig.endpoints.commandes;
const MAGASINS_URL = apiConfig.endpoints.magasins;

interface Fournisseur {
  id: number;
  code: string;
  nom: string;
}

interface Magasin {
  id: number;
  nom_magasin?: string;
  Nom_Magasin?: string;
  nom?: string;
}

interface ArticleOption {
  id: number;
  libelle: string;
  codeBarres: string | null;
  prixAchatHT: number;
  prixAchatTTC: number;
  prixVenteHT: number;
  tvaId: number | null;
  fournisseurId: number | null;
}

interface LigneCommande {
  id: string | number;
  idArticle?: number;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  tauxTVA?: number;
  totalHT: number;
  totalTTC: number;
  magasinId?: number | null;
  magasinNom?: string | null;
}

interface Commande {
  id: string | number;
  numero: string;
  idFournisseur?: number;
  fournisseurCode?: string;
  nomFournisseur: string;
  dateCommande: string;
  dateLivraisonPrevue: string;
  statut: string;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  notes: string;
  lignes: LigneCommande[];
}

interface StockNavigationState {
  fromStock?: boolean;
  articleId?: number;
  articleLibelle?: string;
  magasinId?: number;
  magasinNom?: string;
}

const getMagasinName = (magasin?: Magasin | null) => {
  if (!magasin) return '';
  return magasin.nom_magasin || magasin.Nom_Magasin || magasin.nom || `Magasin ${magasin.id}`;
};

const Commandes: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const location = useLocation();
  const stockState = location.state as StockNavigationState | null;

  const { user } = useAuth();
  const { alert, showPermissionAlert, closeAlert } = usePermissionAlert();
  const isAdmin = user?.role === 'admin';

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [openDetails, setOpenDetails] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [editingCommandeId, setEditingCommandeId] = useState<string | number | null>(null);
  const [handledStockState, setHandledStockState] = useState(false);

  const [form, setForm] = useState({
    idFournisseur: '',
    magasinId: '',
    dateCommande: new Date().toISOString().split('T')[0],
    dateLivraisonPrevue: '',
    notes: '',
    statut: 'N',
  });

  const [selectedArticle, setSelectedArticle] = useState<ArticleOption | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [lignes, setLignes] = useState<LigneCommande[]>([]);

  const livraisonAvantCommande =
    !!form.dateLivraisonPrevue &&
    !!form.dateCommande &&
    form.dateLivraisonPrevue < form.dateCommande;

  const formatDate = (date: string) => {
    if (!date) return '';
    return String(date).split('T')[0];
  };

  const formatEuro = (value: number) =>
    new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(value || 0));

  const fetchCommandes = async () => {
    try {
      setLoading(true);

      const response = await api.get(API_URL);

      const realData: Commande[] = (response.data.data || []).map((commande: any) => ({
        id: commande.id,
        numero: `BC-${commande.id}`,
        idFournisseur: commande.idFournisseur,
        fournisseurCode: commande.fournisseurCode,
        nomFournisseur: commande.nomFournisseur || 'Fournisseur inconnu',
        dateCommande: formatDate(commande.dateCommande),
        dateLivraisonPrevue: formatDate(commande.dateLivraisonPrevue),
        statut: commande.statut || 'N',
        montantHT: Number(commande.montantHT || 0),
        montantTVA: Number(commande.montantTVA || 0),
        montantTTC: Number(commande.montantTTC || 0),
        notes: commande.notes || '',
        lignes: (commande.lignes || []).map((ligne: any) => ({
          id: ligne.id,
          idArticle: ligne.idArticle,
          designation: ligne.designation || '',
          quantite: Number(ligne.quantite || 0),
          prixUnitaire: Number(ligne.prixUnitaire || 0),
          tauxTVA: Number(ligne.tauxTVA || 21),
          totalHT: Number(ligne.totalHT || 0),
          totalTTC: Number(ligne.totalTTC || 0),
          magasinId: ligne.magasinId || null,
          magasinNom: ligne.magasinNom || null,
        })),
      }));

      setCommandes(realData);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    const response = await api.get(`${API_URL}/fournisseurs`);
    setFournisseurs(response.data.data || []);
  };

  const fetchArticles = async () => {
    const response = await api.get(`${API_URL}/articles`);
    setArticles(response.data.data || []);
  };

  const fetchMagasins = async () => {
    const response = await api.get(MAGASINS_URL);
    setMagasins(response.data.data || response.data || []);
  };

  useEffect(() => {
    fetchCommandes();
    fetchFournisseurs();
    fetchArticles();
    fetchMagasins();
  }, []);

  const resetForm = () => {
    setForm({
      idFournisseur: '',
      magasinId: stockState?.magasinId ? String(stockState.magasinId) : '',
      dateCommande: new Date().toISOString().split('T')[0],
      dateLivraisonPrevue: '',
      notes: '',
      statut: 'N',
    });

    setSelectedArticle(null);
    setQuantite(1);
    setLignes([]);
    setEditingCommandeId(null);
  };

  useEffect(() => {
    if (!stockState?.fromStock || handledStockState || articles.length === 0) return;

    if (!isAdmin) {
      showPermissionAlert('Création de commande non autorisée. Cette action nécessite un compte administrateur.');
      setHandledStockState(true);
      return;
    }

    const article = articles.find((a) => String(a.id) === String(stockState.articleId));

    resetForm();

    setForm((prev) => ({
      ...prev,
      magasinId: stockState.magasinId ? String(stockState.magasinId) : '',
      notes: `Réapprovisionnement depuis stock : ${stockState.articleLibelle || article?.libelle || ''}${
        stockState.magasinNom ? ` - ${stockState.magasinNom}` : ''
      }`,
      statut: 'N',
    }));

    if (article) {
      setSelectedArticle(article);

      if (article.fournisseurId) {
        setForm((prev) => ({
          ...prev,
          idFournisseur: String(article.fournisseurId),
        }));
      }
    }

    setQuantite(1);
    setOpenForm(true);
    setHandledStockState(true);
  }, [stockState, handledStockState, articles, isAdmin]);

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'N':
        return 'En attente';
      case 'C':
        return 'Confirmée';
      case 'L':
        return 'En livraison';
      case 'R':
        return 'Réceptionnée';
      case 'A':
        return 'Annulée';
      default:
        return statut;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'N':
        return 'warning';
      case 'C':
        return 'info';
      case 'L':
        return 'secondary';
      case 'R':
        return 'success';
      case 'A':
        return 'error';
      default:
        return 'default';
    }
  };

  const totals = useMemo(() => {
    const montantHT = lignes.reduce((sum, ligne) => sum + ligne.totalHT, 0);
    const montantTTC = lignes.reduce((sum, ligne) => sum + ligne.totalTTC, 0);
    const montantTVA = montantTTC - montantHT;

    return { montantHT, montantTVA, montantTTC };
  }, [lignes]);

  const openCreateDialog = () => {
    if (!isAdmin) {
      showPermissionAlert('Création de commande non autorisée. Cette action nécessite un compte administrateur.');
      return;
    }

    resetForm();
    setOpenForm(true);
  };

  const openEditDialog = (commande: Commande) => {
    if (!isAdmin) {
      showPermissionAlert('Modification de commande non autorisée. Cette action nécessite un compte administrateur.');
      return;
    }

    if (commande.statut === 'R') {
      setError('Une commande réceptionnée ne peut plus être modifiée.');
      return;
    }

    setEditingCommandeId(commande.id);
    setForm({
      idFournisseur: String(commande.idFournisseur || ''),
      magasinId: '',
      dateCommande: commande.dateCommande,
      dateLivraisonPrevue: commande.dateLivraisonPrevue || '',
      notes: commande.notes || '',
      statut: commande.statut || 'N',
    });

    setLignes(commande.lignes || []);
    setSelectedArticle(null);
    setOpenForm(true);
  };

  const handleAddLigne = () => {
    if (!isAdmin) {
      showPermissionAlert('Ajout d’article à une commande non autorisé. Cette action nécessite un compte administrateur.');
      return;
    }

    if (!form.magasinId) {
      setError('Veuillez sélectionner le magasin concerné.');
      return;
    }

    const article = selectedArticle;

    if (!article) {
      setError('Veuillez sélectionner un article.');
      return;
    }

    if (!quantite || quantite <= 0) {
      setError('La quantité doit être supérieure à 0.');
      return;
    }

    const magasin = magasins.find((m) => String(m.id) === String(form.magasinId));

    const prixUnitaire = Number(article.prixAchatHT || 0);
    const tauxTVA = 21;
    const totalHT = quantite * prixUnitaire;
    const totalTTC = totalHT * (1 + tauxTVA / 100);

    const newLine: LigneCommande = {
      id: Date.now(),
      idArticle: article.id,
      designation: article.libelle,
      quantite,
      prixUnitaire,
      tauxTVA,
      totalHT,
      totalTTC,
      magasinId: Number(form.magasinId),
      magasinNom: getMagasinName(magasin),
    };

    setLignes((prev) => [...prev, newLine]);
    setSelectedArticle(null);
    setQuantite(1);
    setError('');
  };

  const handleRemoveLigne = (id: string | number) => {
    if (!isAdmin) {
      showPermissionAlert('Suppression d’une ligne de commande non autorisée. Cette action nécessite un compte administrateur.');
      return;
    }

    setLignes((prev) => prev.filter((ligne) => ligne.id !== id));
  };

  const buildPayload = () => {
    const fournisseur = fournisseurs.find((f) => String(f.id) === String(form.idFournisseur));

    if (!fournisseur) throw new Error('Veuillez sélectionner un fournisseur.');
    if (!form.magasinId) throw new Error('Veuillez sélectionner le magasin concerné.');
    if (lignes.length === 0) throw new Error('Veuillez ajouter au moins un article à la commande.');
    if (livraisonAvantCommande) {
      throw new Error('La date de livraison prévue ne peut pas être antérieure à la date de commande.');
    }

    return {
      idFournisseur: fournisseur.id,
      fournisseurCode: fournisseur.code,
      nomFournisseur: fournisseur.nom,
      dateCommande: form.dateCommande,
      dateLivraisonPrevue: form.dateLivraisonPrevue || null,
      statut: editingCommandeId ? form.statut : 'N',
      notes: form.notes,
      lignes: lignes.map((ligne) => ({
        idArticle: ligne.idArticle,
        designation: ligne.designation,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        tauxTVA: ligne.tauxTVA || 21,
        magasinId: ligne.magasinId || Number(form.magasinId),
      })),
    };
  };

  const handleSaveCommande = async () => {
    if (!isAdmin) {
      showPermissionAlert('Enregistrement de commande non autorisé. Cette action nécessite un compte administrateur.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = buildPayload();

      if (editingCommandeId) {
        await api.put(`${API_URL}/${editingCommandeId}`, payload);
      } else {
        await api.post(API_URL, payload);
      }

      setOpenForm(false);
      resetForm();
      await fetchCommandes();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Erreur lors de l’enregistrement de la commande');
    } finally {
      setSaving(false);
    }
  };

  const updateStatut = async (commande: Commande, statut: string) => {
    if (!isAdmin) {
      showPermissionAlert('Modification du statut non autorisée. Cette action nécessite un compte administrateur.');
      return;
    }

    try {
      await api.patch(`${API_URL}/${commande.id}/statut`, { statut });
      await fetchCommandes();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la modification du statut');
    }
  };

  const handleDeleteCommande = async (commande: Commande) => {
    if (!isAdmin) {
      showPermissionAlert('Suppression de commande non autorisée. Cette action nécessite un compte administrateur.');
      return;
    }

    if (!window.confirm(`Supprimer la commande ${commande.numero} ?`)) return;

    try {
      await api.delete(`${API_URL}/${commande.id}`);
      await fetchCommandes();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression de la commande');
    }
  };

  const handleVoirDetails = (commande: Commande) => {
    setSelectedCommande(commande);
    setOpenDetails(true);
  };

  const handleExportCSV = () => {
    window.open(`${API_URL}/export/csv`, '_blank');
  };

  const filteredCommandes = commandes.filter(
    (commande) =>
      commande.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commande.nomFournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStatutLabel(commande.statut).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTTC = commandes.reduce((sum, commande) => sum + commande.montantTTC, 0);
  const commandesReceptionnees = commandes.filter((commande) => commande.statut === 'R').length;
  const commandesEnAttente = commandes.filter((commande) => commande.statut === 'N').length;

  const statCards = [
    {
      label: 'Commandes',
      value: commandes.length,
      description: 'Fournisseurs',
      color: '#2563eb',
      icon: <ShoppingCart fontSize="small" />,
    },
    {
      label: 'Montant total',
      value: formatEuro(totalTTC),
      description: 'Total TTC',
      color: '#16a34a',
      icon: <Euro fontSize="small" />,
    },
    {
      label: 'Réceptionnées',
      value: commandesReceptionnees,
      description: 'Terminées',
      color: '#f97316',
      icon: <CheckCircle fontSize="small" />,
    },
    {
      label: 'En attente',
      value: commandesEnAttente,
      description: 'À traiter',
      color: '#7c3aed',
      icon: <LocalShipping fontSize="small" />,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '45vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <LocalShipping sx={{ fontSize: 32 }} />

            <Box>
              <Typography variant="h5" fontWeight={950}>
                Gestion des commandes fournisseurs
              </Typography>

              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.85rem' }}>
                Création, suivi, réception et approvisionnements fournisseurs
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<GetApp />}
              onClick={handleExportCSV}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.45)', fontWeight: 900 }}
            >
              Exporter CSV
            </Button>

            <Tooltip title={isAdmin ? 'Ajouter une commande' : 'Action réservée à l’administrateur'}>
              <span>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={openCreateDialog}
                  disabled={!isAdmin}
                  sx={{ bgcolor: '#fff', color: '#1d4ed8', fontWeight: 900 }}
                >
                  Ajouter commande
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {stockState?.fromStock && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2.5 }}>
          Commande ouverte depuis le stock pour : <strong>{stockState.articleLibelle}</strong>
          {stockState.magasinNom ? ` — ${stockState.magasinNom}` : ''}
        </Alert>
      )}

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ height: '100%', borderRadius: 3, bgcolor: isDarkMode ? '#0f172a' : '#ffffff' }}>
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

                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 2, borderRadius: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher par numéro, fournisseur ou statut..."
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
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 'calc(100vh - 330px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>Fournisseur</TableCell>
                <TableCell>Date commande</TableCell>
                <TableCell>Livraison prévue</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Total TTC</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredCommandes.map((commande) => (
                <TableRow key={commande.id} hover>
                  <TableCell>
                    <Chip label={commande.numero} variant="outlined" color="primary" size="small" />
                  </TableCell>

                  <TableCell>{commande.nomFournisseur}</TableCell>
                  <TableCell>{commande.dateCommande}</TableCell>
                  <TableCell>{commande.dateLivraisonPrevue || '-'}</TableCell>

                  <TableCell>
                    <Chip label={getStatutLabel(commande.statut)} color={getStatutColor(commande.statut) as any} size="small" />
                  </TableCell>

                  <TableCell align="right">{formatEuro(commande.montantTTC)}</TableCell>

                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={0.4}>
                      <IconButton size="small" onClick={() => handleVoirDetails(commande)}>
                        <Visibility fontSize="small" />
                      </IconButton>

                      <IconButton size="small" color="primary" onClick={() => openEditDialog(commande)} disabled={!isAdmin || commande.statut === 'R'}>
                        <Edit fontSize="small" />
                      </IconButton>

                      <IconButton size="small" color="info" onClick={() => updateStatut(commande, 'C')} disabled={!isAdmin}>
                        <CheckCircle fontSize="small" />
                      </IconButton>

                      <IconButton size="small" color="secondary" onClick={() => updateStatut(commande, 'L')} disabled={!isAdmin}>
                        <LocalShipping fontSize="small" />
                      </IconButton>

                      <IconButton size="small" color="success" onClick={() => updateStatut(commande, 'R')} disabled={!isAdmin}>
                        <CheckCircle fontSize="small" />
                      </IconButton>

                      <IconButton size="small" color="warning" onClick={() => updateStatut(commande, 'A')} disabled={!isAdmin}>
                        <Cancel fontSize="small" />
                      </IconButton>

                      <IconButton size="small" color="error" onClick={() => handleDeleteCommande(commande)} disabled={!isAdmin}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingCommandeId ? 'Modifier la commande fournisseur' : 'Nouvelle commande fournisseur'}</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={1.7}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Fournisseur</InputLabel>

                <Select
                  label="Fournisseur"
                  value={form.idFournisseur}
                  onChange={(e) => setForm({ ...form, idFournisseur: String(e.target.value) })}
                >
                  {fournisseurs.map((fournisseur) => (
                    <MenuItem key={fournisseur.id} value={String(fournisseur.id)}>
                      {fournisseur.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Magasin concerné</InputLabel>

                <Select
                  label="Magasin concerné"
                  value={form.magasinId}
                  onChange={(e) => setForm({ ...form, magasinId: String(e.target.value) })}
                >
                  {magasins.map((magasin) => (
                    <MenuItem key={magasin.id} value={String(magasin.id)}>
                      {getMagasinName(magasin)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date commande"
                value={form.dateCommande}
                onChange={(e) => setForm({ ...form, dateCommande: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Livraison prévue"
                value={form.dateLivraisonPrevue}
                onChange={(e) => setForm({ ...form, dateLivraisonPrevue: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: form.dateCommande }}
                error={livraisonAvantCommande}
                helperText={livraisonAvantCommande ? 'Date invalide' : ''}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Statut"
                value={editingCommandeId ? getStatutLabel(form.statut) : 'En attente'}
                disabled
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={950}>
                Articles de la commande
              </Typography>
            </Grid>

            <Grid item xs={12} md={9}>
              <Autocomplete
                size="small"
                options={articles}
                value={selectedArticle}
                onChange={(_event, newValue) => setSelectedArticle(newValue)}
                getOptionLabel={(option) =>
                  `${option.libelle || ''}${option.codeBarres ? ` — ${option.codeBarres}` : ''}`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                filterOptions={(options, { inputValue }) => {
                  const search = inputValue.toLowerCase().trim();

                  return options
                    .filter((option) => {
                      return (
                        option.libelle?.toLowerCase().includes(search) ||
                        option.codeBarres?.toLowerCase().includes(search)
                      );
                    })
                    .slice(0, 100);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rechercher et sélectionner un article"
                    placeholder="Nom ou code-barres..."
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.libelle} — {formatEuro(option.prixAchatHT)}
                    {option.codeBarres ? ` — ${option.codeBarres}` : ''}
                  </li>
                )}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Quantité"
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={1}>
              <Button fullWidth variant="contained" size="small" onClick={handleAddLigne} sx={{ height: 40 }}>
                +
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Article</TableCell>
                    <TableCell align="right">Quantité</TableCell>
                    <TableCell align="right">Prix HT</TableCell>
                    <TableCell align="right">Total HT</TableCell>
                    <TableCell align="right">Total TTC</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {lignes.map((ligne) => (
                    <TableRow key={ligne.id}>
                      <TableCell>
                        {ligne.designation}
                        {ligne.magasinNom && (
                          <Chip
                            size="small"
                            label={`Stock : ${ligne.magasinNom}`}
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>

                      <TableCell align="right">{ligne.quantite}</TableCell>
                      <TableCell align="right">{formatEuro(ligne.prixUnitaire)}</TableCell>
                      <TableCell align="right">{formatEuro(ligne.totalHT)}</TableCell>
                      <TableCell align="right">{formatEuro(ligne.totalTTC)}</TableCell>

                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => handleRemoveLigne(ligne.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography>Total HT : {formatEuro(totals.montantHT)}</Typography>
                <Typography>TVA : {formatEuro(totals.montantTVA)}</Typography>
                <Typography fontWeight={950}>Total TTC : {formatEuro(totals.montantTTC)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Annuler</Button>

          <Button variant="contained" onClick={handleSaveCommande} disabled={saving || livraisonAvantCommande}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la commande {selectedCommande?.numero}</DialogTitle>

        <DialogContent dividers>
          {selectedCommande && (
            <>
              <Typography>
                <strong>Fournisseur :</strong> {selectedCommande.nomFournisseur}
              </Typography>

              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Article</TableCell>
                    <TableCell align="right">Quantité</TableCell>
                    <TableCell align="right">Prix HT</TableCell>
                    <TableCell align="right">Total TTC</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedCommande.lignes.map((ligne) => (
                    <TableRow key={ligne.id}>
                      <TableCell>{ligne.designation}</TableCell>
                      <TableCell align="right">{ligne.quantite}</TableCell>
                      <TableCell align="right">{formatEuro(ligne.prixUnitaire)}</TableCell>
                      <TableCell align="right">{formatEuro(ligne.totalTTC)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <PermissionAlert message={alert.message} open={alert.open} onClose={closeAlert} />
    </Box>
  );
};

export { Commandes };
export default Commandes;
