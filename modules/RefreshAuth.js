const axios = require('axios');
const context = require("../context");

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

        const headers = {
                'Accept': 'application/json; charset=UTF-8',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'Authorization': 'Basic ' + Buffer.from(context.authToken.accessToken,'utf-8').toString('base64'),
                'Connection': 'keep-alive',
                'Content-Type': 'application/json; charset=UTF-8',
                'Origin': 'https://www.jiocloud.com',
                'Referer': 'https://www.jiocloud.com/home',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
                'X-Api-Key': 'c153b48e-d8a1-48a0-a40d-293f1dc5be0e',
                'X-App-Secret': 'ODc0MDE2M2EtNGY0MC00YmU2LTgwZDUtYjNlZjIxZGRkZjlj',
                'X-Client-Details': 'clientType:WEB; appVersion:78.0.2',
                'X-Device-Key': context.loginInfo.deviceKey,
                'X-Device-Type': 'W',
                'X-User-Id': context.userAccounts[0].userId,
                'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
            }

        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                const response = await axios.put(
                    'https://www.jiocloud.com/account/token/refresh', 
                    refreshPayload, 
                    { 
                        headers,
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