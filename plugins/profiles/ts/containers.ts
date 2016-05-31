/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesNavigation.ts"/>

module Profiles {

  module.controller("Profiles.ContainersController", ["$scope", "$location", ($scope, $location) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);

    var wikiRepository = new Wiki.GitWikiRepository($scope);

    // We use $scope.loading to reference count loading operations so that we know when all the data
    // for this view has been fetched.
    $scope.loading = 0;
    
    $scope.wikiLink = path => Wiki.viewLink($scope, path, $location);

    $scope.refresh = () => {
      // Lets list all the containers, and load the container configs.
      $scope.loading++;
      wikiRepository.getPage($scope.branch, "configs/containers", null, data => {
        $scope.containers = [];
        _.forEach(data.children, value => {
          if(!value.directory && _.endsWith(value.name, ".cfg")) {
            var name = value.name.replace(/.cfg$/, "");
            $scope.loading++;
            wikiRepository.getPage($scope.branch, value.path, null, data => {
              $scope.loading--;
              $scope.containers.push({name:name, text:data.text})
            });
          }
        });
        $scope.loading--;
      });
    };

    $scope.refresh();
  }])
}