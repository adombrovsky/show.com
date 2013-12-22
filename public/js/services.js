var showServices = angular.module('showServices', []);

showServices.factory(
    'Show',
    [
        '$http',
        function($http){
            var showService = {};
            showService.showTrends = function ($rootScope, $scope)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/trend/').success(function(data){
                    $rootScope.ajaxStarted = false;
                    $scope.shows = data.body;
                    $scope.ids = data.ids;
                    $scope.isGuest = data.isGuest;
                    $scope.isAjaxRequestStarted = false;
                });
            };

            showService.getShowDetails = function($rootScope, $scope,showId)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/view/'+showId).success(function(data){
                    $rootScope.ajaxStarted = false;
                    $scope.item = data;
                });
            };

            showService.getSeasonsList = function($rootScope, $scope,showId)
            {
                $rootScope.ajaxStarted = true;
                return $http
                    .get('/show/'+showId+'/seasons/')
                    .success(function(data){
                        $rootScope.ajaxStarted = false;
                        $scope.seasonsAreLoaded = true;
                        $scope.seasons = data;

                    });
            };

            showService.getEpisodesList = function($rootScope, $scope,showId, seasonId)
            {
                $rootScope.ajaxStarted = true;
                return $http
                    .get('/show/'+showId+'/season/'+seasonId+'/')
                    .success(function(data){
                        $rootScope.ajaxStarted = false;
                        $scope['seasonIsLoaded'] = seasonId;
                        $scope.episodes = data.episodes;
                        $scope.ids = data.ids;
                        $scope.item_id = data.item_id;
                    });
            };

            showService.addShowToWatch = function($rootScope, $scope, showId)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/add/'+showId).success(function(data){
                    $rootScope.ajaxStarted = false;

                });
            };

            showService.removeShowFromWatch = function($rootScope, $scope, showId)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/remove/'+showId).success(function(data){
                    $rootScope.ajaxStarted = false;
                });
            };

            showService.addEpisodeToWatch = function($rootScope, $scope, showId, seasonId, episodeId)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/'+showId+'/season/'+seasonId+'/episode/'+episodeId+'/add').success(function(data){
                    $rootScope.ajaxStarted = false;
                });
            };

            showService.findShow = function($rootScope, $scope, query)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/find?query='+query).success(function(data){
                    $rootScope.ajaxStarted = false;
                    $scope.shows = data.body;
                    $scope.ids = data.ids;
                    $scope.isGuest = data.isGuest;
                });
            };

            showService.findShowsByUser = function($rootScope, $scope)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/list').success(function(data){
                    $rootScope.ajaxStarted = false;
                    $scope.shows = data.shows;
                });
            };
            return showService;
        }
    ]
);

showServices.factory(
    'User',
    [
        '$http',
        function($http){
            var userService = {};

            userService.getUserInfo = function($rootScope, $scope)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/user/').success(function(data){
                    $rootScope.ajaxStarted = false;
                    $scope.user = data;
                    $scope.user.password = '';
                });
            };

            userService.getUserSettings = function($rootScope, $scope)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/user/settings/').success(function(data){
                    $rootScope.ajaxStarted = false;
                    $scope.userSettings = data;
                });
            };

            userService.updateUserInfo = function($rootScope, userData)
            {
                $rootScope.ajaxStarted = true;
                return $http.post('/user/save/',userData).success(function(data){
                    $rootScope.ajaxStarted = false;

                });
            };

            userService.updateUserSettings = function($rootScope, userSettings)
            {
                $rootScope.ajaxStarted = true;
                return $http.post('/user/settings/save/',userSettings).success(function(data){
                    $rootScope.ajaxStarted = false;
                });
            };

            userService.getUserNotifications = function($rootScope, $scope)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/notification/').success(function(data){
                    $scope.notifications = data;
                    $rootScope.ajaxStarted = false;
                });
            };
            return userService;
        }
    ]
);
showServices.factory(
    'Notifications',
    [
        '$http',
        function($http){
            var notificationsService = {};
            notificationsService.getUserNotifications = function($rootScope, $scope)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/notification/').success(function(data){
                    $scope.notifications = data;
                    $rootScope.ajaxStarted = false;
                });
            };
            notificationsService.markNotificationAsRead = function($rootScope, $scope, id)
            {
                $rootScope.ajaxStarted = true;
                var dataToSend = {};
                if (id)
                {
                    dataToSend.id = id;
                }
                return $http.post('/notification/markAsRead/',dataToSend).success(function(data){
                    $rootScope.ajaxStarted = false;
                });
            };
            notificationsService.getNotificationCount = function($rootScope, $scope)
            {
                return $http.post('/notification/count').success(function(data){
                    $scope.notificationCount = data.n_count;
                });
            };
            return notificationsService;
        }
    ]
);