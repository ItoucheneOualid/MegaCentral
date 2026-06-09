"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_MESSAGES = exports.ROLE_PERMISSIONS = exports.Permission = void 0;
// Définition des permissions du système
var Permission;
(function (Permission) {
    // Articles
    Permission["ARTICLES_VIEW"] = "articles:view";
    Permission["ARTICLES_CREATE"] = "articles:create";
    Permission["ARTICLES_UPDATE"] = "articles:update";
    Permission["ARTICLES_DELETE"] = "articles:delete";
    // Factures
    Permission["FACTURES_VIEW"] = "factures:view";
    Permission["FACTURES_CREATE"] = "factures:create";
    Permission["FACTURES_UPDATE"] = "factures:update";
    Permission["FACTURES_DELETE"] = "factures:delete";
    // Tickets
    Permission["TICKETS_VIEW"] = "tickets:view";
    Permission["TICKETS_CREATE"] = "tickets:create";
    Permission["TICKETS_UPDATE"] = "tickets:update";
    Permission["TICKETS_DELETE"] = "tickets:delete";
    // Commandes
    Permission["COMMANDES_VIEW"] = "commandes:view";
    Permission["COMMANDES_CREATE"] = "commandes:create";
    Permission["COMMANDES_UPDATE"] = "commandes:update";
    Permission["COMMANDES_DELETE"] = "commandes:delete";
    // Fournisseurs
    Permission["FOURNISSEURS_VIEW"] = "fournisseurs:view";
    Permission["FOURNISSEURS_CREATE"] = "fournisseurs:create";
    Permission["FOURNISSEURS_UPDATE"] = "fournisseurs:update";
    Permission["FOURNISSEURS_DELETE"] = "fournisseurs:delete";
    Permission["FOURNISSEURS_EXPORT"] = "fournisseurs:export";
    // Familles
    Permission["FAMILLES_VIEW"] = "familles:view";
    Permission["FAMILLES_CREATE"] = "familles:create";
    Permission["FAMILLES_UPDATE"] = "familles:update";
    Permission["FAMILLES_DELETE"] = "familles:delete";
    // Magasins
    Permission["MAGASINS_VIEW"] = "magasins:view";
    Permission["MAGASINS_CREATE"] = "magasins:create";
    Permission["MAGASINS_UPDATE"] = "magasins:update";
    Permission["MAGASINS_DELETE"] = "magasins:delete";
    // TVA
    Permission["TVA_VIEW"] = "tva:view";
    Permission["TVA_CREATE"] = "tva:create";
    Permission["TVA_UPDATE"] = "tva:update";
    Permission["TVA_DELETE"] = "tva:delete";
    // Administration
    Permission["USERS_VIEW"] = "users:view";
    Permission["USERS_CREATE"] = "users:create";
    Permission["USERS_UPDATE"] = "users:update";
    Permission["USERS_DELETE"] = "users:delete";
    Permission["SYSTEM_CONFIG"] = "system:config";
})(Permission || (exports.Permission = Permission = {}));
// Définition des rôles et leurs permissions
exports.ROLE_PERMISSIONS = {
    admin: [
        // Administrateur : TOUTES les permissions
        ...Object.values(Permission)
    ],
    standard: [
        // Utilisateur standard : Uniquement les permissions de lecture
        Permission.ARTICLES_VIEW,
        Permission.FACTURES_VIEW,
        Permission.TICKETS_VIEW,
        Permission.COMMANDES_VIEW,
        Permission.FOURNISSEURS_VIEW,
        Permission.FAMILLES_VIEW,
        Permission.MAGASINS_VIEW,
        Permission.TVA_VIEW
    ]
};
// Messages d'erreur par permission
exports.PERMISSION_MESSAGES = {
    [Permission.ARTICLES_CREATE]: "🚫 Création d'article non autorisée\n\nLes utilisateurs standards peuvent uniquement consulter les articles.\n\nContactez votre administrateur pour obtenir les permissions nécessaires.",
    [Permission.ARTICLES_UPDATE]: "🚫 Modification d'article non autorisée\n\nLes utilisateurs standards ont un accès en lecture seule aux articles.\n\nPour pouvoir modifier des articles, demandez une élévation de permissions.",
    [Permission.ARTICLES_DELETE]: "🚫 Suppression d'article non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.FACTURES_CREATE]: "🚫 Création de facture non autorisée\n\nLes utilisateurs standards peuvent uniquement consulter les factures.\n\nContactez votre administrateur pour obtenir les permissions nécessaires.",
    [Permission.FACTURES_UPDATE]: "🚫 Modification de facture non autorisée\n\nLes utilisateurs standards ont un accès en lecture seule aux factures.\n\nPour pouvoir modifier des factures, demandez une élévation de permissions.",
    [Permission.FACTURES_DELETE]: "🚫 Suppression de facture non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.TICKETS_CREATE]: "🚫 Création de ticket non autorisée\n\nLes utilisateurs standards peuvent uniquement consulter les tickets.\n\nContactez votre administrateur pour obtenir les permissions nécessaires.",
    [Permission.TICKETS_UPDATE]: "🚫 Modification de ticket non autorisée\n\nLes utilisateurs standards ont un accès en lecture seule aux tickets.\n\nPour pouvoir modifier des tickets, demandez une élévation de permissions.",
    [Permission.TICKETS_DELETE]: "🚫 Suppression de ticket non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.COMMANDES_CREATE]: "🚫 Création de commande non autorisée\n\nLes utilisateurs standards peuvent uniquement consulter les commandes.\n\nContactez votre administrateur pour obtenir les permissions nécessaires.",
    [Permission.COMMANDES_UPDATE]: "🚫 Modification de commande non autorisée\n\nLes utilisateurs standards ont un accès en lecture seule aux commandes.\n\nPour pouvoir modifier des commandes, demandez une élévation de permissions.",
    [Permission.COMMANDES_DELETE]: "🚫 Suppression de commande non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.FOURNISSEURS_CREATE]: "🚫 Création de fournisseur non autorisée\n\nLes utilisateurs standards peuvent uniquement consulter les fournisseurs.\n\nContactez votre administrateur pour obtenir les permissions nécessaires.",
    [Permission.FOURNISSEURS_UPDATE]: "🚫 Modification de fournisseur non autorisée\n\nLes utilisateurs standards ont un accès en lecture seule aux fournisseurs.\n\nPour pouvoir modifier des fournisseurs, demandez une élévation de permissions.",
    [Permission.FOURNISSEURS_DELETE]: "🚫 Suppression de fournisseur non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.FOURNISSEURS_EXPORT]: "🚫 Export de fournisseurs non autorisé\n\nLes utilisateurs standards peuvent uniquement consulter les fournisseurs.\n\nContactez votre administrateur pour obtenir les permissions nécessaires.",
    [Permission.FAMILLES_CREATE]: "🚫 Création de famille non autorisée\n\nLes utilisateurs standards peuvent uniquement consulter les familles.\n\nContactez votre administrateur pour obtenir les permissions nécessaires.",
    [Permission.FAMILLES_UPDATE]: "🚫 Modification de famille non autorisée\n\nLes utilisateurs standards ont un accès en lecture seule aux familles.\n\nPour pouvoir modifier des familles, demandez une élévation de permissions.",
    [Permission.FAMILLES_DELETE]: "🚫 Suppression de famille non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.MAGASINS_CREATE]: "🚫 Création de magasin non autorisée\n\nLes utilisateurs standards peuvent uniquement consulter les magasins.\n\nContactez votre administrateur pour obtenir les permissions nécessaires.",
    [Permission.MAGASINS_UPDATE]: "🚫 Modification de magasin non autorisée\n\nLes utilisateurs standards ont un accès en lecture seule aux magasins.\n\nPour pouvoir modifier des magasins, demandez une élévation de permissions.",
    [Permission.MAGASINS_DELETE]: "🚫 Suppression de magasin non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.TVA_CREATE]: "🚫 Création de TVA non autorisée\n\nLes utilisateurs standards peuvent uniquement consulter les taux de TVA.\n\nContactez votre administrateur pour obtenir les permissions nécessaires.",
    [Permission.TVA_UPDATE]: "🚫 Modification de TVA non autorisée\n\nLes utilisateurs standards ont un accès en lecture seule aux taux de TVA.\n\nPour pouvoir modifier les taux de TVA, demandez une élévation de permissions.",
    [Permission.TVA_DELETE]: "🚫 Suppression de TVA non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.USERS_CREATE]: "🚫 Création d'utilisateur non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.USERS_UPDATE]: "🚫 Modification d'utilisateur non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.USERS_DELETE]: "🚫 Suppression d'utilisateur non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération.",
    [Permission.SYSTEM_CONFIG]: "🚫 Configuration système non autorisée\n\nCette action nécessite des permissions d'administrateur.\n\nContactez votre administrateur pour effectuer cette opération."
};
