/// <reference path="../../includes.ts"/>
/// <reference path="profilesNavigation.ts"/>

/**
 * @module Profiles
 * @main Profiles
 */
module Profiles {

  export var pluginName = 'profiles';
  export var log:Logging.Logger = Logger.get(pluginName);
  export var templatePath = 'plugins/' + pluginName + '/html/';

  export var module = angular.module(pluginName, ['hawtio-core', 'hawtio-ui']);

  module.config(["$routeProvider", ($routeProvider:ng.route.IRouteProvider) => {
    var join = UrlHelpers.join;
    var route = Developer.createTabRoutingFunction(templatePath);
    var base = '/workspaces/:namespace/projects/:projectId/profiles';

    // Add a tab/link to the profiles view on the left..
    Developer.customProjectSubTabFactories.push(context => {
      if(context.$scope) {
        Forge.updateForgeProject(context.$scope);
      }
      return [{
        isValid: () => context.projectLink && Developer.forgeReadyLink() && Forge.forgeProject().hasPerspective("fabric8-profiles"),
        href: join(context.projectLink, "profiles"),
        class: "fa fa-code-fork",
        label: "Profiles",
        title: "Browse the profiles of this project",
        isActive: (subTab, path) => _.startsWith(path, join(context.projectLink, 'profiles'))
      }]
    });

    $routeProvider.when(base, route('profiles.html', false));
    $routeProvider.when(join(base, 'containers'), route('containers.html', false));
    $routeProvider.when(join(base, 'settings'), route('settings.html', false));
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
