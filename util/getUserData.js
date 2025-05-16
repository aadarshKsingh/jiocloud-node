const axios = require('axios');
const context = require("../context");
const getJioHeaders = require("../util/getJioHeaders")
class GetUserData {
  constructor() {
    this.maxRetries = 3;
  }

  async getUserData() {
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
            headers: getJioHeaders(),
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