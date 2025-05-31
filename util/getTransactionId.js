const axios = require("axios")
const path = require("path")
const context = require("../context")
const fs = require("fs")
const crypto = require("crypto")
const getJioHeaders = require("../util/getJioHeaders")

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
        const headers = getJioHeaders({
                    'x-session-id': context.loginInfo.sessionId,
                    'x-user-id': context.userId,
                    'authorization': 'Basic ' + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64'),
                    'x-device-key': context.loginInfo.deviceKey,
                  })

        
        
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