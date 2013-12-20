var showFilters = angular.module('showFilters',[]);

showFilters.filter('getPosterUrl',function(){
    return function(url,size)
    {
        return url? url.replace('.jpg','-'+size+'.jpg') : '';
    }
});