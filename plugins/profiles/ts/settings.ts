/// <reference path="../../includes.ts"/>
/// <reference path="profilesPlugin.ts"/>
/// <reference path="profilesNavigation.ts"/>

module Profiles {

  module.controller("Profiles.SettingsController", ["$scope", "$location", ($scope, $location) => {
      $scope.tabs = createProfilesSubNavBars($scope.namespace, $scope.projectId);
      var wikiRepository = new Wiki.GitWikiRepository($scope);
  
      // We use $scope.loading to reference count loading operations so that we know when all the data
      // for this view has been fetched.
      $scope.loading = 0;

      $scope.config = {
        style: HawtioForms.FormStyle.STANDARD,
        mode: HawtioForms.FormMode.VIEW,
        properties: {
          gitRemoteUriPattern: {
            type: 'string',
            description: 'Git remote URI pattern for all containers, name is the name of the container, e.g. root'
          },
          gogsUsername: {
              type: 'string'
          },
          gogsPassword: {
              type: 'password'
          },
          groupId: {
              type: 'string'
          },
          version: {
              type: 'string'
          }
        }
      };

      $scope.refresh = () => {
        $scope.loading++;
        wikiRepository.getPage($scope.branch, 'fabric8-profiles.cfg', null, data => {
          $scope.loading--;
          $scope.settings = data.text;
          $scope.properties = parse(data.text);
        });
      };

      $scope.$watch('loading', value => $scope.config.mode = value > 0
        ? HawtioForms.FormMode.VIEW
        : HawtioForms.FormMode.EDIT);

      $scope.save = () => {
        var edit = apply($scope.properties, $scope.settings);
        if (edit != $scope.settings) {
          $scope.loading++;
          wikiRepository.putPage($scope.branch, 'fabric8-profiles.cfg', edit, 'Update profiles settings',
            response => {
              Wiki.onComplete(response);
              Core.notification("success", response.file + ' saved!');
              $scope.loading--;
            }
            // TODO: Add the ability to provide error callback to putPage API
            /*,
            response => {
              Core.notification("error", response);
              $scope.loading--;
            }*/
          );
        }
      };

      function parse(content:string):any {
        return content.split('\n').reduce((properties, line) => {
            var property = /^([^#=]+)=(.*)$/.exec(line.trim());
            if (property) {
              properties[property[1].trim()] = property[2].trim();
            }
            return properties;
        }, {});
      }

      function apply(properties:any, settings:string):string {
        return settings.replace(/^([^#=]+)=(.*)$/gm, (match, key, value) => key + '=' + properties[key] || value);
      }

      $scope.refresh();
    }
  ]);
}