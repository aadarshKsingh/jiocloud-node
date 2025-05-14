const axios = require('axios');
const context = require("../context");

class GetFiles {
  constructor() {
    this.maxRetries = 3;
  }
  
  async getFiles() {
    const headers = {
      "Accept": "application/json; charset=UTF-8",
      "Content-Type": "application/json; charset=UTF-8",
      "Origin": "https://www.jiocloud.com",
      "Referer": "https://www.jiocloud.com/",
      "user-agent": "Mozilla/5.0 ...",
      "authorization": "Basic " + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64'),
      "x-client-details": "clientType:ANDROID; appVersion:21.13.27",
      "x-session-id": context.loginInfo.sessionId,
      "x-user-id": context.userAccounts[0].userId,
      "x-app-secret": "ODc0MDE2M2EtNGY0MC00YmU2LTgwZDUtYjNlZjIxZGRkZjlj",
      "x-api-key": "c153b48e-d8a1-48a0-a40d-293f1dc5be0e",
      "accept-language": "en",
      "x-device-key": context.loginInfo.deviceKey,
      "Connection": "keep-alive",
    };

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios.get(
          "https://jaws-api.jiocloud.com/nms/metadata/defaultview/myfiles/v1?limit=10", 
          {
            headers,
            params: {
              folderKey: context.rootFolderKey,
            },
            timeout: 30000, // 30 second timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpAgent: new (require('http').Agent)({ keepAlive: true }),
            httpsAgent: new (require('https').Agent)({ keepAlive: true, rejectUnauthorized: false })
          }
        );
        
        return response.data
        break; // Success, exit retry loop
      } catch (err) {
        retries++;
        if (err.code === 'ECONNRESET' || err.message.includes('socket hang up')) {
          console.log(`Connection error during file fetch (socket hangup). Retry ${retries}/${this.maxRetries}...`);
          if (retries < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
            continue;
          }
        }
        console.error("Error fetching files:", err.message);
        if (retries >= this.maxRetries) {
          console.error("Max retries reached. Please try again later or refresh your authentication.");
          // Try refreshing auth token and retry one more time
          try {
            const RefreshAuth = require('./RefreshAuth');
            const refreshInstance = new RefreshAuth();
            await refreshInstance.refreshAuth();
            console.log("Auth token refreshed, trying one more time...");
            
            // Update the authorization header with the new token
            headers.authorization = "Basic " + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64');
            
            const response = await axios.get(
              "https://jaws-api.jiocloud.com/nms/metadata/defaultview/myfiles/v1", 
              {
                headers,
                params: {
                  folderKey: context.rootFolderKey,
                },
                timeout: 30000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                httpAgent: new (require('http').Agent)({ keepAlive: true }),
                httpsAgent: new (require('https').Agent)({ keepAlive: true, rejectUnauthorized: false })
              }
            );
            return response.data
          } catch (refreshErr) {
            console.error("Final attempt failed after token refresh:", refreshErr.message);
          }
        }
      }
    }
  }
}

module.exports = GetFiles;
