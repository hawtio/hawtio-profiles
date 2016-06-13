/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  module.controller("Profiles.AssignProfilesController", ["$scope", "$location", "$templateCache", "ProfileCart", ($scope, $location, $templateCache, profileCart:Profile[]) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);

    // We use $scope.loading to reference count loading operations so that we know
    // when all the data for this view has been fetched.
    $scope.loading = {count: 0, status: function () {return this.count > 0}};

    SelectionHelpers.decorate($scope);

    $scope.profileCart = profileCart;

  }])
}