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
  }

  export class Profiles {
    loaded:boolean = false;
    loading:boolean = false;
    data:Profile[] = [];
    cart:Profile[] = [];
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
        // Replace the existing profile with the new loaded one
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

  class ProfileView {
    open:  boolean;
    force: boolean;
    scope: any;

    constructor (scope: any) {
      this.scope = scope;
    }

    get openOrSingle():boolean {
      let scope = this.scope;
      if (scope.filteredProfiles.length === 1) {
        if (!this.force && (!scope.loading || scope.profiles.length > 1)) {
          return true;
        }
      } else {
        this.force = false;
      }
      return this.open;
    }

    set openOrSingle(open:boolean) {
      if (this.scope.filteredProfiles.length === 1) {
        this.force = true;
      }
      this.open = open;
    }
  }

  class ProfileViews {
    selectedTags:string[] = [];
    profileViews:Object   = {};
  }

  module.service('profiles', Profiles);
  module.service('profileViews', ProfileViews);

  // Wiki images are cached in base 64 so that they can be rendered
  module.factory('images', () => ({}));

  module.filter('filterCollection', () => (collection, text) =>
    Core.isBlank(text)
      ? collection
      : _.filter(collection, item => FilterHelpers.searchObject(item, text)));

  module.controller('Profiles.ProfilesController',
      ['$scope', '$location', 'marked', '$sce', 'profiles', 'profileViews', 'images',
       ($scope, $location, marked, $sce, profiles: Profiles, profileViews: ProfileViews, images: any) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);

    $scope.profiles = profiles.data;
    $scope.selection = profiles.cart;

    $scope.selectedTags = profileViews.selectedTags;
    $scope.profileViews = profileViews.profileViews;

    SelectionHelpers.decorate($scope);
    $scope.isBlank = Core.isBlank;
    $scope.loading = () => profiles.loading;
    $scope.wikiLink = path => Wiki.viewLink($scope, path, $location);
    $scope.images = images;

    let wiki = new Wiki.GitWikiRepository($scope);

    $scope.loadSummary = (profile: Profile) => {
      if (profile.iconUrl) {
        wiki.getPage($scope.branch, profile.iconUrl, null, data => profile.icon = $sce.trustAsHtml(data.text));
      }
      if (profile.summaryUrl) {
        let renderer = new marked.Renderer();
        renderer.image = (href: string, title: string, text: string) => {
          let uri = new URI(href);
          if (uri.is('relative')) {
            if (_.startsWith(uri.path(), '/')) {
              uri.segment(['profiles', ...uri.segment()]);
            } else {
              uri = uri.absoluteTo(UrlHelpers.join(profile.path, '/'));
            }
            let key = uri.normalize().toString();
            if (_.has(images, key)) {
              // Let's directly include the cached image
              return '<img src="' + images[key] + '" alt="' + (title ? title : text) + '" />';
            } else {
              // Get the image data from the wiki
              wiki.getPage($scope.branch, key, null, data =>
                $scope.images[key] = 'data:image/png;base64,' + data.content);
              // and binds the image src to the images cache
              return '<img ng-src="{{images[\'' + key + '\']}}" alt="' + (title ? title : text) + '" />';
            }
          } else {
            // Simply return the img tag with the original location
            return '<img src="' + href + '" alt="' + (title ? title : text) + '" />';
          }
        };

        wiki.getPage($scope.branch, profile.summaryUrl, null,
            data => profile.summary = marked(data.text, {renderer: renderer}));
      } else {
        profile.summary = '<em>no summary</em>';
      }
    };

    $scope.assignProfiles = () => $location.path(UrlHelpers.join('/workspaces', $scope.namespace, 'projects', $scope.projectId, 'profiles', 'containers', 'assignProfiles'));

    let updateProfileViews = profiles => _.reduce(profiles, (profileViews: ProfileViews, profile: Profile) => {
      if (!_.has(profileViews, profile.id)) {
        profileViews[profile.id] = new ProfileView($scope);
      } else {
        profileViews[profile.id].scope = $scope;
      }
      return profileViews;
    }, $scope.profileViews);

    $scope.refresh = () => {
      _.keys($scope.profileViews).forEach(key => delete $scope.profileViews[key]);
      $scope.$watchCollection('profiles', updateProfileViews);
      profiles.load(wiki, $scope.branch, 'profiles');
    };

    if (!(profiles.loaded || profiles.loading)) {
      $scope.refresh();
    } else {
      updateProfileViews($scope.profiles);
    }
  }])
}