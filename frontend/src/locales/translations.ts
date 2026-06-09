// Traductions pour l'application MEGA-Central
export interface Translations {
  // Navigation
  nav: {
    dashboard: string;
    tickets: string;
    articles: string;
    factures: string;
    familles: string;
    fournisseurs: string;
    commandes: string;
    accueil: string;
    deconnexion: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    chiffreAffaires: string;
    articles: string;
    transactions: string;
    magasins: string;
    caisse: string;
    periode: string;
    aujourdhui: string;
    ceMois: string;
    cetteAnnee: string;
  };

  // Tickets
  tickets: {
    title: string;
    recherchePlaceholder: string;
    exportExcel: string;
    numero: string;
    date: string;
    client: string;
    totalHT: string;
    totalTVA: string;
    totalTTC: string;
    etat: string;
    actions: string;
    voir: string;
    pdf: string;
    lignesParPage: string;
    sur: string;
    normal: string;
    nonSpecifie: string;
    ticketDetails: string;
    informationsGenerales: string;
    detailsMontants: string;
    totalBrut: string;
    remise: string;
    methodesPaiement: string;
    ticketNumero: string;
    heure: string;
    magasin: string;
    caisse: string;
    totalBrutLabel: string;
    totalHTLabel: string;
    totalTVALabel: string;
    totalTTCLabel: string;
    genereLe: string;
    a: string;
    systemeCentralisation: string;
    pdfGenere: string;
    pdfSauvegarde: string;
    pdfTelecharge: string;
    exportReussi: string;
    erreurChargement: string;
    erreurGeneration: string;
    erreurDetails: string;
    erreurExport: string;
  };

  // Messages
  messages: {
    ticketGenere: string;
    exportExcelReussi: string;
    erreur: string;
    chargement: string;
    pdfDisponible: string;
    pdfNonDisponible: string;
    pdfComplet: string;
    pdfBase: string;
    succes: string;
    erreurConnexion: string;
    donneesChargees: string;
  };

  // États
  etats: {
    normal: string;
    annule: string;
    rembourse: string;
    enCours: string;
    termine: string;
  };

  // Générique
  commun: {
    rechercher: string;
    filtrer: string;
    exporter: string;
    telecharger: string;
    generer: string;
    modifier: string;
    supprimer: string;
    valider: string;
    annuler: string;
    fermer: string;
    enregistrer: string;
    oui: string;
    non: string;
    confirmer: string;
    attention: string;
    information: string;
    erreur: string;
    succes: string;
    chargement: string;
    aucunResultat: string;
    pages: string;
    precedent: string;
    suivant: string;
    premier: string;
    dernier: string;
    actions: string;
    lignesParPage: string;
    sur: string;
  };

  // Articles
  articles: {
    title: string;
    recherchePlaceholder: string;
    code: string;
    codeBarres: string;
    libelle: string;
    famille: string;
    tva: string;
    prix: string;
    prixHT: string;
    prixTTC: string;
    statut: string;
    actif: string;
    suspendu: string;
    actualiser: string;
    trierParNom: string;
    trierParPrix: string;
    voirDetails: string;
    modifier: string;
    supprimer: string;
    totalArticles: string;
    pageActuelle: string;
    aucunArticle: string;
    erreurChargement: string;
    detailsArticle: string;
    informationsGenerales: string;
  };
}

