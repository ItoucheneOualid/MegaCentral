import React, { useState, useEffect } from 'react';
import {
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
  Snackbar,
  Grid,
  MenuItem,
  Avatar,
  Chip,
  InputAdornment,
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
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';
import { PermissionAlert, usePermissionAlert } from '../components/PermissionAlert';

// Interface basée sur les vraies colonnes de la table fournis
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

const Fournisseurs: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { user } = useAuth(); // Ajouter user pour les vérifications de permissions
  
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { alert, showPermissionAlert, closeAlert } = usePermissionAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    ville: '',
    codePostal: '',
    pays: '',
    statut: 'Actif',
  });
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      console.log('🔍 Début de la récupération des fournisseurs...');
      
      // Utiliser l'API avec authentification
      const response = await api.get('/fournisseurs');
      
      console.log('✅ Réponse de l\'API:', response);
      
      const fournisseursData = response.data || [];
      
      console.log('📊 Données finales à afficher:', fournisseursData);
      console.log('📊 Nombre final:', fournisseursData.length);
      
      setFournisseurs(fournisseursData);
      setError(null);
      
      console.log('✅ Fournisseurs chargés avec succès');
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des fournisseurs:', err);
      
      // Afficher une alerte temporaire pour les permissions refusées
      if (err.response?.status === 403 && err.response?.data?.message) {
        showPermissionAlert(err.response.data.message);
      } else {
        // Afficher l'erreur normale pour les autres cas
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Erreur lors du chargement des fournisseurs');
        }
      }
      setFournisseurs([]); // Vide si erreur
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredFournisseurs = (fournisseurs || []).filter(
    (fournisseur) => {
      const searchLower = searchTerm.toLowerCase();
      return !searchTerm || 
        fournisseur.nom?.toLowerCase().includes(searchLower) ||
        fournisseur.code?.toLowerCase().includes(searchLower) ||
        fournisseur.email?.toLowerCase().includes(searchLower);
    }
  );

  console.log('📊 filteredFournisseurs.length:', filteredFournisseurs.length);
  console.log('📊 searchTerm:', searchTerm);
  console.log('📊 Total fournisseurs:', fournisseurs.length);
  console.log('📊 Fournisseurs filtrés:', filteredFournisseurs.map(f => ({ 
    id: f.id, 
    code: f.code, 
    nom: f.nom || `Fournisseur ${f.code}`,
    a_vide: !f.nom 
  })));

  const handleExportCSV = async () => {
    try {
      // Utiliser l'API avec authentification pour exporter les fournisseurs
      const response = await api.get('/fournisseurs/export/csv', {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fournisseurs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Export CSV des fournisseurs téléchargé avec succès');
    } catch (err: any) {
      console.error('Erreur lors de l\'export CSV:', err);
      
      // Afficher une alerte temporaire pour les permissions refusées
      if (err.response?.status === 403 && err.response?.data?.message) {
        showPermissionAlert(err.response.data.message);
      } else {
        // Afficher l'erreur normale pour les autres cas
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Erreur lors de l\'export CSV des fournisseurs');
        }
      }
    }
  };

  // Gestion du formulaire d'ajout
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateFournisseurCode = () => {
    // Générer un code unique basé sur la date et un compteur
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FRN${year}${month}${day}${random}`;
  };

  const handleSubmit = async () => {
    try {
      // Validation basique
      if (!formData.nom) {
        setError('Le nom du fournisseur est obligatoire');
        return;
      }

      // Générer automatiquement le code fournisseur
      const autoCode = generateFournisseurCode();

      // Créer le nouveau fournisseur
      const newFournisseur = {
        ...formData,
        code: autoCode, // Code généré automatiquement
        dateCreation: new Date().toLocaleDateString('fr-FR')
      };

      console.log('📋 Nouveau fournisseur à ajouter:', newFournisseur);

      // Appeler l'API pour ajouter le fournisseur
      await api.post('/fournisseurs', newFournisseur);
      
      // Rafraîchir la liste
      await fetchFournisseurs();
      
      // Fermer le dialog et réinitialiser le formulaire
      setOpenDialog(false);
      setFormData({
        code: '',
        nom: '',
        adresse: '',
        telephone: '',
        email: '',
        ville: '',
        codePostal: '',
        pays: '',
        statut: 'Actif',
      });
      
      setError(null);
      console.log('✅ Fournisseur ajouté avec succès avec le code:', autoCode);
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du fournisseur:', err);
      
      // Afficher une alerte temporaire pour les permissions refusées
      if (err.response?.status === 403 && err.response?.data?.message) {
        showPermissionAlert(err.response.data.message);
      } else {
        // Afficher l'erreur normale pour les autres cas
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Erreur lors de l\'ajout du fournisseur');
        }
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditMode(false);
    setFormData({
      code: '',
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      ville: '',
      codePostal: '',
      pays: '',
      statut: 'Actif',
    });
  };

  // Optimisation : Vérifier les permissions AVANT d'ouvrir le formulaire de création
  const handleCreateFournisseur = () => {
    // Vérifier les permissions AVANT d'ouvrir le formulaire
    if (!user || user.role !== 'admin') {
      showPermissionAlert("🚫 Création de fournisseur non autorisée\n\nLes utilisateurs standards peuvent uniquement consulter les fournisseurs.\n\nContactez votre administrateur pour obtenir les permissions nécessaires.");
      return; // Arrêter ici si pas admin
    }
    
    // Si admin, continuer normalement
    setOpenDialog(true);
  };

  // Corriger le problème de statut (actif vs Actif)
  const handleEditFournisseur = (fournisseur: Fournisseur) => {
    // Vérifier les permissions AVANT d'ouvrir le formulaire
    if (!user || user.role !== 'admin') {
      showPermissionAlert("🚫 Modification de fournisseur non autorisée\n\nLes utilisateurs standards ont un accès en lecture seule aux fournisseurs.\n\nPour pouvoir modifier des fournisseurs, demandez une élévation de permissions.");
      return; // Arrêter ici si pas admin
    }
    
    // Si admin, continuer normalement
    setSelectedFournisseur(fournisseur);
    setFormData({
      code: fournisseur.code || '',
      nom: fournisseur.nom || '',
      adresse: fournisseur.adresse || '',
      telephone: fournisseur.telephone || '',
      email: fournisseur.email || '',
      ville: fournisseur.ville || '',
      codePostal: fournisseur.codePostal || '',
      pays: fournisseur.pays || '',
      statut: fournisseur.statut === 'actif' ? 'Actif' : (fournisseur.statut === 'inactif' ? 'Inactif' : 'En attente'),
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  // Mettre à jour un fournisseur
  const handleUpdateFournisseur = async () => {
    try {
      if (!selectedFournisseur || !formData.nom) {
        setError('Le nom du fournisseur est obligatoire');
        return;
      }

      const updatedFournisseur = {
        ...formData,
        id: selectedFournisseur.id
      };

      console.log('📋 Fournisseur à mettre à jour:', updatedFournisseur);

      // Appel à l'API avec authentification
      await api.put(`/fournisseurs/${selectedFournisseur.id}`, updatedFournisseur);
      
      console.log('✅ Fournisseur mis à jour');
      
      // Rafraîchir la liste
      await fetchFournisseurs();
      
      // Fermer le dialog et réinitialiser
      handleDialogClose();
      
      setError(null);
      console.log('✅ Fournisseur mis à jour avec succès');
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du fournisseur:', err);
      
      // Afficher une alerte temporaire pour les permissions refusées
      if (err.response?.status === 403 && err.response?.data?.message) {
        showPermissionAlert(err.response.data.message);
      } else {
        // Afficher l'erreur normale pour les autres cas
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Erreur lors de la mise à jour du fournisseur');
        }
      }
    }
  };

  // Optimisation : Vérifier les permissions AVANT la suppression
  const handleDeleteFournisseur = async (fournisseur: Fournisseur) => {
    // Vérifier les permissions AVANT la confirmation
    if (!user || user.role !== 'admin') {
      showPermissionAlert("🚫 Suppression de fournisseur non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.");
      return; // Arrêter ici si pas admin
    }
    
    // Si admin, continuer avec la confirmation
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${fournisseur.nom}" ?`)) {
      try {
        console.log('🗑️ Suppression du fournisseur:', fournisseur.id);
        
        // Appel à l'API avec authentification
        await api.delete(`/fournisseurs/${fournisseur.id}`);
        
        console.log('✅ Fournisseur supprimé');
        
        // Rafraîchir la liste
        await fetchFournisseurs();
        
        setError(null);
        console.log('✅ Fournisseur supprimé avec succès');
      } catch (err: any) {
        console.error('Erreur lors de la suppression du fournisseur:', err);
        
        // Afficher une alerte temporaire pour les permissions refusées
        if (err.response?.status === 403 && err.response?.data?.message) {
          showPermissionAlert(err.response.data.message);
        } else {
          // Afficher l'erreur normale pour les autres cas
          if (err.response?.data?.message) {
            setError(err.response.data.message);
          } else {
            setError('Erreur lors de la suppression du fournisseur');
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement des fournisseurs...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={fetchFournisseurs}
          sx={{ mb: 2 }}
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header simple et lisible */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          mb: 1,
          color: 'text.primary'
        }}>
          Gestion des Fournisseurs
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          Gérez votre réseau de fournisseurs et partenaires commerciaux
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip 
            label={`${filteredFournisseurs.length} fournisseur${filteredFournisseurs.length !== 1 ? 's' : ''}`}
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* Section recherche simple */}
      <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              alignItems: 'center', 
              mb: 3
            }}>
            <TextField
              label="Rechercher un fournisseur"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ minWidth: 300, flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              onClick={() => setSearchTerm('')}
            >
              Effacer
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateFournisseur}
            >
              Ajouter un fournisseur
            </Button>
          </Box>
        </Paper>

      {/* Tableau simple des fournisseurs */}
      <Paper sx={{ mb: 3, p: 2 }}>
          <TableContainer component={Paper} sx={{ 
            background: 'transparent',
            boxShadow: 'none',
            border: '1px solid #e9ecef',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <Table>
              <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nom Société</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Adresse</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Téléphone</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Localité</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date Entrée</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFournisseurs.map((fournisseur, index) => (
                  <TableRow 
                    key={fournisseur.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        transition: 'background-color 0.2s ease'
                      }
                    }}
                  >
                    <TableCell sx={{ 
                      fontWeight: 'bold',
                      py: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.75rem'
                          }}
                        >
                          {fournisseur.code?.slice(-2) || 'FR'}
                        </Avatar>
                        {fournisseur.code || '-'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {fournisseur.nom || `Fournisseur ${fournisseur.code}`}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" />
                        <Box>
                          <Typography variant="body2">{fournisseur.adresse || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fournisseur.codePostal || '-'} {fournisseur.ville || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" />
                        <Typography variant="body2">{fournisseur.telephone || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" />
                        <Typography variant="body2">{fournisseur.email || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={`${fournisseur.ville || '-'} ${fournisseur.pays ? `(${fournisseur.pays})` : ''}`}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" />
                        <Typography variant="body2">{fournisseur.dateCreation || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Modifier">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditFournisseur(fournisseur)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteFournisseur(fournisseur)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      </Paper>

      {/* Footer simple */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {filteredFournisseurs.length} fournisseur{filteredFournisseurs.length !== 1 ? 's' : ''} trouvé{filteredFournisseurs.length !== 1 ? 's' : ''}
        </Typography>
      </Paper>

      {/* Dialog d'ajout de fournisseur */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {editMode ? 'Modifier un fournisseur' : 'Ajouter un nouveau fournisseur'}
          <IconButton onClick={handleDialogClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          bgcolor: '#ffffff',
          p: 3
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de la société *"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'text.primary'
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: isDarkMode ? '#ffffff' : '#212121'
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? '#b0b0b0' : '#757575'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: isDarkMode ? '#ffffff' : '#212121'
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? '#b0b0b0' : '#757575'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                type="email"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: isDarkMode ? '#ffffff' : '#212121'
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? '#b0b0b0' : '#757575'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Code Postal"
                name="codePostal"
                value={formData.codePostal}
                onChange={handleInputChange}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: isDarkMode ? '#ffffff' : '#212121'
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? '#b0b0b0' : '#757575'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Ville"
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: isDarkMode ? '#ffffff' : '#212121'
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? '#b0b0b0' : '#757575'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pays"
                name="pays"
                value={formData.pays}
                onChange={handleInputChange}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: isDarkMode ? '#ffffff' : '#212121'
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? '#b0b0b0' : '#757575'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Statut"
                name="statut"
                value={formData.statut}
                onChange={handleInputChange}
                variant="outlined"
                select
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: isDarkMode ? '#ffffff' : '#212121'
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? '#b0b0b0' : '#757575'
                  }
                }}
              >
                <MenuItem value="Actif">Actif</MenuItem>
                <MenuItem value="Inactif">Inactif</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3
        }}>
          <Button onClick={handleDialogClose} variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>
            Annuler
          </Button>
          <Button 
            onClick={editMode ? handleUpdateFournisseur : handleSubmit} 
            variant="contained" 
            startIcon={<Save />}
          >
            {editMode ? 'Mettre à jour' : 'Enregistrer le fournisseur'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alertes de permission non bloquantes */}
      <PermissionAlert
        message={alert.message}
        open={alert.open}
        onClose={closeAlert}
      />
    </Box>
  );
};

export { Fournisseurs };
