var showDirectives = angular.module('showDirectives',[]);

showDirectives.directive('scrollToTop',function($window){
    return function(scope, element)
    {
        element.on('click',function(){
            $('body').animatescroll();
        });

        $($window).on('scroll',function(){
            var scrollTop = (this.pageYOffset !== undefined) ? this.pageYOffset : (this.document.documentElement || this.document.body.parentNode || this.document.body).scrollTop;
            scope.showButton =  scrollTop > 400;
            scope.$apply();
        });
    };
});