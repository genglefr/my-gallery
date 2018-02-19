# `My Gallery` — Offline first image gallery, in sync thx to pouchdb/sync gateway websocket

This project is a proof of concept for synching pouchdb - couchdb databases, using base64 images as documents.
Since 19/02/2018, the sync is done over websocket of sync gateway.

# Dependencies
Couchbase server (https://www.couchbase.com/products/server)

Sync gateway (https://www.couchbase.com/products/sync-gateway)

Electron packager (https://github.com/electron-userland/electron-packager)

`npm install -g electron-packager`

# Configuration
Once Couchbase server is running, connect using `root` account, and create `images` bucket.
Then create a user account, which will be used in sync gateway.
This user needs read/write rights on the `images` bucket.

Then, adapt the configuration file of sync gateway to accept CORS, map the `images` database to the `images` bucket, and provide user credentials to access the couchbase bucket.
A - very - useful config sample is provided at the root location of the project (`serviceconfig.json`).

# Packaging
Supports Electron (windows & OS X) packaging, using the following command lines:

`npm run package-win`<br>
`npm run package-osx`

# Installers
Support of windows and OS X installers is on-going, but not yet bug free. Command lines are:

`npm run install-win`<br>
`npm run install-osx`