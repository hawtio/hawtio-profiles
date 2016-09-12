/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  export interface Profile {
    id:          string;
    path:        string;
    name:        string;
    tags?:       string[];
    summary?:    string;
    summaryUrl?: string;
    icon?:       string;
    iconUrl?:    string;
    open?:       boolean;
  }

  export class Profiles {
    loaded:boolean = false;
    loading:boolean = false;
    data:Profile[] = [];
    cart:Profile[] = [];
    selectedTags:string[] = [];
    private requests:number = 0;

    load = (wiki:Wiki.GitWikiRepository, branch:string, path:string):void => {
      this.loading = true;
      this.data.length = 0;
      this.requests = 0;
      this.findProfiles(wiki, branch, path);
    };

    private findProfiles = (wiki:Wiki.GitWikiRepository, branch:string, path:string):void => {
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
        this.complete();
      });
    };

    private loadProfile = (wiki:Wiki.GitWikiRepository, branch:string, value:any):void => {
      var info = /^profiles\/((?:.+)\/)*(.+).profile$/.exec(value.path);
      var profile = <Profile>{
        id:   (info[1] ? info[1].replace(/\//g, '-') : '') + info[2],
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

        this.data.splice(_.sortedIndex(this.data, profile, 'id'), 0, profile);

        // Update the profiles selection in case it contains this profile
        let i = _.findIndex(this.cart, {id: profile.id});
        if (i >= 0) {
          this.cart[i] = profile;
        }

        this.complete();
      });
    };

    private complete = ():void => {
      if (--this.requests === 0) {
        SelectionHelpers.syncGroupSelection(this.cart, this.data, 'id');
        this.loading = false;
        this.loaded = true;
      }
    };
  }

  module.service('profiles', Profiles);

  module.filter('filterCollection', () => (collection, text) =>
      Core.isBlank(text)
          ? collection
          : _.filter(collection, item => FilterHelpers.searchObject(item, text)));

  module.controller('Profiles.ProfilesController', ['$scope', '$location', 'marked', '$sce', 'profiles', ($scope, $location, marked, $sce, profiles:Profiles) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);

    $scope.profiles = profiles.data;
    $scope.selection = profiles.cart;
    $scope.selectedTags = profiles.selectedTags;

    SelectionHelpers.decorate($scope);
    $scope.isBlank = Core.isBlank;

    $scope.loading = () => profiles.loading;

    $scope.wikiLink = path => Wiki.viewLink($scope, path, $location);

    let wiki = new Wiki.GitWikiRepository($scope);

    $scope.loadSummary = (profile:Profile) => {
      if (profile.iconUrl) {
        wiki.getPage($scope.branch, profile.iconUrl, null, data => {
          profile.icon = $sce.trustAsHtml(data.text.replace(/(width|height)="[^"]+"/g, ''));
        });
      }
      if (profile.summaryUrl) {
        wiki.getPage($scope.branch, profile.summaryUrl, null, data => profile.summary = marked(data.text));
      } else {
        profile.summary = '<em>no summary</em>';
      }
    };

    $scope.assignProfiles = () => $location.path(UrlHelpers.join('/workspaces', $scope.namespace, 'projects', $scope.projectId, 'profiles', 'containers', 'assignProfiles'));

    $scope.refresh = () => profiles.load(wiki, $scope.branch, 'profiles');

    if (!(profiles.loaded || profiles.loading)) {
      $scope.refresh();
    }
  }])
}