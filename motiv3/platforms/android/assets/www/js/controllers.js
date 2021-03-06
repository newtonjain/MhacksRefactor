angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $http, $window, $firebaseArray, $ionicModal, $cordovaLocalNotification) {

  var _self = this;
  _self.users = new Firebase("https://motiv3.firebaseio.com/users");
  _self.Goals = new Firebase("https://motiv3.firebaseio.com/Goals");
  $scope.cOne;
  $scope.allDone;
  
  $scope.Goals;
  $scope.users = $firebaseArray(_self.users);
  console.log('users', $scope.users);

  $scope.date = new Date();

  $scope.camera = function() {
    $window.navigator.camera.getPicture(onSuccess, onError);
  }

  function onSuccess(imageData) {
     var image = document.getElementById('myImage');
   image.src = "data:image/jpeg;base64," + imageData;

  }

  function onError(data) {
    console.log('here is the error', data);
  }

  $http.get('http://api.reimaginebanking.com/customers/56c66be5a73e49274150729e/accounts?key=df5f9b1f8f96e6f31da0b15027afe3b5')
  .success(function (data) {
    console.log("I am getting this from Capital one", data);
    $scope.cOne = data;
  })
  .error(function (data) {
    console.log("Error: " + JSON.stringify(data));
  });

    $scope.withdraw = function() {
    var toSend = {
       "merchant_id":"56c66be6a73e492741507676",
        "medium": "balance",
        "purchase_date": "2016-02-21",
        "amount": 3,
        "status": "pending",
        "description": "Penalty"
      };



    $http.post('http://api.reimaginebanking.com/accounts/56c66be6a73e492741507b91/purchases?key=df5f9b1f8f96e6f31da0b15027afe3b5', toSend)
    .success(function (data) {
    console.log("I am posting this from Capital one", data);
    $scope.posting = data;
  })
  .error(function (data) {
    console.log("Error: " + JSON.stringify(data));
  });
    }

  //Opens the login modal as soon as the controller initializes
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modallogin) {
      $scope.modallogin = modallogin;
      $scope.modallogin.show();
  });

  // Used to login 
  $scope.login = function() {
    var ref = new Firebase("https://poll2roll.firebaseio.com/");

    ref.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        // the access token will allow us to make Open Graph API calls.
        console.log("Logged in as", authData);
        $scope.authData = authData.facebook;
        $scope.$apply();
      }
    },
    {
    scope: "email" // the permissions requested
    });
  };

  $scope.savefbinfo  = function() {
    $scope.modallogin.hide();
    _self.userExists = false;

    var userData = {
      "facebook_id": $scope.authData.id,
      "name": $scope.authData.displayName,
      "email": $scope.authData.email,
      "profile_picture_url": $scope.authData.profileImageURL
    };

    var ref = _self.users;
    ref.once("value", function(allUsersSnapshot) {
      allUsersSnapshot.forEach(function(userSnapshot) {
        console.log('usersnapshot', userSnapshot);
        var name = userSnapshot.child("username").val();
         console.log('name = ', name);
         if(name == $scope.authData.displayName) {
          console.log('matching', userSnapshot.key());
           $scope.key = userSnapshot.key();
          _self.userExists = true;
          return true;
         }
      }) 

      if(!_self.userExists) {
        $scope.users.$add({
          username: $scope.authData.displayName,
          userData: userData
        }).then(function(ref) {
            $scope.key = ref.key();
            console.log("added record with id " + $scope.key, ' for user: ', $scope.users.$indexFor($scope.key));
            });
        }
    });
    $scope.index = $scope.users.$indexFor($scope.key);
    if($scope.users[$scope.index].Goals){

    $scope.Goals = $scope.users[$scope.index].Goals;
    } else {
      $scope.Goals = {};
    }
    console.log('/////', $scope.Goals, Object.keys($scope.Goals).length);
  };
})


.controller('FeedbackCtrl', function($scope, $http, $window, $ionicSlideBoxDelegate, $ionicModal) {
  $scope.newGoal={};
  $scope.surveySubmitted = false;

  console.log('///', $scope.Goals);
  // if($scope.users[$scope.index].Goals.length){

  // }
  $scope.devList = $scope.Goals || {};

  $scope.adding = function(goal) {
    if(goal) {
      if(Object.keys($scope.Goals).length <3) {
      if(Object.keys($scope.Goals).length == 0) {
      $scope.Goals.One = {Name: goal, Status: false};
      } else if(Object.keys($scope.Goals).length == 1) {
      $scope.Goals.Two = {Name: goal, Status: false};
      } else if(Object.keys($scope.Goals).length == 2) {
      $scope.Goals.Three = {Name: goal, Status: false};
      }
    } else {
      alert('only 3 goals allowed');
    }
  }
  $scope.goal = "";
}

  $scope.submitSurvey = function() {
      var send={};

    $scope.users[$scope.index].Goals = $scope.Goals;
    console.log('///', $scope.users[$scope.index].Goals);

    $scope.users.$save($scope.index).then(function() {
        //$scope.modal.show();
        $scope.surveySubmitted = true;
        console.log('please reset', $scope.Goals.One.Status);
        $scope.Goals.One.Status = false;
        $scope.Goals.Two.Status = false;
        $scope.Goals.Three.Status = false;
        console.log('please reset', $scope.Goals.One.Status, $scope.Goals.One.Status, $scope.Goals.Three.Status);
        });
  }

$scope.doRefresh = function() {
$http.get('https://www.googleapis.com/plus/v1/people/101275194113117307949/activities/public?fields=items%28object%2Fattachments%2FfullImage%2Furl%2Ctitle%29&key=AIzaSyCVVfJSqBg31bhwX_KGMp4mMGQF-kRQ8wQ')
.success(function (gpictures) {
  console.log("I am getting data", gpictures);
  $scope.images = gpictures.items;
  $scope.$broadcast('scroll.refreshComplete');
})
.error(function (data) {
  console.log("Error: " + JSON.stringify(data));
});

}

$scope.checkGoals = function() {
  var len = Object.keys($scope.Goals).length;
  var abc;
    if($scope.Goals.One.Status == false ){
      abc = false;
      console.log('a/', abc, $scope.Goals.One.Status);
    } else if($scope.Goals.Two.Status == false ){
      abc = false;
      console.log('b//',abc, $scope.Goals.Two.Status);
    }else if($scope.Goals.Three.Status == false ){
      abc = false;
      console.log('c////',abc,  $scope.Goals.Three.Status);
    } else {
       abc = true;
    }
    $scope.modal.show();
    if(!abc){
      $scope.withdraw();
    }

}

  $scope.closeLogin = function() {
      $scope.modal.hide();
  };


    $ionicModal.fromTemplateUrl('templates/surveyComplete.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });



})


