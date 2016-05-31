/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesNavigation.ts"/>

module Profiles {

  module.controller("Profiles.SettingsController", ["$scope", "$location", ($scope, $location) => {
      $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
        var wikiRepository = new Wiki.GitWikiRepository($scope);

        // We use $scope.loading to reference count loading operations so that we know when all the data
        // for this view has been fetched.
        $scope.loading = 0;

        $scope.refresh = () => {
          $scope.loading++;
          wikiRepository.getPage($scope.branch, "fabric8-profiles.cfg", null, data => {
            $scope.loading--;
            $scope.profilesConfig = data;
          });
        };

        $scope.refresh();
      }
  ]);
}