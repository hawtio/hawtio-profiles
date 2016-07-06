/// <reference path="../../includes.ts"/>
/// <reference path="profilesHelpers.ts"/>

/**
 * @module Profiles
 * @main Profiles
 */
module Profiles {

  export var pluginName = 'profiles';
  export var log:Logging.Logger = Logger.get(pluginName);
  export var templatePath = 'plugins/' + pluginName + '/html/';

  export var module = angular.module(pluginName, ['hawtio-core', 'hawtio-ui', 'hawtio-forms', 'blockUI']);

  module.config(['$routeProvider', 'blockUIConfig', ($routeProvider:ng.route.IRouteProvider, blockUIConfig) => {
    blockUIConfig.autoBlock = false;
    blockUIConfig.delay = 0;

    var join = UrlHelpers.join;
    var route = Developer.createTabRoutingFunction(templatePath);
    var base = '/workspaces/:namespace/projects/:projectId/profiles';

    // Add a tab/link to the profiles view on the left..
    Developer.customProjectSubTabFactories.push(context => {
      if(context.$scope) {
        Forge.updateForgeProject(context.$scope);
      }
      return [{
        isValid: () => context.projectLink && Developer.forgeReadyLink() && Forge.forgeProject().hasPerspective('fabric8-profiles'),
        href: join(context.projectLink, 'profiles'),
        class: 'fa fa-code-fork',
        label: 'Profiles',
        title: 'Browse the profiles of this project',
        isActive: (subTab, path) => _.startsWith(path, join(context.projectLink, 'profiles'))
      }]
    });

    $routeProvider
      .when(base, route('profiles.html', false))
      .when(join(base, 'containers', 'assignProfiles'), route('assignProfiles.html', false))
      .when(join(base, 'containers'), route('containers.html', false))
      .when(join(base, 'settings'), route('settings.html', false));
  }]);

  // Directive that avoids rendering glitches when using ng-include and bypasses its complexity
  //as we use gulp-angular-templatecache to register AngularJS templates in the $templateCache.
  module.directive('templateCacheInclude', ['$compile', '$templateCache', ($compile, $templateCache) => {
    return {
      restrict: 'A',
      priority: 400,
      compile: function (element, attrs) {
        var templateName = attrs.templateCacheInclude;
        var template = $templateCache.get(templateName);
        return function (scope, element) {
          element.html(template);
          $compile(element.contents())(scope);
        };
      }
    };
  }
  ]);

  hawtioPluginLoader.addModule(pluginName);
}
