/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

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
    $scope.selectedTags = [];

    var wikiRepository = new Wiki.GitWikiRepository($scope);

    // We use $scope.loading to reference count loading operations so that we know when all the data
    // for this view has been fetched.
    $scope.loading = 0;

    $scope.wikiLink = path => Wiki.viewLink($scope, path, $location);

    $scope.refresh = () => {
      $scope.profiles = [];
      // we need to recursively traverse the profiles dir to look for profiles.
      function findProfiles(path) {
        $scope.loading++;
        wikiRepository.getPage($scope.branch, path, null, data => {
          if(data.children) {
            _.forEach(data.children, value => {
              if(value.directory && _.endsWith(value.name, '.profile')) {
                var info = /^profiles\/((?:.+)\/)*(.+).profile$/.exec(value.path);
                var profile = <Profile>{
                  id: (info[1] || '') + info[2],
                  name: info[2],
                  path: value.path,
                  tags: info[1] ? info[1].slice(0, -1).split('/') : []
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
      findProfiles('profiles');
    };

    $scope.refresh();
  }])
}