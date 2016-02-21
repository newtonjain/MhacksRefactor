angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $http, $firebaseArray, $ionicModal, $cordovaLocalNotification) {

  var _self = this;
  _self.users = new Firebase("https://motiv3.firebaseio.com/users");
  _self.pushNotify = new Firebase("https://motiv3.firebaseio.com/pushNotify");
  $scope.cOne;
  
  $scope.users = $firebaseArray(_self.users);
  $scope.date = new Date();
  

  var notifications = _self.pushNotify;

  notifications.on('value', function(dataSnapshot) {
    var value = dataSnapshot.val();

    console.log('pushNotify', value, Object.keys(value).length);
    notificationReceived(value);
  });

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

   // .success(function (data, status, headers, config) {
   //            console.log('picking up', JSON.stringify(data), JSON.stringify(status));
   //          }).error(function (data, status, headers, config) {
   //              console.log('There was a problem posting your information' + JSON.stringify(data) + JSON.stringify(status));
   //          });

    }


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




.controller('FeedbackCtrl', function($scope, $http, $window, $ionicSlideBoxDelegate, $ionicModal) {
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

$http.get('https://www.googleapis.com/plus/v1/people/101275194113117307949/activities/public?fields=items%28object%2Fattachments%2FfullImage%2Furl%2Ctitle%29&key=AIzaSyCVVfJSqBg31bhwX_KGMp4mMGQF-kRQ8wQ')
.success(function (data) {
  console.log("I am getting data", data);
  $scope.data = data;
})
.error(function (data) {
  console.log("Error: " + JSON.stringify(data));
});

    

})


