/// <reference path="../../includes.ts"/>

/**
 * @module Profiles
 */
module Profiles {

  /**
   * Sets up the nav links and routing for the plugin.
   *
   * @param $routeProvider
   */
  export function initNavigation($routeProvider) {
    var join = UrlHelpers.join;
    var route = Developer.createTabRoutingFunction(templatePath);

    var base = '/workspaces/:namespace/projects/:projectId/profiles';

    // Add a tab/link to the profiles view on the left..
    Developer.customProjectSubTabFactories.push((context) => {
      var link = null;
      if (context.projectLink) {
        link = UrlHelpers.join(context.projectLink, "profiles", "view");
      }
      if( context.$scope ) {
        Forge.updateForgeProject(context.$scope);
      }
      return [{
        isValid: () => { return link && Developer.forgeReadyLink() && Forge.forgeProject().hasPerspective("fabric8-profiles")},
        href: link,
        class: "fa fa-code-fork",
        label: "Profiles",
        title: "Browse the profiles of this project",
        isActive: (subTab, path) => { return _.startsWith(path, subTab.href);}
      }]
    });

    // And add a route to handle the link that we just setup.
    var profileCrumb = [{
      label: "Profiles",
      title: "Browse the profiles of this project"
    }]
    $routeProvider.when(join(base, 'view'), route('view.html', false, profileCrumb));

  }

}
