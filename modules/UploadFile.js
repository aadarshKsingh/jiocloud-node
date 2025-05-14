const axios = require('axios');
const context = require("../context");
const path = require("path");
const GetTransactionId = require("../util/getTransactionId");
const fs = require("fs");
const crypto = require("crypto")

class UploadFile {
    async generateMD5(filePath) {
        return new Promise((resolve, reject) => {
          const hash = crypto.createHash('md5');
          const stream = fs.createReadStream(filePath);
      
          stream.on('data', (data) => hash.update(data));
          stream.on('end', () => resolve(hash.digest('hex')));
          stream.on('error', (err) => reject(err));
        });
      }

  async upload(filePath) {
    const baseHeaders = {
      'if-modified-since': '1743771263693',
      'authorization': 'Basic ' + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64'),
      'x-client-details': 'clientType:ANDROID; appVersion:21.13.27',
      'x-session-id': context.loginInfo.sessionId,
      'x-user-id': context.userAccounts[0].userId,
      'x-app-secret': 'ODc0MDE2M2EtNGY0MC00YmU2LTgwZDUtYjNlZjIxZGRkZjlj',
      'x-api-key': 'c153b48e-d8a1-48a0-a40d-293f1dc5be0e',
      'accept-language': 'en',
      'x-device-key': context.loginInfo.deviceKey,
      'content-type': 'application/octet-stream',
      'accept-encoding': 'gzip',
      'user-agent': 'okhttp/4.9.2',
      'Connection': 'keep-alive',
    };

  let offset = 0;
  let chunkSize = 2 * 1024 * 1024;
  let partNumber = 1;
  const { transactionId: uploadId } = await new GetTransactionId().getTransactionId(filePath);
  const uploadUrl = `https://jaws-upload.jiocloud.com/upload/files/chunked?uploadId=${uploadId}`;
  const fileSize = fs.statSync(filePath).size;
  const file = fs.openSync(filePath, "r");
  let objectKey = null;
  
  while (!objectKey && offset < fileSize) {
    const actualChunkSize = Math.min(chunkSize, fileSize - offset);
    const buffer = Buffer.alloc(actualChunkSize);
    fs.readSync(file, buffer, 0, actualChunkSize, offset);
  
    const md5 = crypto.createHash("md5").update(buffer).digest("hex");
    console.log(md5)
    console.log(`📦 Part ${partNumber}: offset ${offset}, size ${actualChunkSize}, md5 ${md5}`);
  
    try {
      const response = await axios.put(
        uploadUrl,
        buffer,
        {
          headers: {
            ...baseHeaders,
            "Content-Length": actualChunkSize,
            "Content-MD5": md5,
            "x-offset": offset,
          },
        }
      );
  
      console.log(`✅ Uploaded part ${partNumber}:`, response.status);
  
      // Check if upload completed
      if (response.data.objectKey) {
        objectKey = response.data.objectKey;
        console.log("✅ Upload completed. objectKey:", objectKey);
        break;
      }
  
      // Update offset if present
      if (response.data.offset !== undefined) {
        offset = response.data.offset;
      } else {
        offset += actualChunkSize; // fallback
      }
  
      chunkSize *= 2;
      partNumber++;
  
    } catch (err) {
      console.error(`❌ Failed at part ${partNumber}:`, err);
      break;
    }
  }
  
  console.log(objectKey)
  fs.closeSync(file);
  console.log("🎉 Upload complete.");
}
}

module.exports = UploadFile;
