const axios = require("axios")
const path = require("path")
const context = require("../context")
const fs = require("fs")
const crypto = require("crypto")
class GetTransactionId{
    getFileInfo(filePath) {
        return new Promise((resolve, reject) => {
          const fileName = path.basename(filePath);
          fs.stat(filePath, (err, stats) => {
            if (err) return reject(err);
      
            const fileSize = stats.size;
      
            const hash = crypto.createHash('md5');
            const stream = fs.createReadStream(filePath);
      
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => {
              const md5Hash = hash.digest('hex');
              resolve({
                name: fileName,
                size: fileSize,
                hash: md5Hash
              });
            });
      
            stream.on('error', reject);
          });
        });
      }
    async getTransactionId(filePath){
        const headers = {
                            'if-modified-since': '1743771263693',
                            'authorization': 'Basic ' + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64'),
                            'x-client-details': 'clientType:ANDROID; appVersion:21.13.27',
                            'x-session-id': context.loginInfo.sessionId,
                            'x-user-id': context.userId,
                            'x-app-secret': 'ODc0MDE2M2EtNGY0MC00YmU2LTgwZDUtYjNlZjIxZGRkZjlj',
                            'x-api-key': 'c153b48e-d8a1-48a0-a40d-293f1dc5be0e',
                            'accept-language': 'en',
                            'x-device-key': context.loginInfo.deviceKey,
                            'content-type': 'application/json; charset=UTF-8',
                            'accept-encoding': 'gzip',
                            'user-agent': 'okhttp/4.9.2',
                            'Connection': 'keep-alive'
                        };

        
        
        const payload = {
            "folderKey":context.rootFolderKey,
            ... await this.getFileInfo(filePath)
        }

        try{
            const response = await axios.post("https://jaws-upload.jiocloud.com/upload/files/chunked/initiate",payload,{headers})
            return response.data
        }
        catch(err){
            console.log(err.message)
        }
    }
    
}

module.exports = GetTransactionId