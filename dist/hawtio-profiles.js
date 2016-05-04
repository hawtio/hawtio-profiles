

var Profiles;
(function (Profiles) {
    function initNavigation($routeProvider) {
        var join = UrlHelpers.join;
        var route = Developer.createTabRoutingFunction(Profiles.templatePath);
        var base = '/workspaces/:namespace/projects/:projectId/profiles';
        Developer.customProjectSubTabFactories.push(function (context) {
            var link = null;
            if (context.projectLink) {
                link = UrlHelpers.join(context.projectLink, "profiles", "view");
            }
            if (context.$scope) {
                Forge.updateForgeProject(context.$scope);
            }
            return [{
                    isValid: function () { return link && Developer.forgeReadyLink() && Forge.forgeProject().hasPerspective("fabric8-profiles"); },
                    href: link,
                    class: "fa fa-code-fork",
                    label: "Profiles",
                    title: "Browse the profiles of this project",
                    isActive: function (subTab, path) { return _.startsWith(path, subTab.href); }
                }];
        });
        var profileCrumb = [{
                label: "Profiles",
                title: "Browse the profiles of this project"
            }];
        $routeProvider.when(join(base, 'view'), route('view.html', false, profileCrumb));
    }
    Profiles.initNavigation = initNavigation;
})(Profiles || (Profiles = {}));

var Profiles;
(function (Profiles) {
    Profiles.pluginName = 'profiles';
    Profiles.log = Logger.get(Profiles.pluginName);
    Profiles.templatePath = 'plugins/' + Profiles.pluginName + '/html/';
    Profiles.module = angular.module(Profiles.pluginName, ['hawtio-core', 'hawtio-ui']);
    Profiles.module.config(["$routeProvider", Profiles.initNavigation]);
    hawtioPluginLoader.addModule(Profiles.pluginName);
})(Profiles || (Profiles = {}));

