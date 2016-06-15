/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  export interface Container {
    name:string;
    pods?: number;
    profiles:Profile|string[];
    types: string[];
    typeIcons?: Icon[]
  }

  export interface Icon {
    title: string;
    type: string;
    src: string;
  }

  module.controller("Profiles.ContainerListController", ["$scope", "$location", "$templateCache", "profiles", ($scope, $location, $templateCache, profiles) => {
    if (!$scope.loading) {
      $scope.loading = {count: 0, status: function () {return this.count > 0}};
    }

    $scope.viewProfile = profile => $location.path(Wiki.viewLink($scope, profile.path, $location));

    $scope.tableConfig = {
      data: 'containers',
      showSelectionCheckbox: true,
      enableRowClickSelection: true,
      multiSelect: true,
      selectedItems: [],
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

    let containerIcons = {
      karaf: 'karaf',
      jenkinsfile: 'jenkins'
    };

    var wikiRepository = new Wiki.GitWikiRepository($scope);

    $scope.refresh = () => {
      // Lets list all the containers, and load the container configs
      $scope.loading.count++;
      wikiRepository.getPage($scope.branch, "configs/containers", null, data => {
        $scope.containers = [];
        _.forEach(data.children, value => {
          if(!value.directory && _.endsWith(value.name, '.cfg')) {
            $scope.loading.count++;
            wikiRepository.getPage($scope.branch, value.path, null, data => {
              let properties = parseProperties(data.text);
              let container = <Container> {
                name: data.name.replace(/.cfg$/, ''),
                pods: 0, // TODO
                profiles: _.map(properties['profiles'].split(' '), profile => _.find(profiles.profiles, {id: profile}) || profile),
                types: properties['container-type'].split(' '),
                typeIcons: properties['container-type'].split(' ').map(type => <Icon> {
                  title: type,
                  type: 'img',
                  src: 'img/icons/' + (type.toLowerCase() in containerIcons ? containerIcons[type.toLowerCase()] : 'java') + '.svg'
                })
              };
              $scope.containers.push(container);
              $scope.loading.count--;
            });
          }
        });
        $scope.loading.count--;
      });
    };

    $scope.$on('refresh', $scope.refresh);

    $scope.refresh();
  }])
}