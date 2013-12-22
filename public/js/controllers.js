var showControllers = angular.module('showControllers',[]);

showControllers.controller('TrendCtrl',["$rootScope","$scope","Show",function($rootScope, $scope, Show){
    $scope.isGuest = true;
    Show.showTrends($rootScope, $scope);
}]);

showControllers.controller('MainCtrl',["$rootScope", "$scope","Notifications",function($rootScope, $scope, Notifications){
    $scope.notificationCount = -1;
    Notifications.getNotificationCount($rootScope, $scope);
}]);

showControllers.controller('IndexCtrl',["$rootScope", "$scope", "Show",function($rootScope, $scope, Show){
    Show.getPopularShows($rootScope, $scope);
}]);

showControllers.controller('UserShowsCtrl',["$rootScope", "$scope","Show",function($rootScope, $scope, Show){
    Show.findShowsByUser($rootScope, $scope);
}]);

showControllers.controller('NotificationCtrl',["$rootScope", "$scope","Notifications", "$sce", "$route",function($rootScope, $scope, Notifications, $sce, $route){
    $scope.notifications = {};
    Notifications.getUserNotifications($rootScope, $scope);

    $scope.markNotificationAsRead = function(id)
    {
        Notifications.markNotificationAsRead($rootScope, $scope, id);
        $route.reload();

    };

    $scope.getNotificationId = function(object)
    {
        return object._id;
    };

    $scope.getNotificationText = function(object)
    {
        return $sce.trustAsHtml(object.text);
    };
}]);

showControllers.controller('UserProfileCtrl',["$rootScope", "$scope", "User",function($rootScope, $scope, User){
    $scope.user = {};
    User.getUserInfo($rootScope, $scope);
    $scope.saveUserInfo = function()
    {
        User.updateUserInfo($rootScope, $scope.user)
    }
}]);

showControllers.controller('UserSettingsCtrl',["$rootScope", "$scope", "User",function($rootScope, $scope, User){
    $scope.userSettings = {};
    User.getUserSettings($rootScope, $scope);
    $scope.saveUserSettings = function()
    {
        User.updateUserSettings($rootScope, $scope.userSettings);
    }
}]);

showControllers.controller('ModalCtrl',["$rootScope", "$scope","$modal",function($rootScope, $scope, $modal){
    $scope.open = function()
    {
        $scope.$modalInstance = $modal.open({
            templateUrl: '/views/includes/login_form.jade',
            controller:'ModalInstanceCtrl'
        })
    };
}]);

showControllers.controller('ModalInstanceCtrl',["$rootScope", "$scope", "$modalInstance",function($rootScope, $scope, $modalInstance){
    $scope.close = function ()
    {
        $modalInstance.dismiss('cancel');
    }
}]);

showControllers.controller('LoginCtrl',["$rootScope", "$scope", "$http", "$timeout",function($rootScope, $scope, $http){
    $scope.user = {};
    $scope.LoginForm = {};
    $scope.login = function()
    {
        $http.post('/login/',$scope.user).success(function(data){console.log(data)});
    }
}]);

showControllers.controller('ShowDetailsCtrl',["$rootScope", "$scope", "$routeParams", "Show",function($rootScope, $scope, $routeParams, Show){
    $scope.seasonsAreLoaded = false;
    $scope.seasonIsLoaded = false;
    $scope.seasonIsAdded = false;
    $scope.showButton = false;
    $scope.item = {};
    $scope.byEpisodeNumber = '+episode';
    if ($routeParams.id)
    {
        Show.getShowDetails($rootScope, $scope, $routeParams.id);
    }

    $scope.seasonsList = function(id)
    {
        Show.getSeasonsList($rootScope, $scope, id);
    };

    $scope.episodesList = function(showId, seasonId)
    {
        if ($scope['season'+seasonId+'IsLoaded'])
        {
            $scope['season'+seasonId+'IsLoaded'] = false;
        }
        else
        {
            Show.getEpisodesList($rootScope, $scope, showId, seasonId);
        }
    };

    $scope.addEpisodeToWatch = function(showId, seasonId, episodeId)
    {
        $scope.ids[episodeId] = true;
        Show.addEpisodeToWatch($rootScope, $scope, showId, seasonId, episodeId);

    };

    $scope.addSeasonToWatch = function(showId, seasonId)
    {
        $scope.seasonIsAdded = true;
        Show.addSeasonToWatch($rootScope, $scope, showId, seasonId);
    };

    $scope.removeSeasonFromWatch = function(showId, seasonId)
    {
        $scope.seasonIsAdded = false;
        Show.removeSeasonFromWatch($rootScope, $scope, showId, seasonId);
    };

    $scope.addShowToWatch = function(id)
    {
        $scope.item.watchedByUser = true;
        Show.addShowToWatch($rootScope, $scope, id);
    };

    $scope.removeShowFromWatch = function(id)
    {
        $scope.item.watchedByUser = false;
        Show.removeShowFromWatch($rootScope, $scope, id);
    }
}]);

showControllers.controller('FindCtrl',["$rootScope", "$scope","$location","$routeParams","$rootScope",'Show',function($rootScope, $scope, $location, $routeParams, $rootScope, Show){
    $scope.query = '';
    $scope.isGuest = true;
    $scope.find = function()
    {
        if (this.query)
        {
            $location.url('/show/find/'+this.query);
        }
    };
    if ($routeParams.query)
    {
        Show.findShow($rootScope, $scope,$routeParams.query);
    }
}]);