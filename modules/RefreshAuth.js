const axios = require('axios');
const context = require("../context");
const getJioHeaders = require("../util/getJioHeaders")

class RefreshAuth {
    constructor() {
        this.maxRetries = 3;
    }

    async refreshAuth(){
        const refreshPayload =  {
            'deviceType': 'W',
            'jToken': true,
            'refreshToken': context.authToken.refreshToken,
            'isIdamOn': 'true',
            'deviceInfo': {
                'model': 'browser',
                'deviceName': 'Web Device',
                'type': 'browser',
                'isWebClient': true,
                'deviceKey': context.loginInfo.deviceKey,
            },
            'isStaySignIn': true,
        }

        let retries = 0;
        const headers = getJioHeaders({
            'x-session-id': context.loginInfo.sessionId,
            'x-user-id': context.userId,
            'authorization': 'Basic ' + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64'),
            'x-device-key': context.loginInfo.deviceKey,
            'X-User-Id': context.userId,
          });
          
        while (retries < this.maxRetries) {
            try {
                const response = await axios.put(
                    'https://www.jiocloud.com/account/token/refresh', 
                    refreshPayload, 
                    { 
                        headers: headers,
                        timeout: 30000, // 30 second timeout
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity,
                        httpAgent: new (require('http').Agent)({ keepAlive: true }),
                        httpsAgent: new (require('https').Agent)({ keepAlive: true, rejectUnauthorized: false })
                    }
                );
                console.log("refresh called");
                console.log(response);
                context.authToken.accessToken = response.data.accessToken;
                context.authToken.refreshToken = response.data.refreshToken;
                break; // Success, exit retry loop
            } catch (err) {
                retries++;
                if (err.code === 'ECONNRESET' || err.message.includes('socket hang up')) {
                    console.log(`Connection error during auth refresh (socket hangup). Retry ${retries}/${this.maxRetries}...`);
                    if (retries < this.maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
                        continue;
                    }
                }
                console.log(err);
                console.log("Error refreshing auth token:", err.message);
                if (retries >= this.maxRetries) {
                    console.log("Max retries reached. Please re-authenticate.");
                }
            }
        }
    }
}

module.exports = RefreshAuth;