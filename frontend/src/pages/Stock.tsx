import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Pagination,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Refresh, Search, Remove, GetApp } from '@mui/icons-material';
import api from '../services/api';

interface Stock {
  id: number;
  magasin_id: number;
  article_id: number;
  quantite_stock: number | string;
  seuil_min: number | string | null;
  seuil_max: number | string | null;
  magasin_nom: string;
  article_libelle: string;
  article_code_barres: string;
  prix_vente_ht: number | string;
  niveau_alerte: string;
}

interface Magasin {
  id: number;
  nom_magasin?: string;
  Nom_Magasin?: string;
  nom?: string;
}

interface StatistiquesData {
  total_articles: number;
  alertes_critiques: number;
  alertes_faibles: number;
  stocks_normaux: number;
  stocks_excessifs: number;
  quantite_totale: number;
  valeur_totale_ht: number;
}

const normalizeAlert = (niveau?: string) => {
  const value = String(niveau || 'normal').toLowerCase();

  if (value === 'critique') return 'critique';
  if (value === 'faible' || value === 'bas') return 'bas';
  if (value === 'excessif') return 'excessif';
  return 'normal';
};

const getAlertLabel = (niveau?: string) => {
  const value = normalizeAlert(niveau);

  if (value === 'critique') return 'CRITIQUE';
  if (value === 'bas') return 'FAIBLE';
  if (value === 'excessif') return 'EXCESSIF';
  return 'NORMAL';
};

const getAlertColor = (niveau?: string) => {
  const value = normalizeAlert(niveau);

  if (value === 'critique') return 'error';
  if (value === 'bas') return 'warning';
  if (value === 'excessif') return 'info';
  return 'success';
};

const toNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const Stock: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [magasinFilter, setMagasinFilter] = useState('');
  const [alertFilter, setAlertFilter] = useState('');
  const [showOnlyWithStock, setShowOnlyWithStock] = useState(false);

  const [sortieModalOpen, setSortieModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantiteSortie, setQuantiteSortie] = useState('');
  const [raisonSortie, setRaisonSortie] = useState('');
  const [referenceSortie, setReferenceSortie] = useState('');
  const [loadingSortie, setLoadingSortie] = useState(false);

  const [page, setPage] = useState(1);
  const rowsPerPage = 50;
  const [totalRows, setTotalRows] = useState(0);

  const fetchMagasins = async () => {
    try {
      const response = await api.get('/magasins');
      setMagasins(response.data.data || response.data || []);
    } catch (err: any) {
      console.error('Erreur magasins:', err);
    }
  };

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (magasinFilter) params.append('magasinId', magasinFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (showOnlyWithStock) params.append('withStockOnly', 'true');
      if (alertFilter) params.append('alert', alertFilter.toLowerCase());
      params.append('page', String(page));
      params.append('limit', String(rowsPerPage));

      const response = await api.get(`/stock-magasin?${params.toString()}`);
      setStocks(response.data.data || []);
      setTotalRows(response.data.total ?? 0);
    } catch (err: any) {
      console.error('Erreur stocks:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des stocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMagasins();
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [magasinFilter, searchTerm, showOnlyWithStock, alertFilter, page]);

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  const statistiques: StatistiquesData = useMemo(() => {
    return stocks.reduce(
      (acc, stock) => {
        const quantite = toNumber(stock.quantite_stock);
        const prix = toNumber(stock.prix_vente_ht);
        const alerte = normalizeAlert(stock.niveau_alerte);

        acc.total_articles += 1;
        acc.quantite_totale += quantite;
        acc.valeur_totale_ht += quantite * prix;

        if (alerte === 'critique') acc.alertes_critiques += 1;
        else if (alerte === 'bas') acc.alertes_faibles += 1;
        else if (alerte === 'excessif') acc.stocks_excessifs += 1;
        else acc.stocks_normaux += 1;

        return acc;
      },
      {
        total_articles: 0,
        alertes_critiques: 0,
        alertes_faibles: 0,
        stocks_normaux: 0,
        stocks_excessifs: 0,
        quantite_totale: 0,
        valeur_totale_ht: 0,
      }
    );
  }, [stocks]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRefresh = () => {
    fetchMagasins();
    fetchStocks();
  };

  const handleResetFilters = () => {
    setMagasinFilter('');
    setSearchTerm('');
    setAlertFilter('');
    setShowOnlyWithStock(false);
    setPage(1);
  };

  const handleExportCSV = () => {
    if (stocks.length === 0) return;

    const headers = [
      'Magasin',
      'Article',
      'Code Barres',
      'Quantité',
      'Prix HT',
      'Valeur Stock HT',
      'Seuil Min',
      'Seuil Max',
      'Alerte',
    ];

    const rows = stocks.map((stock) => {
      const quantite = toNumber(stock.quantite_stock);
      const prix = toNumber(stock.prix_vente_ht);
      const valeur = (quantite * prix).toFixed(2);

      return [
        stock.magasin_nom || '-',
        stock.article_libelle || '-',
        stock.article_code_barres || '-',
        String(quantite),
        prix.toFixed(2),
        valeur,
        String(stock.seuil_min ?? ''),
        String(stock.seuil_max ?? ''),
        getAlertLabel(stock.niveau_alerte),
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stocks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenSortieModal = (stock: Stock) => {
    setSelectedStock(stock);
    setQuantiteSortie('1');
    setRaisonSortie('');
    setReferenceSortie('');
    setSortieModalOpen(true);
  };

  const handleCloseSortieModal = () => {
    setSortieModalOpen(false);
    setSelectedStock(null);
    setQuantiteSortie('');
    setRaisonSortie('');
    setReferenceSortie('');
  };

  const handleSortieStock = async () => {
    if (!selectedStock || !quantiteSortie || toNumber(quantiteSortie) <= 0) {
      setError('Veuillez indiquer une quantité correcte');
      return;
    }

    const quantite = toNumber(quantiteSortie);
    const quantiteDisponible = toNumber(selectedStock.quantite_stock);

    if (quantite > quantiteDisponible) {
      setError(`Impossible de sortir ${quantite} unités. Stock disponible : ${quantiteDisponible} unités`);
      return;
    }

    try {
      setLoadingSortie(true);
      setError(null);

      // Route existante dans ton backend pour les mouvements.
      // Si elle n'existe pas encore, remplace cette partie par un simple PUT /stock-magasin/:id.
      try {
        await api.post('/mouvements-stock/sortie', {
          stock_id: selectedStock.id,
          quantite,
          raison: raisonSortie || 'Sortie manuelle',
          reference_document: referenceSortie,
        });
      } catch {
        await api.put(`/stock-magasin/${selectedStock.id}`, {
          quantite_stock: quantiteDisponible - quantite,
        });
      }

      setStocks((previousStocks) =>
        previousStocks.map((stock) =>
          stock.id === selectedStock.id
            ? { ...stock, quantite_stock: quantiteDisponible - quantite }
            : stock
        )
      );

      handleCloseSortieModal();
      await fetchStocks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sortie du stock');
    } finally {
      setLoadingSortie(false);
    }
  };

  if (loading && stocks.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des stocks...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h4">Gestion des Stocks</Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={loading}>
            Actualiser
          </Button>
          <Button variant="outlined" onClick={handleResetFilters} disabled={loading}>
            Réinitialiser les filtres
          </Button>
          <Button
            variant="contained"
            startIcon={<GetApp />}
            onClick={handleExportCSV}
            disabled={stocks.length === 0}
          >
            Exporter CSV
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total lignes stock</Typography>
              <Typography variant="h5">{statistiques.total_articles}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'error.main' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Alertes critiques</Typography>
              <Typography variant="h5" color="error">{statistiques.alertes_critiques}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Alertes faibles</Typography>
              <Typography variant="h5" color="warning.main">{statistiques.alertes_faibles}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'success.main' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Valeur stock HT</Typography>
              <Typography variant="h5">{statistiques.valeur_totale_ht.toFixed(2)} €</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Magasin</InputLabel>
                <Select
                  value={magasinFilter}
                  label="Magasin"
                  onChange={(e) => {
                    setMagasinFilter(String(e.target.value));
                    setPage(1);
                  }}
                >
                  <MenuItem value="">Tous les magasins</MenuItem>
                  {magasins.map((magasin) => (
                    <MenuItem key={magasin.id} value={String(magasin.id)}>
                      {magasin.nom_magasin || magasin.Nom_Magasin || magasin.nom || `Magasin ${magasin.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Rechercher un article"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Niveau d'alerte</InputLabel>
                <Select
                  value={alertFilter}
                  label="Niveau d'alerte"
                  onChange={(e) => {
                    setAlertFilter(String(e.target.value));
                    setPage(1);
                  }}
                >
                  <MenuItem value="">Tous les niveaux</MenuItem>
                  <MenuItem value="critique">CRITIQUE</MenuItem>
                  <MenuItem value="bas">FAIBLE</MenuItem>
                  <MenuItem value="excessif">EXCESSIF</MenuItem>
                  <MenuItem value="normal">NORMAL</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOnlyWithStock}
                    onChange={(e) => {
                      setShowOnlyWithStock(e.target.checked);
                      setPage(1);
                    }}
                    color="primary"
                  />
                }
                label="Stock > 0"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Magasin</TableCell>
                  <TableCell>Article</TableCell>
                  <TableCell>Code-barres</TableCell>
                  <TableCell align="right">Quantité</TableCell>
                  <TableCell align="right">Prix HT</TableCell>
                  <TableCell align="right">Valeur stock HT</TableCell>
                  <TableCell align="right">Seuil min</TableCell>
                  <TableCell align="right">Seuil max</TableCell>
                  <TableCell align="center">Alerte</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {stocks.map((stock) => {
                  const quantite = toNumber(stock.quantite_stock);
                  const prix = toNumber(stock.prix_vente_ht);
                  const valeurStock = (quantite * prix).toFixed(2);

                  return (
                    <TableRow
                      key={stock.id}
                      hover
                      sx={{
                        backgroundColor:
                          normalizeAlert(stock.niveau_alerte) === 'critique'
                            ? 'rgba(255, 0, 0, 0.06)'
                            : normalizeAlert(stock.niveau_alerte) === 'bas'
                              ? 'rgba(255, 152, 0, 0.06)'
                              : 'inherit',
                      }}
                    >
                      <TableCell>{stock.magasin_nom || '-'}</TableCell>
                      <TableCell>{stock.article_libelle || '-'}</TableCell>
                      <TableCell>{stock.article_code_barres || '-'}</TableCell>
                      <TableCell align="right">{quantite}</TableCell>
                      <TableCell align="right">{prix.toFixed(2)} €</TableCell>
                      <TableCell align="right">{valeurStock} €</TableCell>
                      <TableCell align="right">{stock.seuil_min ?? '-'}</TableCell>
                      <TableCell align="right">{stock.seuil_max ?? '-'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getAlertLabel(stock.niveau_alerte)}
                          color={getAlertColor(stock.niveau_alerte) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Remove />}
                          onClick={() => handleOpenSortieModal(stock)}
                          disabled={quantite <= 0}
                          color="warning"
                        >
                          Sortir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {stocks.length === 0 && !loading && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography>Aucun stock trouvé avec ces filtres.</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={sortieModalOpen} onClose={handleCloseSortieModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Remove color="warning" />
            <Typography variant="h6">Sortir du stock</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedStock && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Article : <strong>{selectedStock.article_libelle}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Magasin : <strong>{selectedStock.magasin_nom}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Stock disponible : <strong>{toNumber(selectedStock.quantite_stock)} unités</strong>
              </Typography>

              <TextField
                fullWidth
                margin="normal"
                label="Quantité à sortir"
                type="number"
                value={quantiteSortie}
                onChange={(e) => setQuantiteSortie(e.target.value)}
                inputProps={{ min: 1, max: toNumber(selectedStock.quantite_stock) }}
                helperText={`Maximum : ${toNumber(selectedStock.quantite_stock)} unités`}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Raison de la sortie"
                multiline
                rows={3}
                value={raisonSortie}
                onChange={(e) => setRaisonSortie(e.target.value)}
                placeholder="Ex : Vente client, casse, correction stock..."
              />

              <TextField
                fullWidth
                margin="normal"
                label="Référence optionnelle"
                value={referenceSortie}
                onChange={(e) => setReferenceSortie(e.target.value)}
                placeholder="Ex : Facture #123, Bon de sortie #456"
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseSortieModal} disabled={loadingSortie}>
            Annuler
          </Button>
          <Button
            onClick={handleSortieStock}
            variant="contained"
            color="warning"
            disabled={loadingSortie || !quantiteSortie || toNumber(quantiteSortie) <= 0}
            startIcon={loadingSortie ? <CircularProgress size={20} /> : <Remove />}
          >
            {loadingSortie ? 'Traitement...' : 'Sortir du stock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Stock;
