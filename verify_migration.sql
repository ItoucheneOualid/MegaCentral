SELECT COUNT(*) as nb_clients FROM clients;
SELECT COUNT(*) as nb_ventes FROM ventes;
SELECT COUNT(*) as nb_ventes_avec_client FROM ventes WHERE client_id IS NOT NULL;
SELECT COUNT(*) as nb_ventes_sans_client FROM ventes WHERE client_id IS NULL;