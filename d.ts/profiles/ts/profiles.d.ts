/// <reference path="../../includes.d.ts" />
/// <reference path="profilesPlugin.d.ts" />
/// <reference path="profilesHelpers.d.ts" />
declare module Profiles {
    interface Profile {
        id: string;
        path: string;
        name: string;
        tags?: string[];
        summary?: string;
        summaryUrl?: string;
        icon?: string;
        iconUrl?: string;
        open?: boolean;
    }
    class Profiles {
        loaded: boolean;
        loading: boolean;
        data: Profile[];
        cart: Profile[];
        selectedTags: string[];
        private requests;
        load: (wiki: Wiki.GitWikiRepository, branch: string, path: string) => void;
        private findProfiles;
        private loadProfile;
        private complete;
    }
}
