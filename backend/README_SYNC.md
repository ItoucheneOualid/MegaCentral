# MegaCaisse synchronization API

MegaCaisse sends batches to `POST /api/sync/megacaisse` with the shared
`MEGACAISSE_API_KEY` in the `x-api-key` header. The request body is parsed only
after API-key authentication and is limited to 50 MB.

```json
{
  "storeCode": "01",
  "tables": {
    "tickets": [
      {
        "Numero": "01-2610020001",
        "Code_Magasin": "01",
        "Date": "2026-10-02",
        "PDF_Base64": ""
      }
    ]
  }
}
```

Each request may contain rows for one or more of the 17 existing tables:
`articles`, `Art_Stat`, `barcodes`, `BC_FRN`, `BC_Lignes`, `clients`,
`familles1`, `familles2`, `fotos`, `fournis`, `Magasin`, `Param`, `tickets`,
`TVA`, `Users`, `ventes`, and `Zreports`.

The API accepts at most 500 rows per request. MegaCaisse should split larger
exports into batches and retry a failed batch. Rows are upserted using their
existing MegaCaisse primary keys, so repeating an accepted batch is safe.
Omitted tables and rows are not deleted from MegaCentral. Unknown tables or
columns are rejected; this endpoint never creates or alters database objects.

Rows in `Art_Stat`, `tickets`, `ventes`, and `Zreports` must carry the same
`Code_Magasin` as the request's `storeCode`. Conflicts between stores on local
keys are rejected with HTTP 409 and `SYNC_KEY_CONFLICT`; no conflicting row is
overwritten. Supplier codes, store IDs, and user logins already associated with
a different primary key are also rejected. For purchase orders, `Magasin_No`,
`BC_ID`, and `Code2` are used to detect store ownership conflicts. When an
existing order key has no `BC_ID`, only an identical repeat is accepted;
changed or ambiguous rows are rejected rather than overwritten.

The `stock_magasin`, `mouvements_stock`, and `ligne_vente` tables are not part
of the MegaCaisse schema and are not accepted by this endpoint.
