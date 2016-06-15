/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  export interface Profile {
    id?:string;
    path?:string;
    name?:string;
    tags?:string[];
    summary?:string;
    summaryUrl?:string;
    icon?:string;
    iconUrl?:string;
  }

  module.service("profiles", function () {
    this.loaded = false;
    this.loading = false;
    this.requests = 0;
    this.profiles = <Profile>[];
    this.profileCart = <Profile>[];

    this.loadProfiles = (wiki:Wiki.GitWikiRepository, branch:string, path:string) => {
      this.profiles.length = 0;
      this.requests = 0;
      this.loading = true;
      this.findProfiles(wiki, branch, path);
    };

    this.findProfiles = (wiki:Wiki.GitWikiRepository, branch:string, path:string) => {
      this.requests++;
      // we need to recursively traverse the profiles dir to look for profiles
      wiki.getPage(branch, path, null, data => {
        if(data.children) {
          _.forEach(data.children, value => {
            if(value.directory && _.endsWith(value.name, '.profile')) {
              this.loadProfile(wiki, branch, value);
            } else if (value.directory) {
              this.findProfiles(wiki, branch, value.path);
            }
          });
        }
        this.completeRequest();
      });
    };

    this.loadProfile = (wiki:Wiki.GitWikiRepository, branch:string, value:any):void => {
      var info = /^profiles\/((?:.+)\/)*(.+).profile$/.exec(value.path);
      var profile = <Profile>{
        id: (info[1] ? info[1].replace(/\//g, '-') : '') + info[2],
        name: info[2],
        path: value.path,
        tags: info[1] ? info[1].slice(0, -1).split('/') : []
      };

      this.requests++;
      wiki.getPage(branch, value.path, null, data => {
        for (let child of data.children) {
          let name = child.name.toUpperCase();
          if (name == 'README.MD' || name == 'SUMMARY.MD') {
            profile.summaryUrl = child.path;
          } else if (name == 'ICON.SVG') {
            profile.iconUrl = child.path;
          }
        }

        this.profiles.splice(_.sortedIndex(this.profiles, profile, 'name'), 0, profile);

        // Update the profiles selection in case it contains this profile
        let i = _.findIndex(this.profileCart, {id: profile.id});
        if (i >= 0) {
          this.profileCart[i] = profile;
        }

        this.completeRequest();
      });
    };

    this.completeRequest = function () {
      if (--this.requests === 0) {
        SelectionHelpers.syncGroupSelection(this.profileCart, this.profiles, 'id');
        this.loading = false;
        this.loaded = true;
      }
    };
  });

  module.controller("Profiles.ProfilesController", ["$scope", "$location", "marked", "$sce", "profiles", ($scope, $location, marked, $sce, profiles) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);

    $scope.profiles = profiles.profiles;
    $scope.profileCart = profiles.profileCart;
    $scope.selectedTags = [];

    SelectionHelpers.decorate($scope);

    $scope.loading = () => profiles.loading;

    $scope.wikiLink = path => Wiki.viewLink($scope, path, $location);

    var wikiRepository = new Wiki.GitWikiRepository($scope);

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

    $scope.assignProfiles = () => $location.path(UrlHelpers.join('/workspaces', $scope.namespace, 'projects', $scope.projectId, 'profiles', 'containers', 'assignProfiles'));

    $scope.refresh = () => profiles.loadProfiles(wikiRepository, $scope.branch, 'profiles');

    if (!(profiles.loaded || profiles.loading)) {
      $scope.refresh();
    }
  }])
}