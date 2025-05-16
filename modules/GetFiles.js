const axios = require('axios');
const context = require("../context");
const getJioHeaders = require("../util/getJioHeaders")

class GetFiles {
  constructor() {
    this.maxRetries = 3;
  }
  
  async getFiles() {
    const headers = getJioHeaders({
                'x-session-id': context.loginInfo.sessionId,
                'x-user-id': context.userId,
                'authorization': 'Basic ' + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64'),
                'x-device-key': context.loginInfo.deviceKey,
                'X-User-Id': context.userId,
              })

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios.get(
          "https://jaws-api.jiocloud.com/nms/metadata/defaultview/myfiles/v1", 
          {
            headers: headers,
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
