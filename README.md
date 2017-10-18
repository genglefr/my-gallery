# `My Gallery` — Offline first image gallery, in sync thx to pouchdb/couchdb

This project is a proof of concept for synching pouchdb - couchdb databases, using images as base64 documents.

# Dependencies
PouchDB server (https://github.com/pouchdb/pouchdb-server):

`npm install -g pouchdb-server`

Electron packager (https://github.com/electron-userland/electron-packager)

`npm install -g electron-packager`

# Configuration
Once PouchDB server is running, connect using root (`root/root`) account, and create `images` database.