var Profiles;
(function (Profiles) {
    Profiles.ViewController = Profiles.module.controller("Profiles.ViewController", ["$scope", "$location", function ($scope, $location) {
            var wikiRepository = new Wiki.GitWikiRepository($scope);
            $scope.loading = 0;
            $scope.details = null;
            function onFileDetails(details) {
                $scope.details = details;
                $scope.children = null;
            }
            $scope.wikiLink = function (path) {
                var rc = Wiki.viewLink($scope, path, $location);
                return rc;
            };
            $scope.refresh = function () {
                $scope.loading++;
                wikiRepository.getPage($scope.branch, "fabric8-profiles.cfg", null, function (data) {
                    $scope.loading--;
                    $scope.profilesConfig = data;
                });
                $scope.profiles = [];
                function findProfiles(path) {
                    $scope.loading++;
                    wikiRepository.getPage($scope.branch, path, null, function (data) {
                        if (data.children) {
                            _.forEach(data.children, function (value) {
                                if (value.directory && _.endsWith(value.name, ".profile")) {
                                    var name = value.path.replace(/^profiles\//, "").replace(/\.profile$/, "");
                                    $scope.profiles.push({ name: name, path: value.path });
                                }
                                else if (value.directory) {
                                    findProfiles(value.path);
                                }
                            });
                        }
                        $scope.loading--;
                    });
                }
                findProfiles("profiles");
                $scope.loading++;
                wikiRepository.getPage($scope.branch, "configs/containers", null, function (data) {
                    $scope.containers = [];
                    _.forEach(data.children, function (value) {
                        if (!value.directory && _.endsWith(value.name, ".cfg")) {
                            var name = value.name.replace(/.cfg$/, "");
                            $scope.loading++;
                            wikiRepository.getPage($scope.branch, value.path, null, function (data) {
                                $scope.loading--;
                                $scope.containers.push({ name: name, text: data.text });
                            });
                        }
                    });
                    $scope.loading--;
                });
            };
            $scope.refresh();
        }]);
})(Profiles || (Profiles = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluY2x1ZGVzLmpzIiwicHJvZmlsZXMvdHMvcHJvZmlsZXNOYXZpZ2F0aW9uLnRzIiwicHJvZmlsZXMvdHMvcHJvZmlsZXNQbHVnaW4udHMiLCJwcm9maWxlcy90cy92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUNJQSxJQUFPLFFBQVEsQ0F5Q2Q7QUF6Q0QsV0FBTyxRQUFRLEVBQUMsQ0FBQztJQU9mLHdCQUErQixjQUFjO1FBQzNDLElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDM0IsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLHdCQUF3QixDQUFDLHFCQUFZLENBQUMsQ0FBQztRQUU3RCxJQUFJLElBQUksR0FBRyxxREFBcUQsQ0FBQztRQUdqRSxTQUFTLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLFVBQUMsT0FBTztZQUNsRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7WUFDaEIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFDRCxFQUFFLENBQUEsQ0FBRSxPQUFPLENBQUMsTUFBTyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLENBQUM7b0JBQ04sT0FBTyxFQUFFLGNBQVEsTUFBTSxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBLENBQUEsQ0FBQztvQkFDdEgsSUFBSSxFQUFFLElBQUk7b0JBQ1YsS0FBSyxFQUFFLGlCQUFpQjtvQkFDeEIsS0FB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QUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQ3hELElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDM0MsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDOzRCQUNqQixjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBQyxJQUFJO2dDQUMzRCxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Z0NBQ2pCLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUE7NEJBQ3JELENBQUMsQ0FBQyxDQUFDO3dCQUNMLENBQUM7b0JBQ0gsQ0FBQyxDQUFDLENBQUE7b0JBQ0YsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuQixDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQTtZQUNELE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUduQixDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ0wsQ0FBQyxFQXRFTSxRQUFRLEtBQVIsUUFBUSxRQXNFZCIsImZpbGUiOiJjb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2luY2x1ZGVzLnRzXCIvPlxuXG4vKipcbiAqIEBtb2R1bGUgUHJvZmlsZXNcbiAqL1xubW9kdWxlIFByb2ZpbGVzIHtcblxuICAvKipcbiAgICogU2V0cyB1cCB0aGUgbmF2IGxpbmtzIGFuZCByb3V0aW5nIGZvciB0aGUgcGx1Z2luLlxuICAgKlxuICAgKiBAcGFyYW0gJHJvdXRlUHJvdmlkZXJcbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiBpbml0TmF2aWdhdGlvbigkcm91dGVQcm92aWRlcikge1xuICAgIHZhciBqb2luID0gVXJsSGVscGVycy5qb2luO1xuICAgIHZhciByb3V0ZSA9IERldmVsb3Blci5jcmVhdGVUYWJSb3V0aW5nRnVuY3Rpb24odGVtcGxhdGVQYXRoKTtcblxuICAgIHZhciBiYXNlID0gJy93b3Jrc3BhY2VzLzpuYW1lc3BhY2UvcHJvamVjdHMvOnByb2plY3RJZC9wcm9maWxlcyc7XG5cbiAgICAvLyBBZGQgYSB0YWIvbGluayB0byB0aGUgcHJvZmlsZXMgdmlldyBvbiB0aGUgbGVmdC4uXG4gICAgRGV2ZWxvcGVyLmN1c3RvbVByb2plY3RTdWJUYWJGYWN0b3JpZXMucHVzaCgoY29udGV4dCkgPT4ge1xuICAgICAgdmFyIGxpbmsgPSBudWxsO1xuICAgICAgaWYgKGNvbnRleHQucHJvamVjdExpbmspIHtcbiAgICAgICAgbGluayA9IFVybEhlbHBlcnMuam9pbihjb250ZXh0LnByb2plY3RMaW5rLCBcInByb2ZpbGVzXCIsIFwidmlld1wiKTtcbiAgICAgIH1cbiAgICAgIGlmKCBjb250ZXh0LiRzY29wZSApIHtcbiAgICAgICAgRm9yZ2UudXBkYXRlRm9yZ2VQcm9qZWN0KGNvbnRleHQuJHNjb3BlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbe1xuICAgICAgICBpc1ZhbGlkOiAoKSA9PiB7IHJldHVybiBsaW5rICYmIERldmVsb3Blci5mb3JnZVJlYWR5TGluaygpICYmIEZvcmdlLmZvcmdlUHJvamVjdCgpLmhhc1BlcnNwZWN0aXZlKFwiZmFicmljOC1wcm9maWxlc1wiKX0sXG4gICAgICAgIGhyZWY6IGxpbmssXG4gICAgICAgIGNsYXNzOiBcImZhIGZhLWNvZGUtZm9ya1wiLFxuICAgICAgICBsYWJlbDogXCJQcm9maWxlc1wiLFxuICAgICAgICB0aXRsZTogXCJCcm93c2UgdGhlIHByb2ZpbGVzIG9mIHRoaXMgcHJvamVjdFwiLFxuICAgICAgICBpc0FjdGl2ZTogKHN1YlRhYiwgcGF0aCkgPT4geyByZXR1cm4gXy5zdGFydHNXaXRoKHBhdGgsIHN1YlRhYi5ocmVmKTt9XG4gICAgICB9XVxuICAgIH0pO1xuXG4gICAgLy8gQW5kIGFkZCBhIHJvdXRlIHRvIGhhbmRsZSB0aGUgbGluayB0aGF0IHdlIGp1c3Qgc2V0dXAuXG4gICAgdmFyIHByb2ZpbGVDcnVtYiA9IFt7XG4gICAgICBsYWJlbDogXCJQcm9maWxlc1wiLFxuICAgICAgdGl0bGU6IFwiQnJvd3NlIHRoZSBwcm9maWxlcyBvZiB0aGlzIHByb2plY3RcIlxuICAgIH1dXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbihqb2luKGJhc2UsICd2aWV3JyksIHJvdXRlKCd2aWV3Lmh0bWwnLCBmYWxzZSwgcHJvZmlsZUNydW1iKSk7XG5cbiAgfVxuXG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vaW5jbHVkZXMudHNcIi8+XG5cbi8qKlxuICogQG1vZHVsZSBQcm9maWxlc1xuICogQG1haW4gUHJvZmlsZXNcbiAqL1xubW9kdWxlIFByb2ZpbGVzIHtcblxuICAgIGV4cG9ydCB2YXIgcGx1Z2luTmFtZSA9ICdwcm9maWxlcyc7XG4gICAgZXhwb3J0IHZhciBsb2c6TG9nZ2luZy5Mb2dnZXIgPSBMb2dnZXIuZ2V0KHBsdWdpbk5hbWUpO1xuICAgIGV4cG9ydCB2YXIgdGVtcGxhdGVQYXRoID0gJ3BsdWdpbnMvJytwbHVnaW5OYW1lKycvaHRtbC8nO1xuXG4gICAgZXhwb3J0IHZhciBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShwbHVnaW5OYW1lLCBbJ2hhd3Rpby1jb3JlJywgJ2hhd3Rpby11aSddKTtcbiAgICBtb2R1bGUuY29uZmlnKFtcIiRyb3V0ZVByb3ZpZGVyXCIsIFByb2ZpbGVzLmluaXROYXZpZ2F0aW9uXSk7XG4gICAgaGF3dGlvUGx1Z2luTG9hZGVyLmFkZE1vZHVsZShwbHVnaW5OYW1lKTtcbn1cbiIsIm1vZHVsZSBQcm9maWxlcyB7XG4gIGV4cG9ydCB2YXIgVmlld0NvbnRyb2xsZXIgPSBtb2R1bGUuY29udHJvbGxlcihcIlByb2ZpbGVzLlZpZXdDb250cm9sbGVyXCIsIFtcIiRzY29wZVwiLCBcIiRsb2NhdGlvblwiLCAoJHNjb3BlLCAkbG9jYXRpb24pID0+IHtcblxuICAgIHZhciB3aWtpUmVwb3NpdG9yeSA9IG5ldyBXaWtpLkdpdFdpa2lSZXBvc2l0b3J5KCRzY29wZSk7XG5cbiAgICAvLyBXZSB1c2UgJHNjb3BlLmxvYWRpbmcgdG8gcmVmZXJlbmNlIGNvdW50IGxvYWRpbmcgb3BlcmF0aW9ucyBzbyB0aGF0IHdlIGtub3cgd2hlbiBhbGwgdGhlIGRhdGFcbiAgICAvLyBmb3IgdGhpcyB2aWV3IGhhcyBiZWVuIGZldGNoZWQuXG4gICAgJHNjb3BlLmxvYWRpbmcgPSAwO1xuXG4gICAgJHNjb3BlLmRldGFpbHMgPSBudWxsO1xuICAgIGZ1bmN0aW9uIG9uRmlsZURldGFpbHMoZGV0YWlscykge1xuICAgICAgJHNjb3BlLmRldGFpbHMgPSBkZXRhaWxzO1xuICAgICAgJHNjb3BlLmNoaWxkcmVuID0gbnVsbDtcbiAgICB9XG5cbiAgICAkc2NvcGUud2lraUxpbmsgPSAocGF0aCkgPT4ge1xuICAgICAgdmFyIHJjID0gV2lraS52aWV3TGluaygkc2NvcGUsIHBhdGgsICRsb2NhdGlvbilcbiAgICAgIHJldHVybiByYztcbiAgICB9XG5cbiAgICAkc2NvcGUucmVmcmVzaCA9ICgpPT57XG4gICAgICAkc2NvcGUubG9hZGluZysrO1xuICAgICAgd2lraVJlcG9zaXRvcnkuZ2V0UGFnZSgkc2NvcGUuYnJhbmNoLCBcImZhYnJpYzgtcHJvZmlsZXMuY2ZnXCIsIG51bGwsIChkYXRhKT0+e1xuICAgICAgICAkc2NvcGUubG9hZGluZy0tO1xuICAgICAgICAkc2NvcGUucHJvZmlsZXNDb25maWcgPSBkYXRhO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5wcm9maWxlcyA9IFtdO1xuXG4gICAgICAvLyB3ZSBuZWVkIHRvIHJlY3Vyc2l2ZWx5IHRyYXZlcnNlIHRoZSBwcm9maWxlcyBkaXIgdG8gbG9vayBmb3IgcHJvZmlsZXMuXG4gICAgICBmdW5jdGlvbiBmaW5kUHJvZmlsZXMocGF0aCkge1xuICAgICAgICAkc2NvcGUubG9hZGluZysrO1xuICAgICAgICB3aWtpUmVwb3NpdG9yeS5nZXRQYWdlKCRzY29wZS5icmFuY2gsIHBhdGgsIG51bGwsIChkYXRhKT0+e1xuICAgICAgICAgIC8vICRzY29wZS5wcm9maWxlcyA9IGRhdGE7XG4gICAgICAgICAgaWYoIGRhdGEuY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICBfLmZvckVhY2goZGF0YS5jaGlsZHJlbiwgKHZhbHVlKT0+e1xuICAgICAgICAgICAgICBpZiggdmFsdWUuZGlyZWN0b3J5ICYmIF8uZW5kc1dpdGgodmFsdWUubmFtZSwgXCIucHJvZmlsZVwiKSApIHtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IHZhbHVlLnBhdGgucmVwbGFjZSgvXnByb2ZpbGVzXFwvLywgXCJcIikucmVwbGFjZSgvXFwucHJvZmlsZSQvLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvZmlsZXMucHVzaCh7bmFtZTpuYW1lLCBwYXRoOnZhbHVlLnBhdGh9KVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLmRpcmVjdG9yeSkge1xuICAgICAgICAgICAgICAgIGZpbmRQcm9maWxlcyh2YWx1ZS5wYXRoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJHNjb3BlLmxvYWRpbmctLTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBmaW5kUHJvZmlsZXMoXCJwcm9maWxlc1wiKTtcblxuICAgICAgLy8gTGV0cyBsaXN0IGFsbCB0aGUgY29udGFpbmVycywgYW5kIGxvYWQgdGhlIGNvbnRhaW5lciBjb25maWdzLlxuICAgICAgJHNjb3BlLmxvYWRpbmcrKztcbiAgICAgIHdpa2lSZXBvc2l0b3J5LmdldFBhZ2UoJHNjb3BlLmJyYW5jaCwgXCJjb25maWdzL2NvbnRhaW5lcnNcIiwgbnVsbCwgKGRhdGEpPT57XG4gICAgICAgICRzY29wZS5jb250YWluZXJzID0gW107XG4gICAgICAgIF8uZm9yRWFjaChkYXRhLmNoaWxkcmVuLCAodmFsdWUpPT57XG4gICAgICAgICAgaWYoICF2YWx1ZS5kaXJlY3RvcnkgJiYgXy5lbmRzV2l0aCh2YWx1ZS5uYW1lLCBcIi5jZmdcIikgKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUucmVwbGFjZSgvLmNmZyQvLCBcIlwiKTtcbiAgICAgICAgICAgICRzY29wZS5sb2FkaW5nKys7XG4gICAgICAgICAgICB3aWtpUmVwb3NpdG9yeS5nZXRQYWdlKCRzY29wZS5icmFuY2gsIHZhbHVlLnBhdGgsIG51bGwsIChkYXRhKT0+e1xuICAgICAgICAgICAgICAkc2NvcGUubG9hZGluZy0tO1xuICAgICAgICAgICAgICAkc2NvcGUuY29udGFpbmVycy5wdXNoKHtuYW1lOm5hbWUsIHRleHQ6ZGF0YS50ZXh0fSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgJHNjb3BlLmxvYWRpbmctLTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAkc2NvcGUucmVmcmVzaCgpO1xuXG5cbiAgfV0pXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9

angular.module("hawtio-profiles-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("plugins/profiles/html/view.html","<div ng-controller=\"Profiles.ViewController\" ng-show=\"loading==0\">\n  <button class=\"btn btn-primary\" ng-click=\"refresh()\">Refresh</button>\n  <h2>Settings</h2>\n  <div><pre>{{ profilesConfig.text }}</pre></div>\n\n  <div class=\"row\">\n    <div class=\"col-md-6\">\n      <h2>Profiles</h2>\n      <ul>\n        <li ng-repeat=\"profile in profiles\"><a href=\"{{wikiLink(profile.path)}}\">{{profile.name}}</a></li>\n      </ul>\n    </div>\n    <div class=\"col-md-6\">\n      <h2>Containers</h2>\n      <ul>\n        <li ng-repeat=\"container in containers\"><a href=\"{{wikiLink(profile.path)}}\">{{ container | json }}</a></li>\n      </ul>\n    </div>\n  </div>\n\n\n</div>");}]); hawtioPluginLoader.addModule("hawtio-profiles-templates");