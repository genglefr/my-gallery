'use strict';

angular.module('myApp.login', ['ngRoute','toastr','pouchdb'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login/login.html',
    controller: 'LoginCtrl'
  });
}]).controller('LoginCtrl', ['$scope','toastr', 'pouchDB', function($scope, toastr, pouchDB) {
    $scope.user = {};
    $scope.user.id = "";
    $scope.user.password = "";
    angular.element('.login').trigger('focus');
    //var db = new PouchDB(location.protocol+'//'+location.hostname+':5984/todos-moderated', {skip_setup: true});
    var db = new PouchDB('http://localhost:5984/images', {skip_setup: true});
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