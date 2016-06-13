/// <reference path="../../includes.d.ts" />
/// <reference path="profilesPlugin.d.ts" />
/// <reference path="profilesHelpers.d.ts" />
declare module Profiles {
    interface Container {
        name: string;
        pods?: number;
        profiles: string[];
        types: string[];
        typeIcons?: Icon[];
    }
    interface Icon {
        title: string;
        type: string;
        src: string;
    }
}
