/// <reference path="../../includes.ts"/>

/**
 * @module Profiles
 */
module Profiles {

  export function createProfilesSubNavBars(namespace:string, projectId:string) {
    return activateCurrent([
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), '/workspaces', namespace, 'projects', projectId, 'profiles'),
        label: 'Profiles',
        title: 'Profiles'
      },
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), '/workspaces', namespace, 'projects', projectId, 'profiles', 'containers'),
        label: 'Containers',
        title: 'Containers',
        isActive: (item, path) => _.startsWith(path, item.href)
      },
      {
        href: UrlHelpers.join(HawtioCore.documentBase(), '/workspaces', namespace, 'projects', projectId, 'profiles', 'settings'),
        label: 'Settings',
        title: 'Settings'
      }
    ]);
  }

  export function parseProperties(content:string):any {
    return content.split('\n').reduce((properties, line) => {
      var property = /^([^#=]+)=(.*)$/.exec(line.trim());
      if (property) {
        properties[property[1].trim()] = property[2].trim();
      }
      return properties;
    }, {});
  }

  // FIXME: should be exported by the Developer module
  function activateCurrent(navBarItems) {
    navBarItems = _.compact(navBarItems);
    var injector = HawtioCore.injector;
    var $location = injector ? injector.get<ng.ILocationService>("$location") : null;
    if ($location) {
      var path = Developer.normalizeHref(trimQuery($location.path()));
      var found = false;
      function makeActive(item) {
        item.active = true;
        found = true;
      }
      function getHref(item) {
        var href = item.href;
        var trimHref = trimQuery(href);
        return Developer.normalizeHref(trimHref);
      }
      angular.forEach(navBarItems, (item) => {
        if (!found && item) {
          if (angular.isFunction(item.isActive)) {
            if (item.isActive(item, path)) {
              makeActive(item);
            }
          } else {
            var trimHref = getHref(item);
            if (!trimHref) {
              return;
            }
            if (trimHref === path) {
              makeActive(item);
            }
          }
        }
      });
      // Maybe it's a sub-item of a tab, let's fall back to that maybe
      if (!found) {
        angular.forEach(navBarItems, (item) => {
          if (!found) {
            if (!angular.isFunction(item.isActive)) {
              var trimHref = getHref(item);
              if (!trimHref) {
                return;
              }
              if (_.startsWith(path, trimHref)) {
                makeActive(item);
              }
            }
          }
        });
      }
      // still not found, let's log it
      if (!found) {
        log.debug("No navigation tab found for path:", path);
      }
    }
    return navBarItems;
  }

  function trimQuery(text) {
    if (text) {
      var idx = text.indexOf("?");
      if (idx >= 0) {
        return text.substring(0, idx);
      }
    }
    return text;
  }
}