// Traductions en français
export const fr: Translations = {
  nav: {
    dashboard: "Tableau de Bord",
    tickets: "Tickets de Caisse",
    articles: "Articles",
    factures: "Factures",
    familles: "Familles",
    fournisseurs: "Fournisseurs",
    commandes: "Commandes",
    accueil: "Accueil",
    deconnexion: "Déconnexion",
  },
  dashboard: {
    title: "Tableau de Bord - MEGA-Central",
    chiffreAffaires: "Chiffre d'Affaires",
    articles: "Articles",
    transactions: "Transactions",
    magasins: "Magasins",
    caisse: "Caisse",
    periode: "Période",
    aujourdhui: "Aujourd'hui",
    ceMois: "Ce Mois",
    cetteAnnee: "Cette Année",
  },
  tickets: {
    title: "Tickets de Caisse",
    recherchePlaceholder: "Rechercher par numéro, client ou date...",
    exportExcel: "Export Excel",
    numero: "Numéro",
    date: "Date",
    client: "Client",
    totalHT: "Total HT",
    totalTVA: "Total TVA",
    totalTTC: "Total TTC",
    etat: "État",
    actions: "Actions",
    voir: "Voir",
    pdf: "PDF",
    lignesParPage: "Lignes par page:",
    sur: "sur",
    normal: "Normal",
    nonSpecifie: "Non spécifié",
    ticketDetails: "Détails du Ticket",
    informationsGenerales: "Informations générales",
    detailsMontants: "Détails des montants",
    totalBrut: "Total Brut",
    remise: "Remise",
    methodesPaiement: "Méthodes de paiement",
    ticketNumero: "Ticket N°:",
    heure: "Heure",
    magasin: "Magasin",
    caisse: "Caisse",
    totalBrutLabel: "Total Brut:",
    totalHTLabel: "Total HT:",
    totalTVALabel: "Total TVA:",
    totalTTCLabel: "Total TTC:",
    genereLe: "Généré le:",
    a: "à",
    systemeCentralisation: "MEGA-Central - Système de Centralisation des Ventes",
    pdfGenere: "PDF généré et sauvegardé pour le ticket",
    pdfSauvegarde: "PDF sauvegardé en base",
    pdfTelecharge: "PDF complet téléchargé depuis la base de données",
    exportReussi: "Export Excel réussi",
    erreurChargement: "Erreur lors du chargement des tickets",
    erreurGeneration: "Erreur lors de la génération du PDF du ticket",
    erreurDetails: "Erreur lors du chargement des détails du ticket",
    erreurExport: "Erreur lors de l'export Excel",
  },
  messages: {
    ticketGenere: "✅ PDF généré et sauvegardé pour le ticket",
    exportExcelReussi: "✅ Export Excel réussi",
    erreur: "❌ Erreur",
    chargement: "Chargement...",
    pdfDisponible: "PDF disponible - Téléchargement direct",
    pdfNonDisponible: "Aucun PDF disponible pour ce ticket",
    pdfComplet: "PDF complet généré et sauvegardé",
    pdfBase: "PDF complet téléchargé depuis la base de données",
    succes: "Succès",
    erreurConnexion: "Erreur de connexion",
    donneesChargees: "Données chargées avec succès",
  },
  etats: {
    normal: "Normal",
    annule: "Annulé",
    rembourse: "Remboursé",
    enCours: "En cours",
    termine: "Terminé",
  },
  commun: {
    rechercher: "Rechercher",
    filtrer: "Filtrer",
    exporter: "Exporter",
    telecharger: "Télécharger",
    generer: "Générer",
    modifier: "Modifier",
    supprimer: "Supprimer",
    valider: "Valider",
    annuler: "Annuler",
    fermer: "Fermer",
    enregistrer: "Enregistrer",
    oui: "Oui",
    non: "Non",
    confirmer: "Confirmer",
    attention: "Attention",
    information: "Information",
    erreur: "Erreur",
    succes: "Succès",
    chargement: "Chargement",
    aucunResultat: "Aucun résultat trouvé",
    pages: "Pages",
    precedent: "Précédent",
    suivant: "Suivant",
    premier: "Premier",
    dernier: "Dernier",
    actions: "Actions",
    lignesParPage: "Lignes par page",
    sur: "sur",
  },
  articles: {
    title: "Articles",
    recherchePlaceholder: "Rechercher un article...",
    code: "Code",
    codeBarres: "Code barres",
    libelle: "Libellé",
    famille: "Famille",
    tva: "TVA",
    prix: "Prix",
    prixHT: "Prix HT",
    prixTTC: "Prix TTC",
    statut: "Statut",
    actif: "Actif",
    suspendu: "Suspendu",
    actualiser: "Actualiser",
    trierParNom: "Trier par nom",
    trierParPrix: "Trier par prix",
    voirDetails: "Voir",
    modifier: "Modifier",
    supprimer: "Supprimer",
    totalArticles: "Total articles",
    pageActuelle: "Page actuelle",
    aucunArticle: "Aucun article trouvé",
    erreurChargement: "Erreur lors du chargement des articles",
    detailsArticle: "Détails de l'article",
    informationsGenerales: "Informations générales",
  },
};

