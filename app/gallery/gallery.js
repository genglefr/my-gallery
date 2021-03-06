'use strict';

angular.module('myApp.gallery', ['ngRoute','toastr','pouchdb','thatisuday.ng-image-gallery','angularFileUpload'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/gallery', {
    templateUrl: 'gallery/gallery.html',
    controller: 'GalleryCtrl'
  });
}]).controller('GalleryCtrl', ['$rootScope', '$scope', '$filter', 'toastr', 'pouchDB', 'FileUploader', function($rootScope, $scope, $filter, toastr, pouchDB, FileUploader) {
    var localDb = new PouchDB('images', {adapter : 'idb', auto_compaction: true});
    var remoteUrl = 'http://localhost:4984/images';
    var remoteDb = new PouchDB(remoteUrl);
    var opts = {live: true, back_off_function: back_off, checkpoint: false};

    var adapter = new PouchWsAdapter(localDb, remoteDb);
    adapter.sync();
    //localDb.replicate.from(remoteUrl, opts, syncError);
    localDb.replicate.to(remoteUrl, opts, syncError);

    var imageMap = {};
    localDb.changes({since: 0, live: true, include_docs: true, retry: true, style: 'all_docs'}).on('change', function (change) {
        if (!change.deleted) {
            createDeletableFlag(change);
            imageMap[change.doc._id] = change.doc;
            notify(change);
        } else if (imageMap[change.doc._id]) {
            delete imageMap[change.doc._id];
        }
        var img = Object.values(imageMap);
        $scope.images = img;
        $scope.$apply(img);
    }).on('denied', function (err) {
        toastr.error('Not authorised to sync:' + err);
    }).on('error', function (err) {
        toastr.error('Error when syncing:' + err);
    });

    function createDeletableFlag(row){
        row.doc.deletable = (row.doc.author == '' ? true :
            ($rootScope.context ? row.doc.author == $rootScope.context.userCtx.name : false));
    }

    function notify(change) {
        if($rootScope.context && change.doc.likeAuthor && change.doc.author == $rootScope.context.userCtx.name && $rootScope.context.userCtx.name != change.doc.likeAuthor){
            var text = change.doc.likeAuthor + ' likes your image "' + change.doc.title + '" ! It has now ' + change.doc.likes + ' like(s).';
            toastr.info(text);
        }
    }

    function syncError(e) {
        console.log(e);
        toastr.error('Failure when syncing:'+e);
    }

    function back_off(delay) {
        if (delay === 0) {
            return 1000;
        }
        return delay * 1;
    }

    $scope.delete = function(img, cb) {
        localDb.remove(img, function callback(err, result) {
            cb();
        });
    }

    $scope.uploadItem = function() {
        angular.element("#file-select").click();
    }

    function put(base64Image, fileItem){
        var id = new Date().toISOString();
        var image = {
            _id: id,
            id: id,
            url : base64Image,
            title: fileItem.file.name,
            desc: "Uploaded by " + ($rootScope.context ? $rootScope.context.userCtx.name : 'anonymous'),
            likes : 0,
            author: $rootScope.context ? $rootScope.context.userCtx.name : ''
        };
        localDb.put(image, function callback(err, result) {
            if (err) {
                toastr.error('Failure when creating image:' + err);
            }
            fileItem.remove();
        });
    }

    $scope.uploader = new FileUploader();
    $scope.uploader.uploadItem = function (fileItem) {
        var file = fileItem._file;
        var reader = new FileReader();
        reader.onload = function (e) {
            var image = e.target.result;
            var i = new Image();
            i.src = image;
            i.onload = function() {
                var scale = Math.min((750 / i.width), (750 / i.height));
                var base64Image = imageToDataUri(i, i.width * scale, i.height * scale);
                put(base64Image, fileItem);
            }
        }
        reader.readAsDataURL(file);
    };

    function imageToDataUri(img, width, height) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/png', 1.0);
    }

    $scope.methods = {};
    $scope.methods.doubletap = function(id){
        if (id && $scope.imageMap) {
            var image = $scope.imageMap[id];
            image.likes = image.likes+1;
            image.likeAuthor = ($rootScope.context ? $rootScope.context.userCtx.name : 'anonymous');
            localDb.put(image, function callback(err, result) {
                if (err) {
                    toastr.error('Failure when liking image:' + err);
                }
            });
        }
    }
}]);