
/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var https = require('https');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * URL prefix to download content
 */
var urlPrefix = 'https://motiv3.firebaseio.com/users/-KB-NfDzpYfAPxDPP1LJ.json';



var MotivSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
MotivSkill.prototype = Object.create(AlexaSkill.prototype);
MotivSkill.prototype.constructor = MotivSkill;

MotivSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("MotivSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

MotivSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("MotivSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

MotivSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

MotivSkill.prototype.intentHandlers = {

    "GoalIntent": function (intent, session, response) {
        goalIntentRequest(intent, session, response);
    },
    "AchievementIntent": function (intent, session, response) {
        achievementIntentRequest(intent, session, response);
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say hello to me!", "You can say hello to me!");
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "Welcome to Motive, your very own personal motivation-donation system";
    var repromptText =  "Ask me, What are my goals for today? Or, ask me, What are my achievements!";
    var speechText = "Welcome to Motive, your very own personal motivation-donation system.";
    var cardOutput = "I can tell you what your goals are for the day, and keep you motivated. Ask me, What are my goals for today?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);

    console.log('Loading function');


}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function goalIntentRequest(intent, session, response) {
    
    getJsonEventsFromWikipedia(function (events) {
        

        console.log(events[0]);
        console.log(events[2]);
        console.log(events[4]);

        var speech = "Here are your goals for today: " + "Your first goal is " + events[0]  + ", " ;
        if(events[2] != undefined){
            speech += "Your second goal is " + events[2] + ", " ;
        }
        if(events[4] != undefined){    
            speech += " and your third goal is. " + events[4] + ".";
        }
        speech += " Have a wonderful day!";

        response.tellWithCard(speech, "Goals for the Day", "Goal One: " + events[0] + "\nGoal Two: " + events[2] + "\nGoal Three: " + events[4]);
 
    });
}


function achievementIntentRequest(intent, session, response) {
    
    getJsonEventsFromWikipedia(function (events) {


        var speech = "";
        var goalFail = 0;

        //ONLY ONE GOAL
        if(events[2] == undefined){
         
            if(events[1])//one goal met
                speech = "Amazing work today! You completed all of your goals!";
            else
                 speech = "We all have days that we miss the mark."
                + " You may not have completed your goals, "
                + "but you'll be making a generous donation to YOUR CHARITY HERE";
            
        }
        else if(events[4] == undefined){//TWO GOALS
            
            if(events[1] && events[3])//both goals met
                speech = "Amazing work today! You completed all of your goals!";
            else if(events[1] && !events[3])
                speech = "Great work! You completed one out of three goals. Tomorrow, I'm certain that you will make time to " + events[3];
            else if(events[3] && !events[1])
                speech = "Great work! You completed one out of three goals. Tomorrow, I'm certain that you will make time to " + events[1]; 
            else 
                speech = "We all have days that we miss the mark."
                + " You may not have completed your goals, "
                + "but you'll be making a generous donation to YOUR CHARITY HERE";

        }
        else{
            if (!events[1]) {
                goalFail += 1;

            }
            if (!events[3]) {
                goalFail += 3;
            }
            if (!events[5]) {
                goalFail += 5;
            }

            if (goalFail == 0) {//all are true
                speech = "Amazing work today! You completed all of your goals!";
            }

            var oneSpeech = "Great work! You completed two out of three goals. Tomorrow, I'm certain that you will make time to ";
            if (goalFail == 1 || goalFail == 3 || goalFail == 5) {//one of them is false & other two are true
                speech = oneSpeech + events[goalFail-1];
            }

            //two are false, one is true
            var twoSpeech = "Let's do better tomorrow! You did not complete two of your goals, to:  ";
            var twoSpeechctd = ". Nonetheless, I'm proud of you for prioritizing your goal to: ";
                
            if (goalFail == 4) {
                speech = twoSpeech + events[0] + " and " + events[2] + twoSpeechctd + events[4];
            } else if  (goalFail == 6) {
                speech = twoSpeech + events[0] + " and " + events[4] + twoSpeechctd + events[2];
            } else if  (goalFail == 8) {
                speech = twoSpeech + events[2] + " and " + events[4] + twoSpeechctd + events[0];
            }

            if (goalFail == 9) {
                speech = "We all have days that we miss the mark."
                    + " You may not have completed your goals, "
                    + "but you'll be making a generous donation to YOUR CHARITY";
            }
        }
        response.tellWithCard(speech, "Achievements", "Achievements");
 
    });
}


function getJsonEventsFromWikipedia(eventCallback) {
    var url = urlPrefix ;

    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = parseJson(body);
            eventCallback(stringResult);

        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

function parseJson(inputText) {

    var x = JSON.parse(inputText);
    console.log(x);
    var retArr = [];

    if(x.Goals.One != undefined){
        retArr.push(x.Goals.One.Name);
        retArr.push(x.Goals.One.Status);
    }
    
    if(x.Goals.Two != undefined){
        retArr.push(x.Goals.Two.Name);
        retArr.push(x.Goals.Two.Status);
    }

    if(x.Goals.Three != undefined){
        retArr.push(x.Goals.Three.Name);
        retArr.push(x.Goals.Three.Status);
    }

    return retArr;
}


 

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Motiv Skill.
    var skill = new MotivSkill();
    skill.execute(event, context);
 
    // console.log('remaining time =', context.getRemainingTimeInMillis());
    // console.log('functionName =', context.functionName);
    // console.log('AWSrequestID =', context.awsRequestId);
    // console.log('logGroupName =', context.logGroupName);
    // console.log('logStreamName =', context.logStreamName);
    // //console.log('clientContext =', context.clientContext);
    // if (typeof context.identity !== 'undefined') {
    //     console.log('Cognity identity ID =', context.identity.cognitoIdentityId);
    // }    
     // context.fail('Something went wrong');
};