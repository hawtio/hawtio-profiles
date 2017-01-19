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
}
