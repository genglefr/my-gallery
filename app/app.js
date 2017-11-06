'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.login', 'myApp.gallery', 'toastr', 'ngSanitize', 'ngAnimate', 'pouchdb', 'asideModule', 'ngTouch'
]).config(['$locationProvider', '$routeProvider', 'toastrConfig', function($locationProvider, $routeProvider, toastrConfig) {
  $locationProvider.hashPrefix('!');
  $routeProvider.otherwise({redirectTo: '/gallery'});
  angular.extend(toastrConfig, {
      autoDismiss: false,
      containerId: 'toast-container',
      newestOnTop: true,
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
      preventOpenDuplicates: true,
      target: 'body'
    });
}]).filter('orderObjectBy', function(){
    return function(items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });
        filtered.sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1);
        });
        if(reverse) filtered.reverse();
        return filtered;
    };
}).run(function($window, $rootScope, toastr, $location, $route, $timeout) {
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function() {
        $rootScope.$apply(function() {
            $rootScope.online = false;
        });
    }, false);
    $window.addEventListener("online", function() {
        $rootScope.$apply(function() {
            $rootScope.online = true;
        });
    }, false);
    //var db = new PouchDB(location.protocol+'//'+location.hostname+':5984/todos-moderated', {skip_setup: true});
    var db = new PouchDB('http://localhost:5984/images', {skip_setup: true});
    db.getSession(function (err, response) {
        if (err) {
            toastr.error('Failure getting session:' + JSON.stringify(err));
        } else if (response.userCtx.name) {
            $rootScope.context = response;
        }
    });
    $rootScope.$on("login", function(event, context){
        $rootScope.context = context;
        toastr.success('Successfully logged in');
    });
    $rootScope.$on("logout", function(event, context){
        $rootScope.context = null;
        $route.reload();
        toastr.success('Successfully logged out');
    });
    $rootScope.logout = function(){
        db.logout(function (err, response) {
            if (err) {
                toastr.error('Failure logging out:' + err);
            } else {
                $rootScope.$broadcast('logout');
            }
        });
    }
    $rootScope.navigate = function(path){
        $location.path(path);
    }
    $rootScope.$on("getMenuState", function (event, data) {
        $rootScope.$apply(function () {
            $rootScope.menuOpened = data;
        });
    });
    if (window.require) {
        const {remote} = require('electron')
        const {Menu, MenuItem} = remote
        const template = [
            {label: 'Edit', submenu: [ {role: 'undo'},{role: 'redo'},{type: 'separator'},{role: 'cut'}, {role: 'copy'},{role: 'paste'},{role: 'selectall'}]},
            {label: 'View', submenu: [ {role: 'reload'},{role: 'forcereload'},{role: 'toggledevtools'},{type: 'separator'},{role: 'resetzoom'},{role: 'zoomin'},{role: 'zoomout'},{type: 'separator'},{role: 'togglefullscreen'}]},
            {role: 'window', submenu: [ {role: 'minimize'},{role: 'close'},{type: 'separator'},{label: 'Gallery', click() { $location.path('gallery'); $route.reload(); }},{label: 'Log in', click () {$location.path('login'); $route.reload();}}]},
            {role: 'help', submenu: [ {label: 'Contact',click() { remote.shell.openExternal('mailto:francois.gengler@spikeseed.com') }}]}
        ]
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    }
});
