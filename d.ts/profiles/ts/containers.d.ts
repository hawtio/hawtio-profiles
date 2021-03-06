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
        deployment?: any;
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
        private yaml;
        constructor(profiles: Profiles, kubernetes: KubernetesModelService, $q: ng.IQService, yaml: any);
        load: (wiki: Wiki.GitWikiRepository, branch: string, namespace?: string) => IPromise<void>;
        private complete;
    }
}
