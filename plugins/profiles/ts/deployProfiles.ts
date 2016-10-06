/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  module.controller('Profiles.DeployProfilesController', ['$scope', '$location', '$templateCache', 'profiles', 'containers', 'blockUI', ($scope, $location, $templateCache, profiles: Profiles, containers: Containers, blockUI) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
    // Associate this controller scope to the ForgeProjectService
    Forge.updateForgeProject($scope);

    $scope.profiles = profiles;
    $scope.containers = containers;
    $scope.containerName = '';
    $scope.selectable = false;

    let saving:number = 0;
    $scope.saving = () => saving > 0;

    let blockTable = blockUI.instances.get('blockTable');

    $scope.deployProfiles = () => {
      let wiki = new Wiki.GitWikiRepository($scope);
      // TODO: use PatternFly notifications
      let success = response => {
        Wiki.onComplete(response);
        Core.notification('success', response.file + ' saved!');
        complete();
      };
      let failure = response => {
        Core.notification('error', response);
        complete();
      };
      let complete = () => {
        if (--saving === 0) {
          blockTable.message('Refreshing ...');
          containers.load(wiki, $scope.branch);
          blockTable.stop();
          $location.path(UrlHelpers.join('/workspaces', $scope.namespace, 'projects', $scope.projectId, 'profiles', 'containers'));
        }
      };
      blockTable.start("Saving ...");
      saving++;
      wiki.putPage($scope.branch, 'configs/containers/' + $scope.containerName + '.cfg', deployProfiles($scope.containerName, profiles.cart), 'Deploy profiles into ' + $scope.containerName, success, failure);
    };

    let deployProfiles = (container: string, profiles: Profile[]):string =>
        profiles.reduce((profiles: string, profile: Profile) => profiles + profile.id + ' ', 'profiles=')
          .concat('\n')
          .concat('container-type=karaf jenkinsfile');

    $scope.refreshContainers = () => containers.load(new Wiki.GitWikiRepository($scope), $scope.branch);
    $scope.refreshProfiles = () => profiles.load(new Wiki.GitWikiRepository($scope), $scope.branch);

    if (!(containers.loaded || containers.loading)) {
      $scope.refreshContainers();
    }
  }])
}