/// <reference path="../../includes.ts"/>

/**
 * @module Profiles
 */
module Profiles {

  export function createProfilesSubNavBars(namespace:string, projectId:string) {
    return Developer.activateCurrent([
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
}
