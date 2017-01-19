/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesHelpers.ts"/>

module Profiles {

  module.controller('Profiles.SettingsController', ['$scope', 'jsyaml', ($scope, yaml) => {
      $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
      // Associate this controller scope to the ForgeProjectService
      Forge.updateForgeProject($scope);

      const wikiRepository = new Wiki.GitWikiRepository($scope);
  
      // We use $scope.loading to reference count loading operations so that we know when all the data
      // for this view has been fetched.
      $scope.loading = 0;

      $scope.config = {
        style: HawtioForms.FormStyle.STANDARD,
        mode: HawtioForms.FormMode.VIEW,
        properties: {
          'git.gitRemoteUriPattern': {
            type: 'string',
            description: 'Git remote URI pattern for all containers, name is the name of the container, e.g. root'
          },
          'git.gogsUsername': {
              type: 'string'
          },
          'git.gogsPassword': {
              type: 'password'
          },
          'maven.groupId': {
              type: 'string'
          },
          'maven.version': {
              type: 'string'
          }
        }
      };

      $scope.refresh = () => {
        $scope.loading++;
        wikiRepository.getPage($scope.branch, 'fabric8-profiles.yaml', null, data => {
          $scope.loading--;
          $scope.settings = data.text;
          $scope.properties = yaml.safeLoad(data.text);
        });
      };

      $scope.$watch('loading', value => $scope.config.mode = value > 0
        ? HawtioForms.FormMode.VIEW
        : HawtioForms.FormMode.EDIT);

      $scope.save = () => {
        // that should ideally preserve comments in the existing file
        const edit = yaml.safeDump($scope.properties);
        if (edit != $scope.settings) {
          $scope.loading++;
          // TODO: use PatternFly notifications
          wikiRepository.putPage($scope.branch, 'fabric8-profiles.yaml', edit, 'Update profiles settings',
            response => {
              Wiki.onComplete(response);
              Core.notification('success', response.file + ' saved!');
              $scope.loading--;
            },
            response => {
              Core.notification('error', response);
              $scope.loading--;
            }
          );
        }
      };

      $scope.refresh();
    }
  ]);
}