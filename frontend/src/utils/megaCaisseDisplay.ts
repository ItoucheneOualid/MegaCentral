export const normalizeArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === 'object' && Array.isArray((payload as any).data)) {
    return (payload as any).data as T[];
  }

  return [];
};

export const pickValue = <T = unknown>(record: any, keys: string[], fallback?: T): T | undefined => {
  for (const key of keys) {
    if (record && Object.prototype.hasOwnProperty.call(record, key) && record[key] !== undefined && record[key] !== null && record[key] !== '') {
      return record[key] as T;
    }
  }

  return fallback;
};

export const normalizeFamille = (famille: any) => ({
  F2CLEUNIK: Number(pickValue(famille, ['F2CLEUNIK', 'F2cleunik', 'id', 'ID']) ?? 0),
  Description: String(pickValue(famille, ['Description', 'description', 'Nom', 'nom', 'LIBELLE', 'libelle']) ?? ''),
  F1CLEUNIK: Number(pickValue(famille, ['F1CLEUNIK', 'F1cleunik', 'F1_Cleunik', 'famille1_id']) ?? 0),
  famille1_libelle: String(pickValue(famille, ['famille1_libelle', 'Famille1_Libelle', 'famille1', 'Description_F1']) ?? ''),
});

export const normalizeArticle = (article: any) => ({
  ...article,
  LIBELLE: pickValue(article, ['LIBELLE', 'libelle', 'Nom', 'nom']) ?? '',
  Code_Barres: pickValue(article, ['Code_Barres', 'CodeBarres', 'code_barres']) ?? '',
  Prix_Vente_HT: Number(pickValue(article, ['Prix_Vente_HT', 'prix_vente_ht', 'PRIX_VENTE_HT']) ?? 0),
  TVA_CLEUNIK: pickValue(article, ['TVA_CLEUNIK', 'tva_id', 'TVA_ID']) ?? null,
  F1_Cleunik: pickValue(article, ['F1_Cleunik', 'F1CLEUNIK', 'f1_cleunik']) ?? null,
  F2_CLEUNIK: pickValue(article, ['F2_CLEUNIK', 'F2CLEUNIK', 'f2_cleunik']) ?? null,
  Photo_Base64: pickValue(article, ['Photo_Base64', 'photo_base64']) ?? '',
});
