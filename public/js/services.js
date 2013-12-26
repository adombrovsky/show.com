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
                    $scope.shows = data.body;
                    $scope.ids = data.ids;
                    $scope.isGuest = data.isGuest;
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            showService.getShowDetails = function($rootScope, $scope, showId)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/view/'+showId).success(function(data){
                    $scope.item = data;
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            showService.getSeasonsList = function($rootScope, $scope, showId)
            {
                $rootScope.ajaxStarted = true;
                return $http
                    .get('/show/'+showId+'/seasons/')
                    .success(function(data){
                        $scope.seasonsAreLoaded = true;
                        $scope.seasons = data;
                        $rootScope.$broadcast('ajaxResponseEvent',data);

                    });
            };

            showService.getEpisodesList = function($rootScope, $scope, showId, seasonId)
            {
                $rootScope.ajaxStarted = true;
                return $http
                    .get('/show/'+showId+'/season/'+seasonId+'/')
                    .success(function(data){
                        $scope['seasonIsLoaded'] = seasonId;
                        $scope.episodes = data.episodes;
                        $scope.isGuest = data.isGuest;
                        $scope.seasonIsAdded = data.fullSeasonAdded;
                        $scope.ids = data.ids;
                        $scope.item_id = data.item_id;
                        $rootScope.$broadcast('ajaxResponseEvent',data);
                    });
            };

            showService.addShowToWatch = function($rootScope, $scope, showId)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/add/'+showId).success(function(data){
                    $rootScope.$broadcast('ajaxResponseEvent',data);

                });
            };

            showService.removeShowFromWatch = function($rootScope, $scope, showId)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/remove/'+showId).success(function(data){
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            showService.addEpisodeToWatch = function($rootScope, $scope, showId, seasonId, episodeId)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/'+showId+'/season/'+seasonId+'/episode/'+episodeId+'/add').success(function(data){
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            showService.addSeasonToWatch = function($rootScope, $scope, showId, seasonId)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/'+showId+'/season/'+seasonId+'/add').success(function(data){
                    $scope.ids = data.ids;
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            showService.removeSeasonFromWatch = function($rootScope, $scope, showId, seasonId)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/'+showId+'/season/'+seasonId+'/remove').success(function(data){
                    $scope.ids = {};
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            showService.findShow = function($rootScope, $scope, query)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/find?query='+query).success(function(data){
                    $scope.shows = data.body;
                    $scope.ids = data.ids;
                    $scope.isGuest = data.isGuest;
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            showService.findShowsByUser = function($rootScope, $scope)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/list').success(function(data){
                    $scope.shows = data.shows;
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            showService.getPopularShows = function($rootScope, $scope)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/show/popular').success(function(data){
                    $scope.shows = data.shows;
                    $rootScope.$broadcast('ajaxResponseEvent',data);
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
                    $scope.user = data;
                    $scope.user.password = '';
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            userService.getUserSettings = function($rootScope, $scope)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/user/settings/').success(function(data){
                    $scope.userSettings = data;
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            userService.updateUserInfo = function($rootScope, userData)
            {
                $rootScope.ajaxStarted = true;
                return $http.post('/user/save/',userData).success(function(data){
                    $rootScope.$broadcast('ajaxResponseEvent',data);

                });
            };

            userService.updateUserSettings = function($rootScope, userSettings)
            {
                $rootScope.ajaxStarted = true;
                return $http.post('/user/settings/save/',userSettings).success(function(data){
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };

            userService.getUserNotifications = function($rootScope, $scope)
            {
                $rootScope.ajaxStarted = true;
                return $http.get('/notification/').success(function(data){
                    $scope.notifications = data;
                    $rootScope.$broadcast('ajaxResponseEvent',data);
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
                    $rootScope.$broadcast('ajaxResponseEvent',data);
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
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };
            notificationsService.getNotificationCount = function($rootScope, $scope)
            {
                return $http.post('/notification/count').success(function(data){
                    $scope.notificationCount = data.n_count;
                    $rootScope.$broadcast('ajaxResponseEvent',data);
                });
            };
            return notificationsService;
        }
    ]
);