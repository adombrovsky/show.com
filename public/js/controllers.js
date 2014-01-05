var showControllers = angular.module('showControllers',[]);

showControllers.controller('TrendCtrl',["$rootScope","$scope","Show",function($rootScope, $scope, Show){
    $scope.isGuest = true;
    Show.showTrends($rootScope, $scope);
}]);

showControllers.controller('MainCtrl',["$rootScope", "$scope","Notifications",function($rootScope, $scope, Notifications){
}]);

showControllers.controller('AboutCtrl',["$rootScope", "$scope", "$http",function($rootScope, $scope, $http){
    $scope.formData = {};
    $scope.sendMessage = function()
    {
        $rootScope.ajaxStarted = true;
        $http.post('/contact',$scope.formData).success(function(data){
            $rootScope.$broadcast('ajaxResponseEvent',data);
            $scope.formData = {};
        });
    }
}]);

showControllers.controller('IndexCtrl',["$rootScope", "$scope", "Show",function($rootScope, $scope, Show){
    Show.getPopularShows($rootScope, $scope);
}]);

showControllers.controller('UserShowsCtrl',["$rootScope","$location", "$scope","Show",function($rootScope, $location, $scope, Show){
    $scope.showAddToWatchButton = false;
    Show.findShowsByUser($rootScope, $scope);
}]);

showControllers.controller('NotificationCtrl',["$rootScope", "$scope","Notifications", "$sce", "$route", "$location",function($rootScope, $scope, Notifications, $sce, $route, $location){
    $scope.notifications = {};
    $scope.notificationCount = -1;
    if ($location.path() === '/notification')
    {
        Notifications.getUserNotifications($rootScope, $scope);
    }
    $scope.hideMarkedNotification = false;

    $scope.getNotificationCount = function()
    {
        Notifications.getNotificationCount($rootScope, $scope);
    };

    $scope.markNotificationAsRead = function(id)
    {
        Notifications.markNotificationAsRead($rootScope, $scope, id);
        if (!id)
        {
            $route.reload();
        }
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

showControllers.controller('ModalCtrl',["$rootScope", "$scope","$modal",function($rootScope, $scope, $modal){
    $scope.open = function()
    {
        $scope.$modalInstance = $modal.open({
            templateUrl: '/views/includes/login_form.jade',
            controller:'ModalInstanceCtrl'
        })
    };
}]);

showControllers.controller('AjaxHandlerCtrl',["$rootScope", "$scope", '$timeout', '$sce',function($rootScope, $scope, $timeout, $sce){
    $scope.message = '';
    $scope.title = '';
    $scope.showWindow = false;
    $rootScope.ajaxStarted = false;
    $scope.messageType = 'success';

    $scope.showMessage = function(message, messageType)
    {
        $scope.showWindow = false;
        $scope.message = $sce.trustAsHtml(message);
        $scope.title = 'System Notification';
        $scope.messageType = messageType !== false;
        $scope.showWindow = true;
//        $timeout(function(){$scope.showWindow = false},2000);
    };

    $scope.$on('ajaxResponseEvent',function(event, data){
        $rootScope.ajaxStarted = false;
        if (data.message)
        {
            $scope.showMessage(data.message, data.success);
        }
    });
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
    $scope.showAddToWatchButton = true;
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
        $scope.showAddToWatchButton = !$scope.showAddToWatchButton;
        $scope.item.watchedByUser = true;
        Show.addShowToWatch($rootScope, $scope, id);
    };

    $scope.removeShowFromWatch = function(id)
    {
        $scope.showAddToWatchButton = !$scope.showAddToWatchButton;
        $scope.item.watchedByUser = false;
        Show.removeShowFromWatch($rootScope, $scope, id);
    };

    $scope.addShowToWatchButton = function (ids, show_id, showAddToWatchButton)
    {
        if (ids && ids[show_id])
        {
            return !showAddToWatchButton;
        }
        else
        {
            return showAddToWatchButton;
        }
    };
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
