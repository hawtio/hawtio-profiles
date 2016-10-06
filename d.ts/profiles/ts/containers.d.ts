/// <reference path="../../includes.d.ts" />
/// <reference path="profilesPlugin.d.ts" />
/// <reference path="profilesHelpers.d.ts" />
declare module Profiles {
    import KubernetesModelService = Kubernetes.KubernetesModelService;
    import IPromise = angular.IPromise;
    interface Icon {
        title: string;
        type: string;
        src: string;
    }
    interface Container {
        name: string;
        path: string;
        text?: string;
        rc?: any;
        profiles: (Profile | string)[];
        types: string[];
        icons?: Icon[];
    }
    class Containers {
        loaded: boolean;
        loading: boolean;
        private requests;
        data: Container[];
        cart: Container[];
        private profiles;
        private kubernetes;
        private $q;
        constructor(profiles: Profiles, kubernetes: KubernetesModelService, $q: ng.IQService);
        load: (wiki: Wiki.GitWikiRepository, branch: string, namespace?: string) => IPromise<void>;
        private complete;
    }
}
