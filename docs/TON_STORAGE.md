# Ton News TON Storage integration

TON Storage stores files as bags identified by a 256-bit BagID. Ton News exports
articles as JSON files that can be placed in a TON Storage bag, then registers
the BagID in a local manifest so the app can retrieve article bodies through a
TON Storage gateway.

## Export articles

```bash
npm run ton-storage:export
```

This writes:

- `ton-storage-export/articles/<slug>.json`
- `ton-storage-export/manifest.json`

Create a TON Storage bag with the official daemon:

```bash
storage-daemon create ton-storage-export -d "Ton News articles"
```

The daemon prints a BagID after the bag is created and seeded.

## Register a bag

```bash
npm run ton-storage:register -- --bag-id <64-char-bag-id> --gateway https://storage.ton
```

The command writes `data/ton-storage-manifest.json`, which is ignored by git
because deployments can use different BagIDs and gateways.

## Retrieval

Ton News reads `data/ton-storage-manifest.json` when listing published articles.
Article metadata comes from the manifest, and article bodies are fetched from:

```txt
<gateway>/gateway/<BagID>/<path>
```

The equivalent TON Storage URI is:

```txt
tonstorage://<BagID>/<path>
```

## Safety notes

This integration does not manage wallets, storage-provider contracts, payments,
or seed phrases. Those operations must be handled by the deployment owner using
their own TON wallet and infrastructure.
