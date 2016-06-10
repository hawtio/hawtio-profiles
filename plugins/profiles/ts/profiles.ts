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
    summaryUrl?:string;
    icon?:string;
    iconUrl?:string;
  }

  module.service("ProfileCart", () => {
    return [];
  });

  module.controller("Profiles.ProfilesController", ["$scope", "$location", "marked", "$sce", "ProfileCart", ($scope, $location, marked, $sce, profileCart) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
    $scope.profileCart = profileCart;
    $scope.selectedTags = [];

    var wikiRepository = new Wiki.GitWikiRepository($scope);

    // We use $scope.loading to reference count loading operations so that we know when all the data
    // for this view has been fetched.
    $scope.loading = 0;

    SelectionHelpers.decorate($scope);

    $scope.wikiLink = path => Wiki.viewLink($scope, path, $location);

    $scope.refresh = () => {
      $scope.profiles = [];
      findProfiles('profiles');
    };

    function findProfiles(path:string) {
      // we need to recursively traverse the profiles dir to look for profiles.
      $scope.loading++;
      wikiRepository.getPage($scope.branch, path, null, data => {
        if(data.children) {
          _.forEach(data.children, value => {
            if(value.directory && _.endsWith(value.name, '.profile')) {
              loadProfile(value);
            } else if (value.directory) {
              findProfiles(value.path);
            }
          });
        }
        $scope.loading--;
      });
    }

    function loadProfile(value:any):void {
      var info = /^profiles\/((?:.+)\/)*(.+).profile$/.exec(value.path);
      var profile = <Profile>{
        id: (info[1] || '') + info[2],
        name: info[2],
        path: value.path,
        tags: info[1] ? info[1].slice(0, -1).split('/') : []
      };

      wikiRepository.getPage($scope.branch, value.path, null, data => {
        for (let child of data.children) {
          let name = child.name.toUpperCase();
          if (name == 'README.MD' || name == 'SUMMARY.MD') {
            profile.summaryUrl = child.path;
          } else if (name == 'ICON.SVG') {
            profile.iconUrl = child.path;
          }
        }
        $scope.profiles.push(profile);
        $scope.profiles = _.sortBy($scope.profiles, 'name');
      });
    }

    $scope.loadSummary = function (profile:Profile):void {
      if (profile.iconUrl) {
        wikiRepository.getPage($scope.branch, profile.iconUrl, null, data => {
          profile.icon = $sce.trustAsHtml(data.text.replace(/(width|height)="[^"]+"/g, ''));
        });
      }
      if (profile.summaryUrl) {
        wikiRepository.getPage($scope.branch, profile.summaryUrl, null, data => profile.summary = marked(data.text));
      } else {
        profile.summary = '<em>no summary</em>';
      }
    };

    $scope.refresh();
  }])
}