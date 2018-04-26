(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.PouchWsAdapter = factory());
}(this, (function () {'use strict';

    function PouchWsAdapter(localDb, remoteDb, options) {
        var self = this;
        if (!localDb || !remoteDb) {
            throw new Error("Please provide a local and a remote db.");
        }
        this.localDb = localDb;
        this.remoteDb = remoteDb;
        var opts = options || {};
        this.forceCreate = opts.forceCreate || true;
        this.keepAlive = opts.keepAlive || false;
        this.queryParams = opts.queryParams || '';
        this.checkpointCount = opts.checkpointCount || 2;
        this.checkpointDocId = "_local/checkpoint-" + this.localDb.name;
        this._initWebsocket();
        this.socket.onmessage = function (event) {
            if (event.data) {
                var changes = JSON.parse(event.data);
                changes.forEach(function (change) {
                    //console.log(change);
                    self.remoteDb.get(change.id,{rev: change.changes.length > 0 ? change.changes[0].rev : '', revs: true}).then(function (doc) {
                        //console.log(doc);
                        self.localDb.bulkDocs([doc], {new_edits: false}).then(function () {
                            self._checkpoint(change)
                        });
                    }).catch(function(err){
                        console.log("Error when replicating change '" + change.id + "'. Could be that doc was removed meanwhile. Error:" + JSON.stringify(err));
                    });
                });
            }
        }
        this.getCheckpoint = new Promise(function(resolve, reject){
            self.localDb.get(self.checkpointDocId).then(function (doc) {
                return resolve(doc.seq);
            }).catch(function () {
                self.localDb.info().then(function (result) {
                    return resolve(result.update_seq);
                }).catch(function(){
                    return resolve(0);
                });
            });
        })
        if (this.keepAlive) {
            this.socket.onclose = function () {
                //reinit the socket if the page is still open
                //console.log("Attempt to close the websocket");
                self._initWebsocket();
            };
        }
    };

    PouchWsAdapter.prototype._initWebsocket = function () {
        if (!this.socket || this.forceCreate) {
            var remoteUrl = this.remoteDb.name.replace("http", "ws");
            this.socket = new WebSocket(remoteUrl + "/_changes?feed=websocket");
        }
    }

    PouchWsAdapter.prototype.sync = function () {
        var self = this;
        this.socket.onopen = function (event) {
            self.getCheckpoint.then(function(seq) {
                var text = JSON.stringify({
                    "since": seq,
                    "style": 'all_docs',
                    "query_params" : self.queryParams
                });
                //console.log("Starting sync with following options: " + text);
                var encoded = new TextEncoder("ascii").encode(text);
                self.socket.send(encoded);
            });
        };
    }

    PouchWsAdapter.prototype._checkpoint = function (change){
        var self = this;
        if ((change.seq % this.checkpointCount) == 0 && !self.checkpointing) {
            self.checkpointing = true;
            self.localDb.get(self.checkpointDocId, {revs: true}).then(function (doc) {
                doc.seq = change.seq;
                doc.docId = change.id;
                doc.rev = change.changes[0].rev;
                self.localDb.put(doc);
            }).catch(function () {
                self.localDb.put({
                    _id: self.checkpointDocId,
                    seq: change.seq,
                    docId: change.id,
                    rev: change.changes[0].rev
                });
            }).finally(function(){
                self.checkpointing = false;
            });
        }
    }

    return PouchWsAdapter;
})));