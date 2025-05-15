const axios = require('axios');
const context = require("../context");
class GetUserData {
  constructor() {
    this.maxRetries = 3;
  }

  async getUserData() {
    const headers = {
      'if-modified-since': '0',
      'x-client-details': 'clientType:ANDROID; appVersion:21.13.27',
      'x-session-id': '09eeabb4e2f544669ba0267695813e5cs',
      'x-user-id': 'eafe06db8c224623932f7a2932314ca9',
      'x-app-secret': 'ODc0MDE2M2EtNGY0MC00YmU2LTgwZDUtYjNlZjIxZGRkZjlj',
      'x-api-key': 'c153b48e-d8a1-48a0-a40d-293f1dc5be0e',
      'accept-language': 'en',
      'x-device-key': 'ffffffff-aa6d-51f3-ffff-ffffcd739c56',
      'content-type': 'application/json; charset=UTF-8',
      'Connection': 'keep-alive',
      'accept-encoding': 'gzip',
      'user-agent': 'okhttp/4.9.2'
    }
    const payload = {
      "userId": context.userId,
      "requestId": context.requestId,
      "deviceType": "W",
      "mobileNumber": context.mobileNumber,
      "deviceInfo": {
        "model": "browser",
        "deviceName": "Web Device",
        "platformType": "Chrome",
        "platformVersion": "135.0.0.0",
        "type": "browser",
        "isWebClient": true
      },
      "isStaySignIn": true
    }

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios.post(
          "https://www.jiocloud.com/account/jioid/useridlogin",
          payload, 
          {
            headers,
            timeout: 30000, // 30 second timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpAgent: new (require('http').Agent)({ keepAlive: true }),
            httpsAgent: new (require('https').Agent)({ keepAlive: true, rejectUnauthorized: false })
          }
        );
        console.log("GET USER DATA")
        console.log(response.data)
        context.authToken = response.data.authToken;
        context.rootFolderKey = response.data.rootFolderKey;
        context.loginInfo = response.data;
        console.log("User data retrieved successfully.");
        break; // Success, exit retry loop
      } catch (err) {
        retries++;
        if (err.code === 'ECONNRESET' || err.message.includes('socket hang up')) {
          console.log(`Connection error during getUserData (socket hangup). Retry ${retries}/${this.maxRetries}...`);
          if (retries < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
            continue;
          }
        }
        console.error("Request failed:", err.message);
        if (retries >= this.maxRetries) {
          console.error("Max retries reached. Please try again later.");
        }
      }
    }
  }
}
module.exports = GetUserData;