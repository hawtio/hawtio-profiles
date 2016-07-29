/// <reference path="../../includes.d.ts" />
/// <reference path="profilesPlugin.d.ts" />
/// <reference path="profilesHelpers.d.ts" />
declare module Profiles {
    import KubernetesModelService = Kubernetes.KubernetesModelService;
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
        constructor(profiles: Profiles, kubernetes: KubernetesModelService);
        load: (wiki: Wiki.GitWikiRepository, branch: string, namespace?: string) => void;
        private complete;
    }
}
