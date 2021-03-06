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
    deployment?: any;
    profiles: (Profile|string)[];
    types:    string[];
    icons?:   Icon[];
  }

  export class Containers {
    loaded: boolean          = false;
    loading: boolean         = false;
    private requests: number = 0;
    data: Container[]        = [];
    cart: Container[]        = [];
    private profiles: Profiles;
    private kubernetes: KubernetesModelService;
    private $q: ng.IQService;
    private yaml;

    constructor(profiles: Profiles, kubernetes: KubernetesModelService, $q: ng.IQService, yaml) {
      this.profiles   = profiles;
      this.kubernetes = kubernetes;
      this.$q         = $q;
      this.yaml       = yaml;
    }

    load = (wiki:Wiki.GitWikiRepository, branch:string, namespace?:string):IPromise<void> => {
      this.loading = true;
      this.requests++;
      let data:Container[] = [];
      let deferred = this.$q.defer<void>();
      // Lets list all the containers, and load the container configs
      wiki.getPage(branch, 'configs/containers', null, page => {
        _.forEach(page.children, child => {
          if (!child.directory && _.endsWith(child.name, '.yaml')) {
            this.requests++;
            wiki.getPage(branch, child.path, null, page => {
              let properties = this.yaml.safeLoad(page.text);
              const name = page.name.replace(/.yaml/, '');
              let container = <Container> {
                name: name,
                path: page.path,
                // TODO: implement a more robust mapping between the container project and the corresponding deployment using the group and project labels
                deployment: this.kubernetes.getDeployment(namespace || Kubernetes.currentKubernetesNamespace(),name),
                // We could load the profiles if not already loaded and sync the containers data if needed
                profiles: _.map(properties.container.profiles.split(' '), (profile:string) => <Profile|string>_.find(this.profiles.data, {id: profile}) || profile),
                types: properties.container['container-type'].split(' '),
                icons: properties.container['container-type'].split(' ').map(type => <Icon> {
                  title: type,
                  type: 'img',
                  src: 'img/icons/' + (type.toLowerCase() in icons ? icons[type.toLowerCase()] : 'java') + '.svg'
                })
              };

              // add the icons from the runtime info
              if (container.deployment) {
                container.icons.push(<Icon> {
                  type: 'img',
                  src : container.deployment.$iconUrl
                });
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

  module.service('containers', ['profiles', 'KubernetesModel', '$q', 'jsyaml', Containers]);

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