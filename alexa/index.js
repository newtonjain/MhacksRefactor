
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
    var cardTitle = "Welcome to Motive";
    var repromptText = "I can tell you what your goals are for the day, and keep you motivated. Ask me, What are my goals for today?";
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
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function goalIntentRequest(intent, session, response) {
    
    getJsonEventsFromWikipedia(function (events) {
        

        console.log(events[0]);
        console.log(events[2]);
        console.log(events[4]);

        var speech = "Goals " + events[0] + events[2] + events[4];
        response.askWithCard(speech, "", "card");
        return;
    });
}


function achievementIntentRequest(intent, session, response) {
    
    getJsonEventsFromWikipedia(function (events) {
        

        console.log(events[0]);
        console.log(events[1]);
        console.log(events[2]);
        console.log(events[3]);
        console.log(events[4]);
        console.log(events[5]);

        var speech = "Goals " + events[0] + events[1] + events[2] + events[3] + events[4]+ events[5] ;
        response.askWithCard(speech, "", "card");
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
};