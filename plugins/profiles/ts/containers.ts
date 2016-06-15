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
    pods?: number;
    profiles: Profile|string[];
    types: string[];
    typeIcons?: Icon[];
  }

  export class Containers {
    loaded: boolean = false;
    loading: boolean = false;
    private requests: number = 0;
    data: Container[] = [];
    cart: Container[] = [];
    // TODO: declare profiles as a class
    private profiles: any;

    constructor(profiles:any) {
      this.profiles = profiles;
    }

    load = (wiki:Wiki.GitWikiRepository, branch:string):void => {
      this.loading = true;
      this.data.length = 0;
      this.requests++;
      // Lets list all the containers, and load the container configs
      wiki.getPage(branch, 'configs/containers', null, data => {
        _.forEach(data.children, value => {
          if (!value.directory && _.endsWith(value.name, '.cfg')) {
            this.requests++;
            wiki.getPage(branch, value.path, null, data => {
              let properties = parseProperties(data.text);
              let container = <Container> {
                name: data.name.replace(/.cfg$/, ''),
                pods: 0, // TODO
                // TODO: load the profiles if not already loaded and sync the containers data
                profiles: _.map(properties['profiles'].split(' '), profile => _.find(this.profiles.profiles, {id: profile}) || profile),
                types: properties['container-type'].split(' '),
                typeIcons: properties['container-type'].split(' ').map(type => <Icon> {
                  title: type,
                  type: 'img',
                  src: 'img/icons/' + (type.toLowerCase() in icons ? icons[type.toLowerCase()] : 'java') + '.svg'
                })
              };
              this.data.push(container);
              this.complete();
            });
          }
        });
        this.complete();
      });
    };

    private complete = () => {
      if (--this.requests === 0) {
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