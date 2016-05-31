/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesNavigation.ts"/>

module Profiles {

  module.controller("Profiles.ProfilesController", ["$scope", "$location", ($scope, $location) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);

    var wikiRepository = new Wiki.GitWikiRepository($scope);

    // We use $scope.loading to reference count loading operations so that we know when all the data
    // for this view has been fetched.
    $scope.loading = 0;

    $scope.details = null;
    function onFileDetails(details) {
      $scope.details = details;
      $scope.children = null;
    }

    $scope.wikiLink = path => Wiki.viewLink($scope, path, $location);

    $scope.refresh = () => {
      $scope.profiles = [];
      // we need to recursively traverse the profiles dir to look for profiles.
      function findProfiles(path) {
        $scope.loading++;
        wikiRepository.getPage($scope.branch, path, null, data => {
          // $scope.profiles = data;
          if(data.children) {
            _.forEach(data.children, value => {
              if(value.directory && _.endsWith(value.name, ".profile")) {
                var name = value.path.replace(/^profiles\//, "").replace(/\.profile$/, "");
                $scope.profiles.push({name:name, path:value.path})
              } else if (value.directory) {
                findProfiles(value.path);
              }
            });
          }
          $scope.loading--;
        });
      }
      findProfiles("profiles");
    };

    $scope.refresh();
  }])
}