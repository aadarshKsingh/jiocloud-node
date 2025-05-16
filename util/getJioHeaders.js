const randomUseragent = require('random-useragent');

function getJioHeaders(extraHeaders= {}){
    return {
          "Accept": "application/json; charset=UTF-8",
          "Content-Type": "application/json; charset=UTF-8",
          "Origin": "https://www.jiocloud.com",
          "Referer": "https://www.jiocloud.com/",
          "user-agent": randomUseragent.getRandom(),
          "x-client-details": "clientType:ANDROID; appVersion:21.13.27",
          "x-app-secret": "ODc0MDE2M2EtNGY0MC00YmU2LTgwZDUtYjNlZjIxZGRkZjlj",
          "x-api-key": "c153b48e-d8a1-48a0-a40d-293f1dc5be0e",
          "accept-language": "en",
          "x-Device-Type": "W",
          "Connection": "keep-alive",
          "sec-ch-ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          ...extraHeaders
        };
}

module.exports = getJioHeaders