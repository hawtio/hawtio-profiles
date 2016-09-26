angular.module('angular.img', [
]).directive('httpSrc', ['$http', function ($http) {
    return {
        // do not share scope with sibling img tags and parent
        // (prevent show same images on img tag)
        scope: {},
        link: function ($scope, elem, attrs) {
            function revokeObjectURL() {
                if ($scope.objectURL) {
                    URL.revokeObjectURL($scope.objectURL);
                }
            }

            $scope.$watch('objectURL', function (objectURL) {
                elem.attr('src', objectURL);
            });

            $scope.$on('$destroy', function () {
                revokeObjectURL();
            });

            attrs.$observe('httpSrc', function (url) {
                revokeObjectURL();

                if(url && url.indexOf('data:') === 0) {
                    $scope.objectURL = url;
                } else if(url) {
                    $http.get(url, { responseType: 'arraybuffer' })
                        .then(function (response) {
                            var blob = new Blob(
                                [ response.data ],
                                { type: attrs['mediaType'] ? attrs['mediaType'] : 'application/octet-stream' }
                            );
                            $scope.objectURL = URL.createObjectURL(blob);
                        });
                }
            });
        }
    };
}]);