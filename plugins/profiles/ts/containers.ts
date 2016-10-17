/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  import KubernetesModelService = Kubernetes.KubernetesModelService;
  import IDeferred = angular.IDeferred;
  import IPromise = angular.IPromise;

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
    private $q:ng.IQService;

    constructor(profiles: Profiles, kubernetes: KubernetesModelService, $q: ng.IQService) {
      this.profiles = profiles;
      this.kubernetes = kubernetes;
      this.$q = $q;
    }

    load = (wiki:Wiki.GitWikiRepository, branch:string, namespace?:string):IPromise<void> => {
      this.loading = true;
      this.requests++;
      let data:Container[] = [];
      let deferred = this.$q.defer<void>();
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
        deferred.resolve();
      });
      return deferred.promise;
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

  module.service('containers', ['profiles', 'KubernetesModel', '$q', Containers]);

  module.controller('Profiles.ContainersController',
    ['$scope', '$location', 'containers', 'blockUI',
      ($scope, $location, containers: Containers, blockUI) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
    // Associate this controller scope to the ForgeProjectService
    Forge.updateForgeProject($scope);

    $scope.containers = containers;
    $scope.selectable = true;

    let saving:number = 0;
    $scope.saving = () => saving > 0;

    let blockTable = blockUI.instances.get('blockTable');

    $scope.createContainers = () => $location.path(UrlHelpers.join('/workspaces', $scope.namespace, 'projects', $scope.projectId, 'profiles', 'containers', 'deployProfiles'));

    $scope.assignProfiles = () => $location.path(UrlHelpers.join('/workspaces', $scope.namespace, 'projects', $scope.projectId, 'profiles', 'containers', 'assignProfiles'));

    $scope.deleteContainers = () => {
      let wiki = new Wiki.GitWikiRepository($scope);
      // TODO: use PatternFly notifications
      let success = (response, container) => {
        Wiki.onComplete(response);
        Core.notification('success', container + ' deleted!');
        complete();
      };
      let failure = response => {
        Core.notification('error', response);
        complete();
      };
      let complete = () => {
        if (--saving === 0) {
          blockTable.message('Refreshing ...');
          containers.load(wiki, $scope.branch).then(() => {
            blockTable.stop();
            $location.path(UrlHelpers.join('/workspaces', $scope.namespace, 'projects', $scope.projectId, 'profiles', 'containers'));
          });
        }
      };
      blockTable.start("Saving ...");
      containers.cart.forEach(container => {
        saving++;
        wiki.removePage($scope.branch, container.path, 'Delete container', (response) => success(response, container.name)/*, failure*/);
      });
    };

    $scope.refresh = () => containers.load(new Wiki.GitWikiRepository($scope), $scope.branch, $scope.namespace);
  }])
}