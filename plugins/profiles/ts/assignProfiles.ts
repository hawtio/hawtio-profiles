/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  module.controller('Profiles.AssignProfilesController', ['$scope', '$location', '$templateCache', 'profiles', 'containers', ($scope, $location, $templateCache, profiles:Profiles, containers:Containers) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
    $scope.profiles = profiles.cart;
    $scope.containers = containers.cart;
    $scope.loading = () => containers.loading;
    let saving:number = 0;
    $scope.saving = () => saving > 0;

    SelectionHelpers.decorate($scope);

    $scope.assignProfiles = () => {
      let wiki = new Wiki.GitWikiRepository($scope);
      let success = response => {
        Wiki.onComplete(response);
        Core.notification("success", response.file + ' saved!');
        complete();
      };
      let failure = response => {
        Core.notification("error", response);
        complete();
      };
      let complete = () => {
        if (--saving === 0) {
          containers.load(wiki, $scope.branch);
        }
      };
      for (let container of containers.cart) {
        saving++;
        // TODO: Add the ability to provide error callback to putPage API
        wiki.putPage($scope.branch, container.path, assignProfiles(container, profiles.cart), 'Assign profiles', success/*, failure*/);
      }
    };

    let assignProfiles = (container:Container, profiles:Profile[]):string =>
        container.text.replace(/^(profiles)=(.*)$/m,
            (match, key, value) => key + '=' + profiles.map(profile => profile.id).join(' '));

    $scope.refresh = () => containers.load(new Wiki.GitWikiRepository($scope), $scope.branch);

    if (!(containers.loaded || containers.loading)) {
      $scope.refresh();
    }
  }])
}