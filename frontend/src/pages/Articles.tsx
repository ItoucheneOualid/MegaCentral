import React, { useEffect, useState } from 'react';

import {
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
} from '@mui/material';

import {
  Search,
  Edit,
  Delete,
  Save,
  Cancel,
  Add,
  Inventory,
  PhotoCamera,
  Image,
  CloudUpload,
} from '@mui/icons-material';

import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';
import { PermissionAlert, usePermissionAlert } from '../components/PermissionAlert';

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

  const formatPrice = (price: number | null | string | undefined) => {
    const numPrice = parseFloat(price?.toString() || '0');
    return new Intl.NumberFormat('fr-FR', {
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
    setArticles(response.data.data || response.data || []);
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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

    console.log('Nouvelle photo sélectionnée:', file.name);
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
      Prix_Vente_HT: parseFloat(form.Prix_Vente_HT.replace(',', '.')) || 0,
      Prix_Achat_HT: parseFloat(form.Prix_Achat_HT.replace(',', '.')) || 0,
      Prix_Achat_TTC: parseFloat(form.Prix_Achat_TTC.replace(',', '.')) || 0,
      TVA_CLEUNIK: tvaId,
      Taux_TVA: tvaId,
      F1_Cleunik: familleId,
      F2_CLEUNIK: familleId,
      FRN_CLEUNIK: fournisseurId,
      FOUcleunik: fournisseurId,

      // Champs photo en base64
      Photo_Name: form.Photo_Name || null,
      Photo_Base64: form.Photo_Base64 || null,
    };
  };

  const savePhotoIfPossible = async (articleId: number) => {
    if (!form.Photo_Base64) return;

    try {
    const savePhotoIfPossible = async (articleId: number) => {
  if (!form.Photo_Base64 || !form.Photo_Name) return;

  await api.post(`/photos/${articleId}`, {
    Photo_Name: form.Photo_Name,
    Photo_Base64: form.Photo_Base64,
  });
};
    } catch (err) {
      console.warn('Photo non sauvegardée via /photos. Elle est conservée côté formulaire uniquement.', err);
    }
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

    const createdId =
      response.data?.data?.ARCLEUNIK ||
      response.data?.ARCLEUNIK;

    console.log('Article créé ID:', createdId);
    console.log('Photo dans formulaire:', {
      Photo_Name: form.Photo_Name,
      hasPhoto: !!form.Photo_Base64,
    });

    if (createdId && form.Photo_Name && form.Photo_Base64) {
      await api.post(`/photos/${createdId}`, {
        Photo_Name: form.Photo_Name,
        Photo_Base64: form.Photo_Base64,
      });

      console.log('Photo sauvegardée pour article:', createdId);
    } else {
      console.log('Aucune photo envoyée');
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
      TVA_CLEUNIK: String(article.TVA_CLEUNIK ?? article.Taux_TVA ?? ''),
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

      console.log('Photo modifiée pour article:', editingId);
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
    } catch (err) {
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

  const renderPhotoUploader = () => (
    <Grid item xs={12}>
      <Box
        sx={{
          border: '1px dashed #1976d2',
          borderRadius: 2,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
          {editingId ? 'Modifier la photo' : 'Ajouter une photo'}
          <input type="file" hidden accept="image/*" onChange={handlePhotoFileChange} />
        </Button>

        {form.Photo_Name ? (
          <Chip color="success" label={`Photo sélectionnée pour modification   : ${form.Photo_Name}`} />
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
              width: 90,
              height: 90,
              objectFit: 'cover',
              borderRadius: 2,
              border: '1px solid #ddd',
            }}
          />
        )}
      </Box>
    </Grid>
  );

  const renderArticleForm = () => (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="Libellé"
          value={form.LIBELLE}
          onChange={(e) => handleInputChange('LIBELLE', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Code-barres"
          value={form.Code_Barres}
          onChange={(e) => handleInputChange('Code_Barres', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
  fullWidth
  label="Prix vente HT"
  type="number"
  value={form.Prix_Vente_HT}
  onChange={(e) => handleInputChange('Prix_Vente_HT', e.target.value)}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">€</InputAdornment>
    ),
    inputProps: {
      min: 0,
      step: 0.01,
    },
  }}
/>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
  fullWidth
  label="Prix achat HT"
  type="number"
  value={form.Prix_Achat_HT}
  onChange={(e) => handleInputChange('Prix_Achat_HT', e.target.value)}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">€</InputAdornment>
    ),
    inputProps: {
      min: 0,
      step: 0.01,
    },
  }}
/>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
  fullWidth
  label="Prix achat TTC"
  type="number"
  value={form.Prix_Achat_TTC}
  onChange={(e) => handleInputChange('Prix_Achat_TTC', e.target.value)}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">€</InputAdornment>
    ),
    inputProps: {
      min: 0,
      step: 0.01,
    },
  }}
