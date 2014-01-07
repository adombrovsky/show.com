var showApp = angular.module('showApp',['ngRoute','showControllers', 'showServices', 'showDirectives', 'showFilters','ui.bootstrap', 'ngAnimate']);

showApp.config(["$routeProvider",function($routeProvider){
    $routeProvider
        .when('/show/trend',{
            templateUrl:'/views/show/trend.jade',
            controller: 'TrendCtrl'
        }).when('/show/trend/:page',{
            templateUrl:'/views/show/trend.jade',
            controller: 'TrendCtrl'
        }).when('/about',{
            templateUrl:'/views/main/about.jade',
            controller: 'AboutCtrl'
        })
        .when('/',{
            templateUrl:'/views/show/popular.jade',
            controller: 'IndexCtrl'
        })
        .when('/show/view/:id',{
            templateUrl:'/views/show/view.jade',
            controller: 'ShowDetailsCtrl'
        })
        .when('/show/list',{
            templateUrl:'/views/show/list.jade',
            controller: 'UserShowsCtrl'
        })
        .when('/show/list/:page',{
            templateUrl:'/views/show/list.jade',
            controller: 'UserShowsCtrl'
        })
        .when('/user',{
            templateUrl:'/views/user/profile.jade',
            controller: 'UserProfileCtrl'
        })
        .when('/notification',{
            templateUrl:'/views/notification/index.jade',
            controller: 'NotificationCtrl'
        })
        .when('/user/settings',{
            templateUrl:'/views/user/settings.jade',
            controller: 'UserSettingsCtrl'
        })
        .when('/show/find/:query',{
            templateUrl:'/views/show/find.jade',
            controller: 'FindCtrl'
        });
}]);

$(document).ready(function(){
    var body = $('body');
    $('div.fancyinput :input').fancyInput();
    NProgress.configure({ ease: 'ease', speed: 100 });
});
