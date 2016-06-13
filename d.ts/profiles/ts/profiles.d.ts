/// <reference path="../../includes.d.ts" />
/// <reference path="profilesPlugin.d.ts" />
/// <reference path="profilesHelpers.d.ts" />
declare module Profiles {
    interface Profile {
        id?: string;
        path?: string;
        name?: string;
        tags?: string[];
        summary?: string;
        summaryUrl?: string;
        icon?: string;
        iconUrl?: string;
    }
}
