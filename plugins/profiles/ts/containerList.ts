/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  module.controller('Profiles.ContainerListController', ['$scope', '$location', '$templateCache', 'profiles', 'containers', ($scope, $location, $templateCache, profiles:Profiles, containers:Containers) => {

    $scope.viewProfile = profile => $location.path(Wiki.viewLink($scope, profile.path, $location));

    $scope.containers = containers.data;

    $scope.tableConfig = {
      data: 'containers',
      showSelectionCheckbox: true,
      enableRowClickSelection: true,
      multiSelect: true,
      selectedItems: containers.cart,
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
          cellTemplate: $templateCache.get("containerPods.html")
        },
        { field: 'types',
          displayName: 'Types',
          cellTemplate: $templateCache.get("containerTypes.html")
        },
        { field: 'profiles',
          displayName: 'Profiles',
          cellTemplate: $templateCache.get("containerProfiles.html")
        }
      ]
    };
  }])
}