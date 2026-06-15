import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  Cancel,
  CheckCircle,
  Delete,
  Edit,
  GetApp,
  LocalShipping,
  Search,
  Visibility,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/commandes';

interface Fournisseur {
  id: number;
  code: string;
  nom: string;
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

const Commandes: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [articles, setArticles] = useState<ArticleOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [openDetails, setOpenDetails] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [editingCommandeId, setEditingCommandeId] = useState<string | number | null>(null);

  const [form, setForm] = useState({
    idFournisseur: '',
    dateCommande: new Date().toISOString().split('T')[0],
    dateLivraisonPrevue: '',
    notes: '',
    statut: 'N',
  });

  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [lignes, setLignes] = useState<LigneCommande[]>([]);

  const livraisonAvantCommande =
    !!form.dateLivraisonPrevue &&
    !!form.dateCommande &&
    form.dateLivraisonPrevue < form.dateCommande;

  useEffect(() => {
    fetchCommandes();
    fetchFournisseurs();
    fetchArticles();
  }, []);

  const formatDate = (date: string) => {
    if (!date) return '';
    return String(date).split('T')[0];
  };

  const formatEuro = (value: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(value || 0));

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);

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
    const response = await axios.get(`${API_URL}/fournisseurs`);
    setFournisseurs(response.data.data || []);
  };

  const fetchArticles = async () => {
    const response = await axios.get(`${API_URL}/articles`);
    setArticles(response.data.data || []);
  };

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
    const montantHT = lignes.reduce((sum, l) => sum + l.totalHT, 0);
    const montantTTC = lignes.reduce((sum, l) => sum + l.totalTTC, 0);
    const montantTVA = montantTTC - montantHT;

    return { montantHT, montantTVA, montantTTC };
  }, [lignes]);

  const resetForm = () => {
    setForm({
      idFournisseur: '',
      dateCommande: new Date().toISOString().split('T')[0],
      dateLivraisonPrevue: '',
      notes: '',
      statut: 'N',
    });
    setSelectedArticleId('');
    setQuantite(1);
    setLignes([]);
    setEditingCommandeId(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpenForm(true);
  };

  const openEditDialog = (commande: Commande) => {
    if (commande.statut === 'R') {
      setError('Une commande réceptionnée ne peut plus être modifiée.');
      return;
    }

    setEditingCommandeId(commande.id);
    setForm({
      idFournisseur: String(commande.idFournisseur || ''),
      dateCommande: commande.dateCommande,
      dateLivraisonPrevue: commande.dateLivraisonPrevue || '',
      notes: commande.notes || '',
      statut: commande.statut || 'N',
    });
    setLignes(commande.lignes || []);
    setOpenForm(true);
  };

  const handleAddLigne = () => {
    const article = articles.find((a) => String(a.id) === String(selectedArticleId));

    if (!article) {
      setError('Veuillez sélectionner un article');
      return;
    }

    if (!quantite || quantite <= 0) {
      setError('La quantité doit être supérieure à 0');
      return;
    }

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
    };

    setLignes((prev) => [...prev, newLine]);
    setSelectedArticleId('');
    setQuantite(1);
    setError('');
  };

  const handleRemoveLigne = (id: string | number) => {
    setLignes((prev) => prev.filter((ligne) => ligne.id !== id));
  };

  const buildPayload = () => {
    const fournisseur = fournisseurs.find((f) => String(f.id) === String(form.idFournisseur));

    if (!fournisseur) {
      throw new Error('Veuillez sélectionner un fournisseur');
    }

    if (lignes.length === 0) {
      throw new Error('Veuillez ajouter au moins un article à la commande');
    }

    if (livraisonAvantCommande) {
      throw new Error(
        'La date de livraison prévue ne peut pas être antérieure à la date de commande.'
      );
    }

    return {
      idFournisseur: fournisseur.id,
      fournisseurCode: fournisseur.code,
      nomFournisseur: fournisseur.nom,
      dateCommande: form.dateCommande,
      dateLivraisonPrevue: form.dateLivraisonPrevue || null,
      statut: form.statut,
      notes: form.notes,
      lignes: lignes.map((ligne) => ({
        idArticle: ligne.idArticle,
        designation: ligne.designation,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        tauxTVA: ligne.tauxTVA || 21,
      })),
    };
  };

  const handleSaveCommande = async () => {
    try {
      setSaving(true);
      setError('');

      if (livraisonAvantCommande) {
        setError(
          'La date de livraison prévue ne peut pas être antérieure à la date de commande.'
        );
        return;
      }

      const payload = buildPayload();

      if (editingCommandeId) {
        await axios.put(`${API_URL}/${editingCommandeId}`, payload);
      } else {
        await axios.post(API_URL, payload);
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
    try {
      await axios.patch(`${API_URL}/${commande.id}/statut`, { statut });
      await fetchCommandes();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la modification du statut');
    }
  };

  const handleDeleteCommande = async (commande: Commande) => {
    if (!window.confirm(`Supprimer la commande ${commande.numero} ?`)) return;

    try {
      await axios.delete(`${API_URL}/${commande.id}`);
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

  const filteredCommandes = commandes.filter((commande) =>
    commande.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commande.nomFournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getStatutLabel(commande.statut).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Chargement des commandes...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" fontWeight="600">
            Gestion des Commandes Fournisseurs
          </Typography>
          <Typography color="text.secondary">
            Création, modification, suivi et réception des commandes fournisseurs
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<GetApp />} onClick={handleExportCSV}>
            Exporter CSV
          </Button>

          <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
            Ajouter commande
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Rechercher par numéro, fournisseur ou statut..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <TableContainer component={Paper}>
            <Table>
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
                  <TableRow key={commande.id}>
                    <TableCell>{commande.numero}</TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShipping fontSize="small" />
                        {commande.nomFournisseur}
                      </Box>
                    </TableCell>

                    <TableCell>{commande.dateCommande}</TableCell>
                    <TableCell>{commande.dateLivraisonPrevue || '-'}</TableCell>

                    <TableCell>
                      <Chip
                        label={getStatutLabel(commande.statut)}
                        color={getStatutColor(commande.statut) as any}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <strong>{formatEuro(commande.montantTTC)}</strong>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Voir détails">
                        <IconButton onClick={() => handleVoirDetails(commande)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Modifier">
                        <span>
                          <IconButton
                            color="primary"
                            onClick={() => openEditDialog(commande)}
                            disabled={commande.statut === 'R'}
                          >
                            <Edit />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Confirmer">
                        <IconButton color="info" onClick={() => updateStatut(commande, 'C')}>
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="En livraison">
                        <IconButton color="secondary" onClick={() => updateStatut(commande, 'L')}>
                          <LocalShipping />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Réceptionnée">
                        <IconButton color="success" onClick={() => updateStatut(commande, 'R')}>
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Annuler">
                        <IconButton color="warning" onClick={() => updateStatut(commande, 'A')}>
                          <Cancel />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Supprimer">
                        <IconButton color="error" onClick={() => handleDeleteCommande(commande)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredCommandes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la commande {selectedCommande?.numero}</DialogTitle>

        <DialogContent dividers>
          {selectedCommande && (
            <>
              <Typography><strong>Fournisseur :</strong> {selectedCommande.nomFournisseur}</Typography>
              <Typography><strong>Date commande :</strong> {selectedCommande.dateCommande}</Typography>
              <Typography><strong>Livraison prévue :</strong> {selectedCommande.dateLivraisonPrevue || '-'}</Typography>
              <Typography><strong>Statut :</strong> {getStatutLabel(selectedCommande.statut)}</Typography>
              <Typography><strong>Notes :</strong> {selectedCommande.notes || 'Aucune note'}</Typography>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Articles commandés
              </Typography>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Article</TableCell>
                      <TableCell align="right">Quantité</TableCell>
                      <TableCell align="right">Prix unitaire</TableCell>
                      <TableCell align="right">Total HT</TableCell>
                      <TableCell align="right">Total TTC</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedCommande.lignes.map((ligne) => (
                      <TableRow key={ligne.id}>
                        <TableCell>{ligne.designation}</TableCell>
                        <TableCell align="right">{ligne.quantite}</TableCell>
                        <TableCell align="right">{formatEuro(ligne.prixUnitaire)}</TableCell>
                        <TableCell align="right">{formatEuro(ligne.totalHT)}</TableCell>
                        <TableCell align="right">{formatEuro(ligne.totalTTC)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Typography>Total HT : {formatEuro(selectedCommande.montantHT)}</Typography>
                <Typography>TVA : {formatEuro(selectedCommande.montantTVA)}</Typography>
                <Typography variant="h6">
                  Total TTC : {formatEuro(selectedCommande.montantTTC)}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCommandeId ? 'Modifier la commande fournisseur' : 'Nouvelle commande fournisseur'}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
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

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date commande"
                value={form.dateCommande}
                onChange={(e) => {
                  const newDateCommande = e.target.value;

                  setForm((prev) => ({
                    ...prev,
                    dateCommande: newDateCommande,
                    dateLivraisonPrevue:
                      prev.dateLivraisonPrevue && prev.dateLivraisonPrevue < newDateCommande
                        ? ''
                        : prev.dateLivraisonPrevue,
                  }));
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Livraison prévue"
                value={form.dateLivraisonPrevue}
                onChange={(e) => setForm({ ...form, dateLivraisonPrevue: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: form.dateCommande,
                }}
                error={livraisonAvantCommande}
                helperText={
                  livraisonAvantCommande
                    ? 'La date de livraison doit être supérieure ou égale à la date de commande'
                    : ''
                }
              />
            </Grid>

            {livraisonAvantCommande && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  La date de livraison prévue ne peut pas être antérieure à la date de commande.
                </Alert>
              </Grid>
            )}

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  label="Statut"
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: String(e.target.value) })}
                >
                  <MenuItem value="N">En attente</MenuItem>
                  <MenuItem value="C">Confirmée</MenuItem>
                  <MenuItem value="L">En livraison</MenuItem>
                  <MenuItem value="R">Réceptionnée</MenuItem>
                  <MenuItem value="A">Annulée</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Articles de la commande
              </Typography>
            </Grid>

            <Grid item xs={12} md={7}>
              <FormControl fullWidth>
                <InputLabel>Article</InputLabel>
                <Select
                  label="Article"
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(String(e.target.value))}
                >
                  {articles.map((article) => (
                    <MenuItem key={article.id} value={String(article.id)}>
                      {article.libelle} — {formatEuro(article.prixAchatHT)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Quantité"
                value={quantite}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  if (value >= 0) {
                    setQuantite(value);
                  }
                }}
                inputProps={{
                  min: 0,
                  step: 1,
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" onClick={handleAddLigne} sx={{ height: '56px' }}>
                Ajouter
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TableContainer component={Paper}>
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
                        <TableCell>{ligne.designation}</TableCell>
                        <TableCell align="right">{ligne.quantite}</TableCell>
                        <TableCell align="right">{formatEuro(ligne.prixUnitaire)}</TableCell>
                        <TableCell align="right">{formatEuro(ligne.totalHT)}</TableCell>
                        <TableCell align="right">{formatEuro(ligne.totalTTC)}</TableCell>
                        <TableCell align="center">
                          <IconButton color="error" onClick={() => handleRemoveLigne(ligne.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {lignes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Aucun article ajouté
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Typography>Total HT : {formatEuro(totals.montantHT)}</Typography>
                <Typography>TVA : {formatEuro(totals.montantTVA)}</Typography>
                <Typography variant="h6">Total TTC : {formatEuro(totals.montantTTC)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSaveCommande}
            disabled={saving || livraisonAvantCommande}
          >
            {editingCommandeId ? 'Modifier la commande' : 'Enregistrer la commande'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export { Commandes };