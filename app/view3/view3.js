'use strict';

angular.module('myApp.view3', ['ngRoute','toastr','pouchdb'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view3', {
    templateUrl: 'view3/view3.html',
    controller: 'View3Ctrl'
  });
}]).controller('View3Ctrl', ['$scope','toastr', 'pouchDB', function($scope, toastr, pouchDB) {
    $scope.user = {};
    $scope.user.id = "";
    $scope.user.password = "";
    //var db = new PouchDB(location.protocol+'//'+location.hostname+':5984/todos-moderated', {skip_setup: true});
    var db = new PouchDB('http://localhost:5984/todos-moderated', {skip_setup: true});
    $scope.login = function (){
        db.login($scope.user.id, $scope.user.password, function (err, response) {
            if (!err) {
                db.getSession(function (err, response) {
                    $scope.$emit('login', response);
                });
            } else {
                toastr.error('Failure logging in:' + JSON.stringify(err));
            }
        });
    }
}]);