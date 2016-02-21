
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
    var speechText = "Welcome to Motive. I can tell you what your goals are for the day, and keep you motivated. Ask me, What are my goals for today?";
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

        var speech = "Here are your goals for today: "
             + "Your first goal is. " + events[0] 
             + " " 
             + "Your second goal is. " + events[2]
             + " " 
             +" and your third goal is. " + events[4]
             +" "
             +"Have a wonderful day!";

        response.askWithCard(speech, "Goals for the Day", "Goal One: " + events[0] + "\nGoal Two: " + events[2] + "\nGoal Three: " + events[4]);
        return;
    });
}


function achievementIntentRequest(intent, session, response) {
    
    getJsonEventsFromWikipedia(function (events) {
        
        var speech = "";
        var goalFail = 0;

        //CHECK THIS
        if (events[1] == "False") {
            goalFail += 1;

        }
        if (events[3]) == "False") {
            goalFail += 3;
        }
        if (events[5]) == "False") {
            goalFail += 5;
        }

        if (goalFail == 0) {
            speech = "Amazing work today! You completed all of your goals!";
        }

        var oneSpeech = "Great work! You completed two out of three goals. Tommorow, I'm certain that you will make time to ";

        if (goalFail < 4) {
            speech = oneSpeech + events[goalFail];
        }

        var twoSpeech = "Let's do better tomorrow! You did not complete two of your goals, to:  ";
        var twoSpeechctd = ". Nonetheless, I'm proud of you for prioritizing your goal to: ";
            
        if (goalFail == 4) {
            speech = twoSpeech + events[1] + "and" + events[3] + twoSpeechctd + events[5];
        } else if { (goalFail == 6) {
            speech = twoSpeech + events[1] + "and" + events[5] + twoSpeechctd + events[3];
        } else {
            speech = twoSpeech + events[3] + "and" + events[5] + twoSpeechctd + events[1];
        }

        if (goalFail == 9) {
            speech = "We all have days that we miss the mark."
                + " You may not have completed your goals, "
                + "but you'll be making a generous donation to YOUR CHARITY HERE";
        }

        response.askWithCard(speech, "Achievements", "Achievements");
        return;
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
    retArr.push(x.Goals.One.Name);
    retArr.push(x.Goals.One.Status);
    retArr.push(x.Goals.Two.Name);
    retArr.push(x.Goals.Two.Status);
    retArr.push(x.Goals.Three.Name);
    retArr.push(x.Goals.Three.Status);

    return retArr;
}


 

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Motiv Skill.
    var skill = new MotivSkill();
    skill.execute(event, context);

    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('value1 =', event.key1);
    console.log('value2 =', event.key2);
    console.log('value3 =', event.key3);
    console.log('remaining time =', context.getRemainingTimeInMillis());
    console.log('functionName =', context.functionName);
    console.log('AWSrequestID =', context.awsRequestId);
    console.log('logGroupName =', context.logGroupName);
    console.log('logStreamName =', context.logStreamName);
    console.log('clientContext =', context.clientContext);
    if (typeof context.identity !== 'undefined') {
        console.log('Cognity identity ID =', context.identity.cognitoIdentityId);
    }    
    context.succeed(event.key1);  // Echo back the first key value
    // context.fail('Something went wrong');
};