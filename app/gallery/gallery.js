'use strict';

angular.module('myApp.gallery', ['ngRoute','toastr','pouchdb','thatisuday.ng-image-gallery','angularFileUpload'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/gallery', {
    templateUrl: 'gallery/gallery.html',
    controller: 'GalleryCtrl'
  });
}]).controller('GalleryCtrl', ['$rootScope', '$scope', '$filter', 'toastr', 'pouchDB', 'FileUploader', function($rootScope, $scope, $filter, toastr, pouchDB, FileUploader) {
    var db = pouchDB('images');
    var remoteCouch = 'http://127.0.0.1:5984/images';
    var opts = {live: true, retry: true, back_off_function: back_off};

    db.replicate.to(remoteCouch, opts, syncError);
    db.replicate.from(remoteCouch, opts, syncError);

    db.changes({
        since: 'now',
        live: true,
        include_docs: true,
        heartbeat:1000
    }).on('change', function(change){
        if(!change.deleted){
            createDeletableFlag(change);
            $scope.imageMap[change.doc._id] = change.doc;
        } else {
            delete $scope.imageMap[change.doc._id];
        }
        $scope.images = Object.values($scope.imageMap);
    }).on('denied', function (err) {
        toastr.error('Not authorised to sync:' + err);
    }).on('error', function (err) {
        toastr.error('Error when syncing:' + err);
    });

    function readAllOnce() {
        db.allDocs({include_docs: true, descending: true}, function(err, doc) {
            $scope.imageMap = {};
            doc.rows.forEach(function(row){
                createDeletableFlag(row);
                $scope.imageMap[row.doc._id] = row.doc;
            });
            $scope.images = Object.values($scope.imageMap);
        });
    }

    function createDeletableFlag(row){
        row.doc.deletable = (row.doc.author == '' ? true :
            ($rootScope.context ? row.doc.author == $rootScope.context.userCtx.name : false));
    }

    readAllOnce();

    function syncError() {
        toastr.error('Failure when syncing');
    }

    function back_off(delay) {
        if (delay === 0) {
            return 1000;
        }
        return delay * 1;
    }

    $scope.delete = function(img, cb) {
        db.remove(img, function callback(err, result) {
            cb();
        });
    }

    function put(base64Image, fileItem){
        var id = new Date().toISOString();
        var image = {
            _id: id,
            id: id,
            url : base64Image,
            title: fileItem.file.name,
            desc: "Uploaded by " + ($rootScope.context ? $rootScope.context.userCtx.name : 'anonymous'),
            author: $rootScope.context ? $rootScope.context.userCtx.name : ''
        };
        db.put(image, function callback(err, result) {
            if (err) {
                console.log('test');
                toastr.error('Failure when posting todo' + err);
            } else {
                fileItem.remove();
            }
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

    function imageToDataUri (img, width, height) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/png', 1.0);
    }
}]);