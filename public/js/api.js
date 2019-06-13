// The Api module is designed to handle all interactions with the server

var Api = (function() {
  var requestPayload;
  var responsePayload;
  var messageEndpoint = '/api/message';

  var sessionEndpoint = '/api/session';

  var sessionId = null;

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,
    getSessionId: getSessionId,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      //console.log(`GET request API Payload: ${JSON.stringify(requestPayload)}`);
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
        //console.log(`SET request API Payload: ${JSON.stringify(newPayloadStr)}`);
        requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      //console.log(`GET response API Payload: ${JSON.stringify(responsePayload)}`);
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      //console.log(`SET response API Payload: ${JSON.stringify(newPayloadStr)}`);
      responsePayload = JSON.parse(newPayloadStr);
    },
    setErrorPayload: function() {
    }
  };

  function getSessionId(callback) {
    var http = new XMLHttpRequest();
    http.open('GET', sessionEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function () {
      if (http.readyState === XMLHttpRequest.DONE) {
        var res = JSON.parse(http.responseText);
        sessionId = res.session_id;
        callback();
      }
    };
    http.send();
  }

  // Send a message request to the server
  function sendRequest(text, context) {
    // Build request payload
    var payloadToWatson = {
      session_id: sessionId
    };

    payloadToWatson.input = {
      message_type: 'text',
      text: text,
    };

    if (context) {
      payloadToWatson.context = context;
    }

    // TODO: IMPORTANT this sends the POST request to the Watson Assistant and gets back the ResponsePayload
    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
      if (http.readyState === XMLHttpRequest.DONE && http.status === 200 && http.responseText) {
        Api.setResponsePayload(http.responseText);
      } else if (http.readyState === XMLHttpRequest.DONE && http.status !== 200) {
        Api.setErrorPayload({
          'output': {
            'generic': [
              {
                'response_type': 'text',
                'text': 'Ups, nešto je pošlo po krivu, molimo Vas da osvježite stranicu, hvala.'
              }
            ],
          }
        });
      }
    };

      // TODO: IMPORTANT this is where we set the newest request payload
    var params = JSON.stringify(payloadToWatson);
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
      Api.setRequestPayload(params);
    }

    // Send request
    http.send(params);
  }
}());
