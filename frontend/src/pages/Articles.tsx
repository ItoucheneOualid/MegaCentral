import React, { useEffect, useState } from 'react';

import {
  alpha,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
} from '@mui/material';

import {
  Search,
  Edit,
  Delete,
  Save,
  Cancel,
  Add,
  Inventory,
  Image,
  CloudUpload,
} from '@mui/icons-material';

import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';
import { PermissionAlert, usePermissionAlert } from '../components/PermissionAlert';
import { normalizeArray, normalizeArticle } from '../utils/megaCaisseDisplay';

interface Article {
  ARCLEUNIK: number;
  LIBELLE: string | null;
  Code_Barres: string | null;
  Prix_Vente_HT: number | null;
  Prix_Achat_HT: number | null;
  Prix_Achat_TTC: number | null;
  TVA_CLEUNIK?: number | null;
  Taux_TVA?: number | null;
  F1_Cleunik?: number | null;
  F2_CLEUNIK?: number | null;
  FRN_CLEUNIK?: number | null;
  FOUcleunik?: number | null;
  famille1_libelle?: string | null;
  famille2_libelle?: string | null;
  fournisseur_nom?: string | null;
  Photo_Base64?: string | null;
  Photo_Name?: string | null;
}

interface ArticleForm {
  LIBELLE: string;
  Code_Barres: string;
  Prix_Vente_HT: string;
  Prix_Achat_HT: string;
  Prix_Achat_TTC: string;
  TVA_CLEUNIK: string;
  FAMILLE_CLEUNIK: string;
  FOUcleunik: string;
  Photo_Name: string;
  Photo_Base64: string;
}

interface Famille {
  id: number;
  nom: string;
}

interface TvaRate {
  id: number;
  taux: number;
  description: string;
}

interface Fournisseur {
  id: string;
  nom: string;
}

const emptyForm: ArticleForm = {
  LIBELLE: '',
  Code_Barres: '',
  Prix_Vente_HT: '0',
  Prix_Achat_HT: '0',
  Prix_Achat_TTC: '0',
  TVA_CLEUNIK: '',
  FAMILLE_CLEUNIK: '',
  FOUcleunik: '',
  Photo_Name: '',
  Photo_Base64: '',
};

