/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  module.controller('Profiles.AssignProfilesController', ['$scope', '$location', '$templateCache', 'profiles', 'containers', 'blockUI', 'jsyaml', ($scope, $location, $templateCache, profiles: Profiles, containers: Containers, blockUI, yaml) => {
    $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
    // Associate this controller scope to the ForgeProjectService
    Forge.updateForgeProject($scope);
    $scope.gitRestUrl = path => Wiki.gitRestURL($scope, path);

    $scope.profiles = profiles;
    $scope.containers = containers;
    $scope.selectable = true;
    $scope.profileGroups = (profile: Profile) => profile.tags.length > 0 ? profile.tags[0] : '';

    let saving:number = 0;
    $scope.saving = () => saving > 0;

    let blockTable = blockUI.instances.get('blockTable');

    $scope.assignProfiles = () => {
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
      containers.cart.forEach(container => {
        saving++;
        wiki.putPage($scope.branch, container.path, assignProfiles(container, profiles.cart), 'Assign profiles', success, failure);
      });
    };

    let assignProfiles = (container: Container, profiles: Profile[]): string => yaml.safeDump({
      container: {
        profiles        : profiles.map(profile => profile.id).join(' '),
        'container-type': container.types.join(' ')
      }
    });

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