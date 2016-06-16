/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  module.controller('Profiles.AssignProfilesController', ['$scope', '$location', '$templateCache', 'profiles', 'containers', ($scope, $location, $templateCache, profiles:Profiles, containers:Containers) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
    $scope.profiles = profiles.cart;
    $scope.containers = containers.cart;

    SelectionHelpers.decorate($scope);

    $scope.loading = () => containers.loading;
    $scope.refresh = () => containers.load(new Wiki.GitWikiRepository($scope), $scope.branch);

    if (!(containers.loaded || containers.loading)) {
      $scope.refresh();
    }
  }])
}