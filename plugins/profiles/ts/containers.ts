/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  import KubernetesModelService = Kubernetes.KubernetesModelService;

  export interface Icon {
    title: string;
    type:  string;
    src:   string;
  }

  let icons = {
    camel:       'camel',
    jenkinsfile: 'jenkins',
    karaf:       'karaf'
  };

  export interface Container {
    name:     string;
    path:     string;
    text?:    string;
    rc?:      any;
    profiles: (Profile|string)[];
    types:    string[];
    icons?:   Icon[];
  }

  export class Containers {
    loaded:boolean = false;
    loading:boolean = false;
    private requests: number = 0;
    data:Container[] = [];
    cart:Container[] = [];
    private profiles:Profiles;
    private kubernetes:KubernetesModelService;

    constructor(profiles:Profiles, kubernetes:KubernetesModelService) {
      this.profiles = profiles;
      this.kubernetes = kubernetes;
    }

    load = (wiki:Wiki.GitWikiRepository, branch:string, namespace?:string):void => {
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
                // TODO: implement a more robust mapping between the container project and the corresponding RC
                rc: this.kubernetes.getReplicationController(namespace || Kubernetes.currentKubernetesNamespace(), page.name.replace(/.cfg$/, '')),
                // We could load the profiles if not already loaded and sync the containers data if needed
                profiles: _.map(properties['profiles'].split(' '), (profile:string) => <Profile|string>_.find(this.profiles.data, {id: profile}) || profile),
                types: properties['container-type'].split(' '),
                icons: properties['container-type'].split(' ').map(type => <Icon> {
                  title: type,
                  type: 'img',
                  src: 'img/icons/' + (type.toLowerCase() in icons ? icons[type.toLowerCase()] : 'java') + '.svg'
                })
              };
              // Override the icons with runtime container info
              if (container.rc) {
                let type = container.rc.metadata.labels.container.toLocaleLowerCase();
                container.icons = [
                <Icon> {
                  title: type,
                  type: 'img',
                  src: 'img/icons/' + (type in icons ? icons[type] : 'java') + '.svg'
                },
                <Icon> {
                  type: 'img',
                  src: container.rc.$iconUrl
                }];
              }
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

  module.service('containers', ['profiles', 'KubernetesModel', Containers]);

  module.filter('kubernetesPageLink', () => Kubernetes.entityPageLink);

  module.controller('Profiles.ContainersController',
      ['$scope', 'containers', 'profiles', 'KubernetesModel',
        ($scope, containers:Containers, profiles:Profiles, kubernetes:KubernetesModelService) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
    $scope.containers = containers.data;
    $scope.profiles = profiles.data;
    $scope.loading = () => containers.loading;
    $scope.refresh = () => containers.load(new Wiki.GitWikiRepository($scope), $scope.branch, $scope.namespace);

    $scope.$watchCollection('profiles', profiles =>
      $scope.containers.forEach((container:Container) =>
        profiles.forEach((profile:Profile) => {
          let i = _.indexOf(container.profiles, profile.id);
          if (i >= 0) {
            container.profiles[i] = profile;
          }
        })
      )
    );

    $scope.$on('kubernetesModelUpdated', () =>_.filter($scope.containers, (container:Container) => !container.rc)
      .forEach((container:Container) =>
        container.rc = kubernetes.getReplicationController('default', container.name)));

    if (!(containers.loaded || containers.loading)) {
      $scope.refresh();
    }
  }])
}