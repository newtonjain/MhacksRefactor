angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $firebaseArray, $ionicModal, $cordovaLocalNotification) {

  var _self = this;
  _self.users = new Firebase("https://motiv3.firebaseio.com/users");
  _self.pushNotify = new Firebase("https://motiv3.firebaseio.com/pushNotify");
  
  $scope.users = $firebaseArray(_self.users);
  

  var notifications = _self.pushNotify;

  notifications.on('value', function(dataSnapshot) {
    var value = dataSnapshot.val();

    console.log('pushNotify', value, Object.keys(value).length);
    notificationReceived(value);
  });


  var notificationReceived = function(value) {
    var now = new Date().getTime();
    var date = new Date();
    var _10SecondsFromNow = new Date(now + 30 * 1000);
    var notificationDate = new Date(value[1].Time);
    console.log('here and now',_10SecondsFromNow, notificationDate);

    angular.forEach(value, function(value, key) {
      console.log(key,': ',value);

      if(value.Activate) {
        $cordovaLocalNotification.schedule({
        id: key,
        title: value.Title,
        text: value.Body,
        firstAt: notificationDate
        });
      }
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
  };
})

.controller('FeedbackCtrl', function($scope, $window, $ionicSlideBoxDelegate, $ionicModal) {
  $scope.newGoal={};

  $scope.devList = [
    { text: "Go to the Gym", checked: true },
    { text: "Wake up early", checked: false },
    { text: "Eat healthy", checked: false }
  ];

  $scope.adding = function(goal) {
    if(goal) {
      $scope.devList.push({text: goal, checked: false});
    }
  }
    

})


