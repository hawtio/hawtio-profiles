/// <reference path="../../includes.ts"/>

/**
 * @module Profiles
 * @main Profiles
 */
module Profiles {

    export var pluginName = 'profiles';
    export var log:Logging.Logger = Logger.get(pluginName);
    export var templatePath = 'plugins/'+pluginName+'/html/';

    export var module = angular.module(pluginName, ['hawtio-core', 'hawtio-ui']);
    module.config(["$routeProvider", Profiles.initNavigation]);
    hawtioPluginLoader.addModule(pluginName);
}
