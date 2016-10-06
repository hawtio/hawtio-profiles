/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  import KubernetesModelService = Kubernetes.KubernetesModelService;

  module.controller('Profiles.ContainerListController',
    ['$scope', '$location', '$templateCache', 'profiles', 'containers', 'KubernetesModel',
      ($scope, $location, $templateCache, profiles: Profiles, containers: Containers, kubernetes: KubernetesModelService) => {

    $scope.viewProfile = profile => $location.path(Wiki.viewLink($scope.projectId, $scope.branch, profile.path, $location));
    $scope.profiles = profiles;
    $scope.containers = containers;

    $scope.tableConfig = {
      data: 'containers.data',
      showSelectionCheckbox: $scope.selectable || false,
      enableRowClickSelection: $scope.selectable || false,
      multiSelect: true,
      selectedItems: $scope.selectable ? containers.cart : [],
      filterOptions: {
        filterText: $location.search()['q'] || ''
      },
      columnDefs: [
        { field: 'name',
          displayName: 'Name',
          cellTemplate: $templateCache.get('containerName.html')
        },
        { field: 'pods',
          displayName: 'Pods',
          cellTemplate: $templateCache.get('containerPods.html')
        },
        { field: 'types',
          displayName: 'Types',
          cellTemplate: $templateCache.get('containerTypes.html')
        },
        { field: 'profiles',
          displayName: 'Profiles',
          cellTemplate: $templateCache.get('containerProfiles.html')
        }
      ]
    };

    $scope.$watchCollection('profiles.data', profiles =>
      containers.data.forEach((container:Container) =>
        profiles.forEach((profile:Profile) => {
          let i = _.indexOf(container.profiles, profile.id);
          if (i >= 0) {
            container.profiles[i] = profile;
          }
        })
      )
    );

    // Necessary sync as ui-select changes the selection array reference :(
    $scope.$watch('containers.cart', containers => {
      $scope.tableConfig.selectedItems = containers;
      $scope.$broadcast('hawtio.datatable.containers.data');
    });

    $scope.$on('kubernetesModelUpdated', () =>
      _.filter(containers.data, (container:Container) => !container.rc)
        .forEach((container:Container) => container.rc = kubernetes.getReplicationController($scope.namespace || Kubernetes.currentKubernetesNamespace(), container.name)));

    if (!(containers.loaded || containers.loading)) {
      $scope.refresh();
    }
  }]);

  module.filter('kubernetesPageLink', () => (entity, path1, path2) => UrlHelpers.join(Kubernetes.entityPageLink(entity), path1, path2));
}