const Articles: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { alert, showPermissionAlert, closeAlert } = usePermissionAlert();

  const [articles, setArticles] = useState<Article[]>([]);
  const [familles, setFamilles] = useState<Famille[]>([]);
  const [tvaRates, setTvaRates] = useState<TvaRate[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFournisseurFilter, setSelectedFournisseurFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [selectedPhotoArticle, setSelectedPhotoArticle] = useState<Article | null>(null);

  const isAdmin = user?.role === 'admin';

  const toNumber = (value: string | number | null | undefined) => {
    return Number(String(value ?? '0').replace(',', '.')) || 0;
  };

  const selectedTvaRate = tvaRates.find((tva) => String(tva.id) === form.TVA_CLEUNIK);
  const tauxTVA = selectedTvaRate?.taux || 0;

  const prixVenteHT = toNumber(form.Prix_Vente_HT);
  const prixAchatHT = toNumber(form.Prix_Achat_HT);
  const prixVenteTTC = prixVenteHT * (1 + tauxTVA / 100);

  const venteAPerte = prixVenteHT > 0 && prixAchatHT > 0 && prixVenteHT < prixAchatHT;

  const articlesAvecPhoto = articles.filter((article) => article.Photo_Base64).length;
  const articlesSansPhoto = articles.length - articlesAvecPhoto;
  const nombreFournisseurs = fournisseurs.length;

  const formatPrice = (price: number | null | string | undefined) => {
    const numPrice = parseFloat(price?.toString() || '0');
    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(numPrice);
  };

  const normalizeBase64Image = (base64?: string | null) => {
    if (!base64) return '';
    if (base64.startsWith('data:image')) return base64;
    if (base64.startsWith('/9j/')) return `data:image/jpeg;base64,${base64}`;
    if (base64.startsWith('iVBOR')) return `data:image/png;base64,${base64}`;
    if (base64.startsWith('Qk')) return `data:image/bmp;base64,${base64}`;
    return `data:image/jpeg;base64,${base64}`;
  };

  const adaptFamilles = (data: any[]): Famille[] => {
    if (!Array.isArray(data)) return [];

    return data.map((fam: any, index: number) => ({
      id: Number(
        fam.id ??
          fam.FAM_CLEUNIK ??
          fam.F2_CLEUNIK ??
          fam.F2CLEUNIK ??
          fam.F2cleunik ??
          fam.F1_Cleunik ??
          fam.F1cleunik ??
          fam.cleunik ??
          index + 1
      ),
      nom:
        fam.nom ??
        fam.Nom ??
        fam.LIBELLE ??
        fam.Libelle ??
        fam.libelle ??
        fam.Description ??
        fam.description ??
        fam.name ??
        `Famille ${index + 1}`,
    }));
  };

  const adaptTvaRates = (data: any[]): TvaRate[] =>
    data.map((tva: any, index: number) => ({
      id: Number(tva.id ?? tva.TVA_ID ?? tva.TVA_CLEUNIK ?? index + 1),
      taux: Number(tva.taux ?? tva.Taux ?? tva.tva_taux ?? 0),
      description:
        tva.description ??
        tva.Description ??
        tva.libelle ??
        `${tva.taux ?? tva.Taux ?? tva.tva_taux ?? 0}%`,
    }));

  const adaptFournisseurs = (data: any[]): Fournisseur[] => {
    if (!Array.isArray(data)) return [];

    return data.map((f: any, index: number) => ({
      id: String(
        f.id ??
          f.FOUcleunik ??
          f.FRN_CLEUNIK ??
          f.FRCLEUNIK ??
          f.Fou_Cleunik ??
          f.cleunik ??
          index + 1
      ),
      nom:
        f.nom ??
        f.Nom ??
        f.NOM ??
        f.fournisseur_nom ??
        f.Nom_Societe ??
        f.nomSociete ??
        f.RaisonSociale ??
        f.Societe ??
        f.name ??
        `Fournisseur ${index + 1}`,
    }));
  };

  const fetchArticles = async () => {
    const response = await api.get('/articles');
    const rows = normalizeArray<any>(response.data).map(normalizeArticle);
    setArticles(rows);
  };

  const fetchFamilles = async () => {
    try {
      const response = await api.get('/familles/familles2');
      const famillesData = response.data.data || response.data || [];
      const adapted = adaptFamilles(famillesData);

      setFamilles(
        adapted.length > 0
          ? adapted
          : [
              { id: 1, nom: 'Famille 1' },
              { id: 2, nom: 'Famille 2' },
              { id: 3, nom: 'Famille 3' },
              { id: 4, nom: 'Famille 4' },
              { id: 5, nom: 'Famille 5' },
            ]
      );
    } catch {
      setFamilles([
        { id: 1, nom: 'Famille 1' },
        { id: 2, nom: 'Famille 2' },
        { id: 3, nom: 'Famille 3' },
        { id: 4, nom: 'Famille 4' },
        { id: 5, nom: 'Famille 5' },
      ]);
    }
  };

  const fetchTvaRates = async () => {
    try {
      const response = await api.get('/tva');
      setTvaRates(adaptTvaRates(response.data.data || response.data || []));
    } catch {
      setTvaRates([
        { id: 1, taux: 0, description: '0%' },
        { id: 2, taux: 6, description: '6%' },
        { id: 3, taux: 12, description: '12%' },
        { id: 4, taux: 21, description: '21%' },
      ]);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await api.get('/fournisseurs');
      setFournisseurs(adaptFournisseurs(response.data.data || response.data || []));
    } catch {
      setFournisseurs([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await fetchArticles();
      await fetchFamilles();
      await fetchTvaRates();
      await fetchFournisseurs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      article.LIBELLE?.toLowerCase().includes(search) ||
      article.Code_Barres?.toLowerCase().includes(search);

    const fournisseurId = article.FRN_CLEUNIK ?? article.FOUcleunik;

    const matchesFournisseur =
      selectedFournisseurFilter === '' || String(fournisseurId || '') === selectedFournisseurFilter;

    return matchesSearch && matchesFournisseur;
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleInputChange = (field: keyof ArticleForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || '');
      const base64Only = result.includes(',') ? result.split(',')[1] : result;

      setForm((prev) => ({
        ...prev,
        Photo_Name: file.name,
        Photo_Base64: base64Only,
      }));
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const buildPayload = () => {
    const fournisseurId = form.FOUcleunik ? Number(form.FOUcleunik) : 0;
    const familleId = form.FAMILLE_CLEUNIK ? Number(form.FAMILLE_CLEUNIK) : 0;
    const tvaId = form.TVA_CLEUNIK ? Number(form.TVA_CLEUNIK) : 0;

    return {
      LIBELLE: form.LIBELLE.trim(),
      Code_Barres: form.Code_Barres.trim(),
      Prix_Vente_HT: toNumber(form.Prix_Vente_HT),
      Prix_Vente_TTC: Number(prixVenteTTC.toFixed(2)),
      Prix_Achat_HT: toNumber(form.Prix_Achat_HT),
      Prix_Achat_TTC: toNumber(form.Prix_Achat_TTC),
      TVA_CLEUNIK: tvaId,
      Taux_TVA: tauxTVA,
      F1_Cleunik: familleId,
      F2_CLEUNIK: familleId,
      FRN_CLEUNIK: fournisseurId,
      FOUcleunik: fournisseurId,
      Photo_Name: form.Photo_Name || null,
      Photo_Base64: form.Photo_Base64 || null,
    };
  };

  const handleCreateClick = () => {
    if (!isAdmin) {
      showPermissionAlert("Création d'article non autorisée. Cette action nécessite un compte administrateur.");
      return;
    }

    resetForm();
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!form.LIBELLE.trim()) {
      setError('Le libellé est obligatoire');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await api.post('/articles', buildPayload());
      const createdId = response.data?.data?.ARCLEUNIK || response.data?.ARCLEUNIK;

      if (createdId && form.Photo_Name && form.Photo_Base64) {
        await api.post(`/photos/${createdId}`, {
          Photo_Name: form.Photo_Name,
          Photo_Base64: form.Photo_Base64,
        });
      }

      setCreateDialogOpen(false);
      resetForm();
      await fetchArticles();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'article");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (article: Article) => {
    if (!isAdmin) {
      showPermissionAlert("Modification d'article non autorisée. Cette action nécessite un compte administrateur.");
      return;
    }

    setEditingId(article.ARCLEUNIK);

    setForm({
      LIBELLE: article.LIBELLE || '',
      Code_Barres: article.Code_Barres || '',
      Prix_Vente_HT: String(article.Prix_Vente_HT ?? '0'),
      Prix_Achat_HT: String(article.Prix_Achat_HT ?? '0'),
      Prix_Achat_TTC: String(article.Prix_Achat_TTC ?? '0'),
      TVA_CLEUNIK: String(article.TVA_CLEUNIK ?? ''),
      FAMILLE_CLEUNIK: String(article.F2_CLEUNIK ?? article.F1_Cleunik ?? ''),
      FOUcleunik: String(article.FOUcleunik ?? article.FRN_CLEUNIK ?? ''),
      Photo_Name: article.Photo_Name || '',
      Photo_Base64: article.Photo_Base64 || '',
    });

    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingId) return;

    if (!form.LIBELLE.trim()) {
      setError('Le libellé est obligatoire');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await api.put(`/articles/${editingId}`, buildPayload());

      if (form.Photo_Base64 && form.Photo_Name) {
        await api.post(`/photos/${editingId}`, {
          Photo_Name: form.Photo_Name,
          Photo_Base64: form.Photo_Base64,
        });
      }

      setEditDialogOpen(false);
      resetForm();
      await fetchArticles();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la modification de l'article");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (article: Article) => {
    if (!isAdmin) {
      showPermissionAlert("Suppression d'article non autorisée. Cette action nécessite un compte administrateur.");
      return;
    }

    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;

    try {
      setSaving(true);
      await api.delete(`/articles/${articleToDelete.ARCLEUNIK}`);
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
      await fetchArticles();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la suppression de l'article");
    } finally {
      setSaving(false);
    }
  };

  const handleVoirPhoto = async (article: Article) => {
    try {
      if (article.Photo_Base64) {
        setSelectedPhotoArticle(article);
        setPhotoDialogOpen(true);
        return;
      }

      try {
        const response = await api.get(`/photos/${article.ARCLEUNIK}`);
        const photoData = response.data.data || response.data;

        setSelectedPhotoArticle({
          ...article,
          Photo_Name: photoData.Photo_Name || photoData.photoName || article.LIBELLE || 'Photo article',
          Photo_Base64: photoData.Photo_Base64 || photoData.photoBase64 || photoData.base64,
        });

        setPhotoDialogOpen(true);
      } catch {
        setSelectedPhotoArticle(article);
        setPhotoDialogOpen(true);
      }
    } catch {
      setSelectedPhotoArticle(article);
      setPhotoDialogOpen(true);
    }
  };

  const getFournisseurName = (article: Article) => {
    if (article.fournisseur_nom) return article.fournisseur_nom;

    const fournisseurId = article.FOUcleunik ?? article.FRN_CLEUNIK;
    const fournisseur = fournisseurs.find((f) => f.id === String(fournisseurId));

    return fournisseur?.nom || '-';
  };

  const getFamilleName = (article: Article) => {
    if (article.famille2_libelle) return article.famille2_libelle;
    if (article.famille1_libelle) return article.famille1_libelle;

    const familleId = article.F2_CLEUNIK ?? article.F1_Cleunik;
    const famille = familles.find((f) => f.id === Number(familleId));

    return famille?.nom || '-';
  };

  const statCards = [
    {
      label: 'Articles',
      value: articles.length,
      color: '#2563eb',
      description: 'Références',
    },
    {
      label: 'Avec photo',
      value: articlesAvecPhoto,
      color: '#16a34a',
      description: 'Illustrés',
    },
    {
      label: 'Sans photo',
      value: articlesSansPhoto,
      color: '#f97316',
      description: 'À compléter',
    },
    {
      label: 'Fournisseurs',
      value: nombreFournisseurs,
      color: '#7c3aed',
      description: 'Partenaires',
    },
  ];

  const renderPhotoUploader = () => (
    <Grid item xs={12}>
      <Box
        sx={{
          border: `1px dashed ${alpha('#2563eb', 0.55)}`,
          borderRadius: 2.5,
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          bgcolor: isDarkMode ? alpha('#2563eb', 0.08) : alpha('#2563eb', 0.04),
        }}
      >
        <Button variant="outlined" component="label" size="small" startIcon={<CloudUpload />} sx={{ borderRadius: 2.5 }}>
          {editingId ? 'Modifier la photo' : 'Ajouter une photo'}
          <input type="file" hidden accept="image/*" onChange={handlePhotoFileChange} />
        </Button>

        {form.Photo_Name ? (
          <Chip size="small" color="success" label={`Photo : ${form.Photo_Name}`} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Aucune photo sélectionnée
          </Typography>
        )}

        {form.Photo_Base64 && (
          <Box
            component="img"
            src={normalizeBase64Image(form.Photo_Base64)}
            alt="Aperçu article"
            sx={{
              width: 72,
              height: 72,
              objectFit: 'cover',
              borderRadius: 2,
              border: `1px solid ${alpha('#2563eb', 0.25)}`,
            }}
          />
        )}
      </Box>
    </Grid>
  );

  const renderArticleForm = () => (
    <Grid container spacing={1.7} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          size="small"
          label="Libellé"
          value={form.LIBELLE}
          onChange={(e) => handleInputChange('LIBELLE', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label="Code-barres"
          value={form.Code_Barres}
          onChange={(e) => handleInputChange('Code_Barres', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          size="small"
          label="Prix vente HT"
          type="number"
          value={form.Prix_Vente_HT}
          onChange={(e) => handleInputChange('Prix_Vente_HT', e.target.value)}
          error={venteAPerte}
          helperText={venteAPerte ? "Prix inférieur au prix d'achat" : ''}
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
            inputProps: { min: 0, step: 0.01 },
          }}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          size="small"
          label="Prix achat HT"
          type="number"
          value={form.Prix_Achat_HT}
          onChange={(e) => handleInputChange('Prix_Achat_HT', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
            inputProps: { min: 0, step: 0.01 },
          }}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          size="small"
          label="Prix vente TTC"
          type="number"
          value={prixVenteTTC.toFixed(2)}
          InputProps={{
            readOnly: true,
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
          helperText="Calculé selon la TVA"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>TVA</InputLabel>
          <Select
            value={form.TVA_CLEUNIK}
            label="TVA"
            onChange={(e) => handleInputChange('TVA_CLEUNIK', String(e.target.value))}
          >
            <MenuItem value="">Aucune</MenuItem>
            {tvaRates.map((tva) => (
              <MenuItem key={tva.id} value={String(tva.id)}>
                {tva.description || `${tva.taux}%`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Catégorie / Famille</InputLabel>
          <Select
            value={form.FAMILLE_CLEUNIK}
            label="Catégorie / Famille"
            onChange={(e) => handleInputChange('FAMILLE_CLEUNIK', String(e.target.value))}
          >
            <MenuItem value="">Aucune</MenuItem>
            {familles.map((famille) => (
              <MenuItem key={famille.id} value={String(famille.id)}>
                {famille.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Fournisseur</InputLabel>
          <Select
            value={form.FOUcleunik}
            label="Fournisseur"
            onChange={(e) => handleInputChange('FOUcleunik', String(e.target.value))}
          >
            <MenuItem value="">Aucun</MenuItem>
            {fournisseurs.map((fournisseur) => (
              <MenuItem key={fournisseur.id} value={fournisseur.id}>
                {fournisseur.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {venteAPerte && (
        <Grid item xs={12}>
          <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
            Prix de vente inférieur au prix d'achat. Cet article sera vendu à perte.
          </Alert>
        </Grid>
      )}

      {renderPhotoUploader()}
    </Grid>
  );

  const selectedPhotoSrc = normalizeBase64Image(selectedPhotoArticle?.Photo_Base64);

  const paginationTop = (
    <TablePagination
      component="div"
      count={filteredArticles.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      labelRowsPerPage="Lignes"
      rowsPerPageOptions={[10, 25, 50, 100]}
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
            filter: 'blur(2px)',
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
                Gestion des articles
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.85rem' }}>
                Catalogue produits, prix, fournisseurs et photos
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            onClick={handleCreateClick}
            startIcon={<Add />}
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
            Ajouter un article
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
                boxShadow: isDarkMode ? '0 12px 30px rgba(0,0,0,0.2)' : '0 12px 30px rgba(15,23,42,0.06)',
              }}
            >
              <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" fontWeight={800} fontSize="0.78rem">
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={950} sx={{ color: stat.color, mt: 0.2 }}>
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
                    <Inventory fontSize="small" />
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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
            <TextField
              sx={{ flex: 1, width: '100%' }}
              size="small"
              placeholder={t.articles?.recherchePlaceholder || 'Rechercher un article, code-barres...'}
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

            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
              <InputLabel>Fournisseur</InputLabel>
              <Select
                value={selectedFournisseurFilter}
                onChange={(e) => {
                  setSelectedFournisseurFilter(String(e.target.value));
                  setPage(0);
                }}
                label="Fournisseur"
              >
                <MenuItem value="">Tous</MenuItem>
                {fournisseurs.map((fournisseur) => (
                  <MenuItem key={fournisseur.id} value={fournisseur.id}>
                    {fournisseur.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchTerm('');
                setSelectedFournisseurFilter('');
                setPage(0);
              }}
              sx={{
                borderRadius: 2.5,
                px: 2,
                height: 40,
                minWidth: { xs: '100%', md: 'auto' },
                textTransform: 'none',
                fontWeight: 800,
              }}
            >
              Réinitialiser
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="45vh">
          <CircularProgress size={48} />
        </Box>
      ) : (
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
                Liste des articles
              </Typography>

              <Chip
                size="small"
                label={`${filteredArticles.length} résultat(s)`}
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
                  <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Code-barres</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Libellé</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Prix vente HT</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Prix achat HT</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Famille</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Fournisseur</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Photo</TableCell>
                  <TableCell sx={{ fontWeight: 900, fontSize: '0.78rem', py: 1 }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredArticles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((article) => (
                    <TableRow
                      key={article.ARCLEUNIK}
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
                          label={article.Code_Barres || '-'}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 700, borderRadius: 1.5, height: 23, fontSize: '0.72rem' }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={850} fontSize="0.84rem">
                          {article.LIBELLE || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={800} color="primary" fontSize="0.84rem">
                          {formatPrice(article.Prix_Vente_HT)}
                        </Typography>
                      </TableCell>

                      <TableCell>{formatPrice(article.Prix_Achat_HT)}</TableCell>
                      <TableCell>{getFamilleName(article)}</TableCell>
                      <TableCell>{getFournisseurName(article)}</TableCell>

                      <TableCell>
                        {article.Photo_Base64 ? (
                          <Tooltip title="Voir la photo de l'article">
                            <Button
                              size="small"
                              color="success"
                              variant="contained"
                              startIcon={<Image fontSize="small" />}
                              onClick={() => handleVoirPhoto(article)}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 800,
                                py: 0.3,
                                px: 1,
                                fontSize: '0.72rem',
                              }}
                            >
                              Voir
                            </Button>
                          </Tooltip>
                        ) : (
                          <Chip label="Aucune" color="warning" size="small" variant="outlined" sx={{ height: 23 }} />
                        )}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.7 }}>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(article)}
                              sx={{ bgcolor: alpha('#2563eb', 0.1), '&:hover': { bgcolor: alpha('#2563eb', 0.18) } }}
                            >
                              <Edit color="primary" fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(article)}
                              sx={{ bgcolor: alpha('#ef4444', 0.1), '&:hover': { bgcolor: alpha('#ef4444', 0.18) } }}
                            >
                              <Delete color="error" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                {filteredArticles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Aucun article trouvé</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={950}>Ajouter un article</DialogTitle>
        <DialogContent>{renderArticleForm()}</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} startIcon={<Cancel />} sx={{ borderRadius: 2.5 }}>
            Annuler
          </Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : <Save />}
            disabled={saving}
            sx={{ borderRadius: 2.5, fontWeight: 900 }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={950}>Modifier l'article</DialogTitle>
        <DialogContent>{renderArticleForm()}</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<Cancel />} sx={{ borderRadius: 2.5 }}>
            Annuler
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : <Save />}
            disabled={saving}
            sx={{ borderRadius: 2.5, fontWeight: 900 }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={950}>Photo de l'article</DialogTitle>

        <DialogContent dividers>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {selectedPhotoArticle?.LIBELLE || 'Article'}
          </Typography>

          {selectedPhotoSrc ? (
            <Box
              component="img"
              src={selectedPhotoSrc}
              alt={selectedPhotoArticle?.Photo_Name || selectedPhotoArticle?.LIBELLE || 'Photo article'}
              sx={{
                width: '100%',
                maxHeight: 420,
                objectFit: 'contain',
                borderRadius: 3,
                border: `1px solid ${alpha('#94a3b8', 0.25)}`,
                backgroundColor: '#fafafa',
              }}
            />
          ) : (
            <Alert severity="info">Aucune photo disponible pour cet article.</Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPhotoDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 950 }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous supprimer l'article : <strong>{articleToDelete?.LIBELLE}</strong> ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} startIcon={<Cancel />} sx={{ borderRadius: 2.5 }}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            disabled={saving}
            sx={{ borderRadius: 2.5, fontWeight: 900 }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <PermissionAlert message={alert.message} open={alert.open} onClose={closeAlert} />
    </Box>
  );
};

export { Articles };