// Traductions en anglais
export const en: Translations = {
  nav: {
    dashboard: "Dashboard",
    tickets: "Tickets",
    articles: "Items",
    factures: "Invoices",
    familles: "Categories",
    fournisseurs: "Suppliers",
    commandes: "Orders",
    accueil: "Home",
    deconnexion: "Logout",
  },
  dashboard: {
    title: "Dashboard - MEGA-Central",
    chiffreAffaires: "Revenue",
    articles: "Items",
    transactions: "Transactions",
    magasins: "Stores",
    caisse: "Cash Register",
    periode: "Period",
    aujourdhui: "Today",
    ceMois: "This Month",
    cetteAnnee: "This Year",
  },
  tickets: {
    title: "Sales Tickets",
    recherchePlaceholder: "Search by number, customer or date...",
    exportExcel: "Export Excel",
    numero: "Number",
    date: "Date",
    client: "Customer",
    totalHT: "Net Total",
    totalTVA: "VAT",
    totalTTC: "Gross Total",
    etat: "Status",
    actions: "Actions",
    voir: "View",
    pdf: "PDF",
    lignesParPage: "Rows per page:",
    sur: "of",
    normal: "Normal",
    nonSpecifie: "Not specified",
    ticketDetails: "Ticket Details",
    informationsGenerales: "General Information",
    detailsMontants: "Amount Details",
    totalBrut: "Gross Total",
    remise: "Discount",
    methodesPaiement: "Payment Methods",
    ticketNumero: "Ticket No:",
    heure: "Time",
    magasin: "Store",
    caisse: "Register",
    totalBrutLabel: "Gross Total:",
    totalHTLabel: "Net Total:",
    totalTVALabel: "VAT:",
    totalTTCLabel: "Gross Total:",
    genereLe: "Generated on:",
    a: "at",
    systemeCentralisation: "MEGA-Central - Sales Centralization System",
    pdfGenere: "PDF generated and saved for ticket",
    pdfSauvegarde: "PDF saved to database",
    pdfTelecharge: "Complete PDF downloaded from database",
    exportReussi: "Excel export successful",
    erreurChargement: "Error loading tickets",
    erreurGeneration: "Error generating PDF for ticket",
    erreurDetails: "Error loading ticket details",
    erreurExport: "Error during Excel export",
  },
  messages: {
    ticketGenere: "✅ PDF generated and saved for ticket",
    exportExcelReussi: "✅ Excel export successful",
    erreur: "❌ Error",
    chargement: "Loading...",
    pdfDisponible: "PDF available - Direct download",
    pdfNonDisponible: "No PDF available for this ticket",
    pdfComplet: "Complete PDF generated and saved",
    pdfBase: "Complete PDF downloaded from database",
    succes: "Success",
    erreurConnexion: "Connection error",
    donneesChargees: "Data loaded successfully",
  },
  etats: {
    normal: "Normal",
    annule: "Cancelled",
    rembourse: "Refunded",
    enCours: "In Progress",
    termine: "Completed",
  },
  commun: {
    rechercher: "Search",
    filtrer: "Filter",
    exporter: "Export",
    telecharger: "Download",
    generer: "Generate",
    modifier: "Edit",
    supprimer: "Delete",
    valider: "Validate",
    annuler: "Cancel",
    fermer: "Close",
    enregistrer: "Save",
    oui: "Yes",
    non: "No",
    confirmer: "Confirm",
    attention: "Warning",
    information: "Information",
    erreur: "Error",
    succes: "Success",
    chargement: "Loading",
    aucunResultat: "No results found",
    pages: "Pages",
    precedent: "Previous",
    suivant: "Next",
    premier: "First",
    dernier: "Last",
    actions: "Actions",
    lignesParPage: "Rows per page",
    sur: "of",
  },
  articles: {
    title: "Articles",
    recherchePlaceholder: "Search an article...",
    code: "Code",
    codeBarres: "Barcode",
    libelle: "Label",
    famille: "Family",
    tva: "VAT",
    prix: "Price",
    prixHT: "Price HT",
    prixTTC: "Price TTC",
    statut: "Status",
    actif: "Active",
    suspendu: "Suspended",
    actualiser: "Refresh",
    trierParNom: "Sort by name",
    trierParPrix: "Sort by price",
    voirDetails: "View",
    modifier: "Edit",
    supprimer: "Delete",
    totalArticles: "Total articles",
    pageActuelle: "Current page",
    aucunArticle: "No article found",
    erreurChargement: "Error loading articles",
    detailsArticle: "Article Details",
    informationsGenerales: "General Information",
  },
};
