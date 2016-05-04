module Profiles {
  export var ViewController = module.controller("Profiles.ViewController", ["$scope", "$location", ($scope, $location) => {

    var wikiRepository = new Wiki.GitWikiRepository($scope);

    // We use $scope.loading to reference count loading operations so that we know when all the data
    // for this view has been fetched.
    $scope.loading = 0;

    $scope.details = null;
    function onFileDetails(details) {
      $scope.details = details;
      $scope.children = null;
    }

    $scope.wikiLink = (path) => {
      var rc = Wiki.viewLink($scope, path, $location)
      return rc;
    }

    $scope.refresh = ()=>{
      $scope.loading++;
      wikiRepository.getPage($scope.branch, "fabric8-profiles.cfg", null, (data)=>{
        $scope.loading--;
        $scope.profilesConfig = data;
      });

      $scope.profiles = [];

      // we need to recursively traverse the profiles dir to look for profiles.
      function findProfiles(path) {
        $scope.loading++;
        wikiRepository.getPage($scope.branch, path, null, (data)=>{
          // $scope.profiles = data;
          if( data.children ) {
            _.forEach(data.children, (value)=>{
              if( value.directory && _.endsWith(value.name, ".profile") ) {
                var name = value.path.replace(/^profiles\//, "").replace(/\.profile$/, "");
                $scope.profiles.push({name:name, path:value.path})
              } else if (value.directory) {
                findProfiles(value.path)
              }
            });
          }
          $scope.loading--;
        });
      }
      findProfiles("profiles");

      // Lets list all the containers, and load the container configs.
      $scope.loading++;
      wikiRepository.getPage($scope.branch, "configs/containers", null, (data)=>{
        $scope.containers = [];
        _.forEach(data.children, (value)=>{
          if( !value.directory && _.endsWith(value.name, ".cfg") ) {
            var name = value.name.replace(/.cfg$/, "");
            $scope.loading++;
            wikiRepository.getPage($scope.branch, value.path, null, (data)=>{
              $scope.loading--;
              $scope.containers.push({name:name, text:data.text})
            });
          }
        })
        $scope.loading--;
      });
    }
    $scope.refresh();


  }])
}