/>
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
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
        <FormControl fullWidth>
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
        <FormControl fullWidth>
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

      {renderPhotoUploader()}
    </Grid>
  );

  const selectedPhotoSrc = normalizeBase64Image(selectedPhotoArticle?.Photo_Base64);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
        <Inventory sx={{ mr: 2 }} />
        Articles
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ color: '#1976d2' }}>
              Gestion des articles
            </Typography>
            <Chip label={`${articles.length} articles`} color="primary" sx={{ fontWeight: 'bold' }} />
          </Box>

          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              sx={{ flex: 1, minWidth: 250 }}
              placeholder={t.articles?.recherchePlaceholder || 'Rechercher un article...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Fournisseur</InputLabel>
              <Select
                value={selectedFournisseurFilter}
                onChange={(e) => setSelectedFournisseurFilter(String(e.target.value))}
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
              onClick={() => {
                setSearchTerm('');
                setSelectedFournisseurFilter('');
              }}
            >
              Réinitialiser
            </Button>

            <Button variant="contained" onClick={handleCreateClick} startIcon={<Add />}>
              Ajouter un article
            </Button>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code-barres</TableCell>
                  <TableCell>Libellé</TableCell>
                  <TableCell>Prix vente HT</TableCell>
                  <TableCell>Prix achat HT</TableCell>
                  <TableCell>Prix achat TTC</TableCell>
                  <TableCell>Catégorie / Famille</TableCell>
                  <TableCell>Fournisseur</TableCell>
                  <TableCell>Photo</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredArticles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((article) => (
                    <TableRow key={article.ARCLEUNIK}>
                      <TableCell>{article.Code_Barres || '-'}</TableCell>
                      <TableCell>{article.LIBELLE || '-'}</TableCell>
                      <TableCell>{formatPrice(article.Prix_Vente_HT)}</TableCell>
                      <TableCell>{formatPrice(article.Prix_Achat_HT)}</TableCell>
                      <TableCell>{formatPrice(article.Prix_Achat_TTC)}</TableCell>
                      <TableCell>{getFamilleName(article)}</TableCell>
                      <TableCell>{getFournisseurName(article)}</TableCell>

                      <TableCell>
                        <TableCell>
  {article.Photo_Base64 ? (
    <Tooltip title="Voir la photo de l'article">
      <Button
        size="small"
        color="success"
        variant="contained"
        startIcon={<Image />}
        onClick={() => handleVoirPhoto(article)}
      >
        Voir photo
      </Button>
    </Tooltip>
  ) : (
    <Chip
      label="Aucune photo"
      color="error"
      size="small"
      variant="outlined"
    />
  )}
</TableCell>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Modifier">
                            <IconButton onClick={() => handleEditClick(article)}>
                              <Edit color="primary" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Supprimer">
                            <IconButton onClick={() => handleDeleteClick(article)}>
                              <Delete color="error" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredArticles.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
          />
        </Card>
      )}

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter un article</DialogTitle>
        <DialogContent>{renderArticleForm()}</DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} startIcon={<Cancel />}>
            Annuler
          </Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : <Save />}
            disabled={saving}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Modifier l'article</DialogTitle>
        <DialogContent>{renderArticleForm()}</DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<Cancel />}>
            Annuler
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : <Save />}
            disabled={saving}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Photo de l'article
        </DialogTitle>

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
                borderRadius: 2,
                border: '1px solid #ddd',
                backgroundColor: '#fafafa',
              }}
            />
          ) : (
            <Alert severity="info">
              Aucune photo disponible pour cet article.
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPhotoDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous supprimer l'article : <strong>{articleToDelete?.LIBELLE}</strong> ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} startIcon={<Cancel />}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            disabled={saving}
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