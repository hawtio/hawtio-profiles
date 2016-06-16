/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  export interface Icon {
    title: string;
    type: string;
    src: string;
  }

  let icons = {
    karaf: 'karaf',
    jenkinsfile: 'jenkins'
  };

  export interface Container {
    name: string;
    path: string;
    text?: string;
    pods?: number;
    profiles: (Profile|string)[];
    types: string[];
    typeIcons?: Icon[];
  }

  export class Containers {
    loaded: boolean = false;
    loading: boolean = false;
    private requests: number = 0;
    data: Container[] = [];
    cart: Container[] = [];
    private profiles: Profiles;

    constructor(profiles:Profiles) {
      this.profiles = profiles;
    }

    load = (wiki:Wiki.GitWikiRepository, branch:string):void => {
      this.loading = true;
      this.requests++;
      let data:Container[] = [];
      // Lets list all the containers, and load the container configs
      wiki.getPage(branch, 'configs/containers', null, page => {
        _.forEach(page.children, child => {
          if (!child.directory && _.endsWith(child.name, '.cfg')) {
            this.requests++;
            wiki.getPage(branch, child.path, null, page => {
              let properties = parseProperties(page.text);
              let container = <Container> {
                name: page.name.replace(/.cfg$/, ''),
                path: page.path,
                text: page.text,
                pods: 0, // TODO
                // TODO: load the profiles if not already loaded and sync the containers data
                profiles: _.map(properties['profiles'].split(' '), (profile:string) => <Profile | string>_.find(this.profiles.data, {id: profile}) || profile),
                types: properties['container-type'].split(' '),
                typeIcons: properties['container-type'].split(' ').map(type => <Icon> {
                  title: type,
                  type: 'img',
                  src: 'img/icons/' + (type.toLowerCase() in icons ? icons[type.toLowerCase()] : 'java') + '.svg'
                })
              };
              data.push(container);
              this.complete(data);
            });
          }
        });
        this.complete(data);
      });
    };

    private complete = (data:Container[]):void => {
      if (--this.requests === 0) {
        this.data.length = 0;
        this.data.push(... data);
        this.loading = false;
        this.loaded = true;
      }
    };
  }

  module.service('containers', ['profiles', Containers]);

  module.controller('Profiles.ContainersController', ['$scope', 'containers', ($scope, containers:Containers) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);

    $scope.loading = () => containers.loading;
    $scope.refresh = () => containers.load(new Wiki.GitWikiRepository($scope), $scope.branch);

    if (!(containers.loaded || containers.loading)) {
      $scope.refresh();
    }
  }])
}