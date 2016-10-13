/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  module.controller('Profiles.DeployProfilesController', ['$scope', '$location', '$templateCache', 'profiles', 'containers', 'blockUI', ($scope, $location, $templateCache, profiles: Profiles, containers: Containers, blockUI) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
    // Associate this controller scope to the ForgeProjectService
    Forge.updateForgeProject($scope);
    $scope.gitRestUrl = path => gitRestUrl($scope, path);

    $scope.profiles = profiles;
    $scope.containers = containers;
    $scope.select = {
      names: []
    };
    $scope.selectable = false;
    $scope.profileGroups = (profile: Profile) => profile.tags.length > 0 ? profile.tags[0] : '';

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
          containers.load(wiki, $scope.branch).then(() => {
            blockTable.stop();
            $location.path(UrlHelpers.join('/workspaces', $scope.namespace, 'projects', $scope.projectId, 'profiles', 'containers'));
          });
        }
      };
      blockTable.start("Saving ...");
      saving++;
      $scope.select.names.forEach(name =>
        wiki.putPage($scope.branch, 'configs/containers/' + name + '.cfg', deployProfiles(name, profiles.cart), 'Deploy profiles into ' + name, success, failure));
    };

    let deployProfiles = (container: string, profiles: Profile[]):string =>
        profiles.reduce((profiles: string, profile: Profile) => profiles + profile.id + ' ', 'profiles=')
          .concat('\n')
          .concat('container-type=karaf jenkinsfile');

    $scope.existingContainers = names => _.intersection(names, _.pluck(containers.data, 'name'));

    $scope.refreshContainers = () => containers.load(new Wiki.GitWikiRepository($scope), $scope.branch);
    $scope.refreshProfiles = () => {
      if (!profiles.loading) {
        profiles.load(new Wiki.GitWikiRepository($scope), $scope.branch);
      }
    };

    if (!(containers.loaded || containers.loading)) {
      $scope.refreshContainers();
    }
  }])
}