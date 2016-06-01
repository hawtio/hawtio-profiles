/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesNavigation.ts"/>

module Profiles {

  interface Profile {
    id?:string;
    path?:string;
    name?:string;
    tags?:string[];
    summary?:string;
    iconURL?:string;
  }

  module.controller("Profiles.ProfilesController", ["$scope", "$location", ($scope, $location) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
    $scope.tags = [];
    $scope.selectedTags = [];

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
          if(data.children) {
            _.forEach(data.children, value => {
              if(value.directory && _.endsWith(value.name, ".profile")) {
                var profile = <Profile>{
                  name: value.path.replace(/^profiles\//, "").replace(/\.profile$/, ""),
                  path: value.path,
                  tags: getTags(path)
                };
                $scope.profiles.push(profile);
              } else if (value.directory) {
                findProfiles(value.path);
              }
            });
          }
          $scope.loading--;
        });
      }
      findProfiles("profiles");

      function getTags(path:string):Array<string> {
          var tags = path.split('/');
          return tags.slice(1, tags.length);
      }
    };

    $scope.refresh();
  }])
}