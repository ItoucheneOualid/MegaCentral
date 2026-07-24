import React, { useState, useEffect } from 'react';
import {
  alpha,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Avatar,
  Chip,
  InputAdornment,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  LocationOn,
  Save,
  Business,
  Phone,
  Email,
  CalendarToday,
  Groups,
  Public,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';
import { PermissionAlert, usePermissionAlert } from '../components/PermissionAlert';

interface Fournisseur {
  id: number;
  code: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  ville: string;
  codePostal: string;
  pays: string;
  statut: string;
  dateCreation: string;
}

const COUNTRY_PHONE_RULES = [
  { code: 'BE', pays: 'Belgique', indicatif: '+32', digits: 9 },
  { code: 'FR', pays: 'France', indicatif: '+33', digits: 9 },
];

const isValidEmail = (email: string) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

const getCountryRule = (pays: string) =>
  COUNTRY_PHONE_RULES.find((country) => country.pays === pays);

const normalizePhone = (phone: string, pays: string) => {
  const country = getCountryRule(pays);
  if (!country || !phone) return phone;

  let digits = cleanPhone(phone);
  const indicatifDigits = cleanPhone(country.indicatif);

  if (digits.startsWith(indicatifDigits)) {
    digits = digits.slice(indicatifDigits.length);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return `${country.indicatif}${digits}`;
};

const isValidPhone = (phone: string, pays: string) => {
  if (!phone) return true;

  const country = getCountryRule(pays);
  if (!country) return false;

  let digits = cleanPhone(phone);
  const indicatifDigits = cleanPhone(country.indicatif);

  if (digits.startsWith(indicatifDigits)) {
    digits = digits.slice(indicatifDigits.length);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.length === country.digits;
};

const Fournisseurs: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { user } = useAuth();

  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { alert, showPermissionAlert, closeAlert } = usePermissionAlert();

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    ville: '',
    codePostal: '',
    pays: 'Belgique',
    statut: 'Actif',
  });

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/fournisseurs');
      setFournisseurs(response.data || []);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.message) {
        showPermissionAlert(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'Erreur lors du chargement des fournisseurs');
      }
      setFournisseurs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredFournisseurs = fournisseurs.filter((fournisseur) => {
    const searchLower = searchTerm.toLowerCase();

    return (
      !searchTerm ||
      fournisseur.nom?.toLowerCase().includes(searchLower) ||
      fournisseur.code?.toLowerCase().includes(searchLower) ||
      fournisseur.email?.toLowerCase().includes(searchLower)
    );
  });

  const fournisseursActifs = fournisseurs.filter((f) => f.statut?.toLowerCase() === 'actif').length;
  const fournisseursAvecEmail = fournisseurs.filter((f) => f.email).length;
  const paysDifferents = new Set(fournisseurs.map((f) => f.pays).filter(Boolean)).size;

  const statCards = [
    {
      label: 'Fournisseurs',
      value: fournisseurs.length,
      description: 'Partenaires',
      color: '#2563eb',
      icon: <Groups fontSize="small" />,
    },
    {
      label: 'Actifs',
      value: fournisseursActifs,
      description: 'Opérationnels',
      color: '#16a34a',
      icon: <Business fontSize="small" />,
    },
    {
      label: 'Avec email',
      value: fournisseursAvecEmail,
      description: 'Contacts',
      color: '#f97316',
      icon: <Email fontSize="small" />,
    },
    {
      label: 'Pays',
      value: paysDifferents,
      description: 'Zones',
      color: '#7c3aed',
      icon: <Public fontSize="small" />,
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateFournisseurCode = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `FRN${year}${month}${day}${random}`;
  };

  const resetForm = () => {
    setFormData({
      code: '',
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      ville: '',
      codePostal: '',
      pays: 'Belgique',
      statut: 'Actif',
    });
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom du fournisseur est obligatoire');
      return false;
    }

    if (!formData.pays) {
      setError('Veuillez sélectionner le pays du fournisseur');
      return false;
    }

    if (!isValidEmail(formData.email)) {
      setError("L'adresse email n'est pas valide");
      return false;
    }

    if (!isValidPhone(formData.telephone, formData.pays)) {
      const country = getCountryRule(formData.pays);
      setError(
        `Le numéro de téléphone n'est pas valide pour ${formData.pays}. Format attendu : ${country?.indicatif} suivi de ${country?.digits} chiffres.`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      const newFournisseur = {
        ...formData,
        telephone: normalizePhone(formData.telephone, formData.pays),
        code: generateFournisseurCode(),
        dateCreation: new Date().toLocaleDateString('fr-FR'),
      };

      await api.post('/fournisseurs', newFournisseur);
      await fetchFournisseurs();

      setOpenDialog(false);
      resetForm();
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.message) {
        showPermissionAlert(err.response.data.message);
      } else {
        setError(err.response?.data?.message || "Erreur lors de l'ajout du fournisseur");
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedFournisseur(null);
    resetForm();
    setError(null);
  };

  const handleCreateFournisseur = () => {
    if (!user || user.role !== 'admin') {
      showPermissionAlert(
        "🚫 Création de fournisseur non autorisée\n\nLes utilisateurs standards peuvent uniquement consulter les fournisseurs.\n\nContactez votre administrateur pour obtenir les permissions nécessaires."
      );
      return;
    }

    resetForm();
    setOpenDialog(true);
  };

  const handleEditFournisseur = (fournisseur: Fournisseur) => {
    if (!user || user.role !== 'admin') {
      showPermissionAlert(
        "🚫 Modification de fournisseur non autorisée\n\nLes utilisateurs standards ont un accès en lecture seule aux fournisseurs.\n\nPour pouvoir modifier des fournisseurs, demandez une élévation de permissions."
      );
      return;
    }

    setSelectedFournisseur(fournisseur);
    setFormData({
      code: fournisseur.code || '',
      nom: fournisseur.nom || '',
      adresse: fournisseur.adresse || '',
      telephone: fournisseur.telephone || '',
      email: fournisseur.email || '',
      ville: fournisseur.ville || '',
      codePostal: fournisseur.codePostal || '',
      pays: fournisseur.pays === 'France' ? 'France' : 'Belgique',
      statut:
        fournisseur.statut === 'actif'
          ? 'Actif'
          : fournisseur.statut === 'inactif'
            ? 'Inactif'
            : 'En attente',
    });

    setEditMode(true);
    setOpenDialog(true);
  };

  const handleUpdateFournisseur = async () => {
    try {
      if (!selectedFournisseur) return;
      if (!validateForm()) return;

      await api.put(`/fournisseurs/${selectedFournisseur.id}`, {
        ...formData,
        telephone: normalizePhone(formData.telephone, formData.pays),
        id: selectedFournisseur.id,
      });

      await fetchFournisseurs();
      handleDialogClose();
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.message) {
        showPermissionAlert(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour du fournisseur');
      }
    }
  };

  const handleDeleteFournisseur = async (fournisseur: Fournisseur) => {
    if (!user || user.role !== 'admin') {
      showPermissionAlert(
        "🚫 Suppression de fournisseur non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération."
      );
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${fournisseur.nom}" ?`)) {
      try {
        await api.delete(`/fournisseurs/${fournisseur.id}`);
        await fetchFournisseurs();
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 403 && err.response?.data?.message) {
          showPermissionAlert(err.response.data.message);
        } else {
          setError(err.response?.data?.message || 'Erreur lors de la suppression du fournisseur');
        }
      }
    }
  };

  const selectedCountry = getCountryRule(formData.pays);

  if (loading) {
    return (
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '45vh',
          background: isDarkMode
            ? 'linear-gradient(135deg, #07111f 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #eef4ff 0%, #f8fafc 45%, #ffffff 100%)',
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="subtitle1" sx={{ ml: 2 }}>
          Chargement des fournisseurs...
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
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
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
              <Business sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={950}>
                Gestion des fournisseurs
              </Typography>

              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.85rem' }}>
                Réseau fournisseurs, contacts et partenaires commerciaux
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreateFournisseur}
            sx={{
              px: 2.2,
              py: 1,
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 900,
              bgcolor: '#fff',
              color: '#1d4ed8',
            }}
          >
            Ajouter un fournisseur
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
                border: `1px solid ${alpha(stat.color, 0.18)}`,
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

      <Card sx={{ mb: 2, borderRadius: 3 }}>
        <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              label="Rechercher un fournisseur"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={() => setSearchTerm('')}
              sx={{
                borderRadius: 2.5,
                px: 2,
                height: 40,
                textTransform: 'none',
                fontWeight: 800,
              }}
            >
              Effacer
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 'calc(100vh - 330px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Nom société</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Localité</TableCell>
                <TableCell>Date entrée</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredFournisseurs.map((fournisseur) => (
                <TableRow key={fournisseur.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                      <Avatar sx={{ width: 26, height: 26, fontSize: '0.68rem' }}>
                        {fournisseur.code?.slice(-2) || 'FR'}
                      </Avatar>

                      <Typography fontWeight={900} fontSize="0.82rem">
                        {fournisseur.code || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={900} fontSize="0.84rem">
                      {fournisseur.nom || `Fournisseur ${fournisseur.code}`}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <LocationOn fontSize="small" color="primary" />

                      <Box>
                        <Typography variant="body2" fontSize="0.8rem">
                          {fournisseur.adresse || '-'}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {fournisseur.codePostal || '-'} {fournisseur.ville || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <Phone fontSize="small" color="primary" />
                      <Typography variant="body2" fontSize="0.8rem">
                        {fournisseur.telephone || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <Email fontSize="small" color="primary" />
                      <Typography variant="body2" fontSize="0.8rem">
                        {fournisseur.email || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={`${fournisseur.ville || '-'} ${fournisseur.pays ? `(${fournisseur.pays})` : ''}`}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <CalendarToday fontSize="small" color="primary" />
                      <Typography variant="body2" fontSize="0.8rem">
                        {fournisseur.dateCreation || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.7}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => handleEditFournisseur(fournisseur)}>
                          <EditIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={() => handleDeleteFournisseur(fournisseur)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {filteredFournisseurs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucun fournisseur trouvé</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: isDarkMode ? '#0f172a' : '#ffffff',
          },
        }}
      >
        <DialogTitle
          sx={{
            py: 1.7,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            color: 'white',
            fontWeight: 900,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1" fontWeight={900}>
            {editMode ? 'Modifier un fournisseur' : 'Ajouter un nouveau fournisseur'}
          </Typography>

          <IconButton onClick={handleDialogClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.2 }}>
          <Grid container spacing={1.7} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Nom de la société *"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Pays"
                name="pays"
                value={formData.pays}
                onChange={handleInputChange}
                select
              >
                {COUNTRY_PHONE_RULES.map((country) => (
                  <MenuItem key={country.code} value={country.pays}>
                    {country.pays} ({country.indicatif})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Téléphone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder={`${selectedCountry?.indicatif || '+32'}...`}
                error={!!formData.telephone && !isValidPhone(formData.telephone, formData.pays)}
                helperText={
                  formData.telephone && !isValidPhone(formData.telephone, formData.pays)
                    ? `${formData.pays} : ${selectedCountry?.indicatif} + ${selectedCountry?.digits} chiffres`
                    : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {selectedCountry?.indicatif || '+32'}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                error={!!formData.email && !isValidEmail(formData.email)}
                helperText={formData.email && !isValidEmail(formData.email) ? 'Adresse email invalide' : ''}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Code postal"
                name="codePostal"
                value={formData.codePostal}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Ville"
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Statut"
                name="statut"
                value={formData.statut}
                onChange={handleInputChange}
                select
              >
                <MenuItem value="Actif">Actif</MenuItem>
                <MenuItem value="Inactif">Inactif</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose} variant="outlined" sx={{ borderRadius: 2.5 }}>
            Annuler
          </Button>

          <Button
            onClick={editMode ? handleUpdateFournisseur : handleSubmit}
            variant="contained"
            startIcon={<Save />}
            sx={{ borderRadius: 2.5, fontWeight: 900 }}
          >
            {editMode ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      <PermissionAlert message={alert.message} open={alert.open} onClose={closeAlert} />
    </Box>
  );
};

export { Fournisseurs };
export default Fournisseurs;
