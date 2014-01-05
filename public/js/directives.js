var showDirectives = angular.module('showDirectives',[]);

showDirectives.directive('scrollToTop',function($window){
    return function(scope, element, attrs)
    {
        element.on('click',function(){
            $('body').animatescroll();
        });

        $($window).on('scroll',function(){
            var scrollTop = (this.pageYOffset !== undefined) ? this.pageYOffset : (this.document.documentElement || this.document.body.parentNode || this.document.body).scrollTop;
            if (scrollTop > 500)
            {
                scope.showButton = true;
            }
            else
            {
                scope.showButton = false;
            }
            scope.$apply();
        });
    };
});