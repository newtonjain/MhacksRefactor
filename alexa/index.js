/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Greeter to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */

var APP_ID = "amzn1.echo-sdk-ams.app.cc1875b0-c39b-4303-9379-5546944359f7"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * HelloWorld is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HelloWorld = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HelloWorld.prototype = Object.create(AlexaSkill.prototype);
HelloWorld.prototype.constructor = HelloWorld;

HelloWorld.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HelloWorld onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

HelloWorld.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("HelloWorld onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    // var speechOutput = "Welcome to the Alexa Skills Kit, you can say hello";
    // var repromptText = "You can say hello";
    // response.ask(speechOutput, repromptText);
    handleWelcomeRequest(response);

};

HelloWorld.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("HelloWorld onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

HelloWorld.prototype.intentHandlers = {
    // register custom intent handlers
    "OneshotHelloWorldIntent": function (intent, session, response) {
        handleOneshotHelloWorldRequest(intent, session, response);
    },
    "HelloWorldIntent": function (intent, session, response) {
        response.tellWithCard("Hello World!", "Greeter", "Hello World!");
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say hello to me!", "You can say hello to me!");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var helloWorld = new HelloWorld();
    helloWorld.execute(event, context);
};


// ----------Motiv3 Domain Specific Buisness Logic ------------//

var GOAL = {
    'goal',
    'goals'
};

var ACHIEVE = {
    'achieve',
    'achievement',
    'achievements'
};

function handleWelcomeRequest(response) {
    var speechOutput = {
        speech: "Welcome to Motive. ",
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    },
    repromptOutput = {
        speech: "I can tell you what your goals are"
            + "for the day, and keep you motivated."
            + "Ask me: What are my goals for today?",
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };

    response.ask(speechOutput, repromptOutput);
}

function handleOneshotHelloWorldRequest(intent, response) {
    var userResponse = getGoalFromIntent(intent),
        repromptText,
        speechOutput;
    if (userResponse.error) {
        //Did not understand user response
        speechOutput = "I'm sorry, I didn't understand your request.";
        repromptText = "You can ask: what are my goals for today?"
                    + "Or, you can ask: what did I achieve today?";
        response.ask(speechOutput, repromptText);
        return;
    }
}


function getGoalFromIntent(intent, response) {
    var goalSlot = intent.slots.Goal;
    //testing for missing or provided but empty value slots
    if (!goalSlot || !goalSlot.value) {
        return {
                error: true
        }
    } else {
        //lookup the goal
        if (GOAL[goalSlot.toLowerCase()]) {

                makeGoalRequest(response);
            
            }else if (ACHIEVE[goalSlot.toLowerCase()]) {
                
                makeAchieveRequest(response);
            }else{ 

                return {
                    error: true
                }
            }

    }
}

function makeGoalRequest(response) {
    var speechOutput;
    speechOutput = "I am telling you about your goals.";
    response.tellWithCard(speechOutput, "Motiv3", speechOutput);
    return;
}

function makeAchieveRequest(response) {
    var speechOutput;
    speechOutput = "I am telling you about your achievements.";
    response.tellWithCard(speechOutput, "Motiv3", speechOutput);
    return;
}





