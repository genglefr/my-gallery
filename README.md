# `My Gallery` — Offline first image gallery, in sync thx to pouchdb/couchdb

This project is a proof of concept for synching pouchdb - couchdb databases, using images as base64 documents.

# Dependencies
PouchDB server (https://github.com/pouchdb/pouchdb-server):

`npm install -g pouchdb-server`

Electron packager (https://github.com/electron-userland/electron-packager)

`npm install -g electron-packager`

# Configuration
Once PouchDB server is running (`npm run couchdb`), connect using root (`root/root`) account, and create `images` database.

# Packaging
Supports Electron (windows & OS X) packaging, using the following command lines:

`npm run package-win`<br>
`npm run package-osx`

# Installers
Support of windows and OS X installers is on-going, but yet bug free. Command lines are:

`npm run install-win`<br>
`npm run install-osx`