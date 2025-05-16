const axios = require('axios');
const context = require("../context");
const path = require("path");
const GetTransactionId = require("../util/getTransactionId");
const fs = require("fs");
const crypto = require("crypto");
const getJioHeaders = require('../util/getJioHeaders');

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
    const headers = getJioHeaders({
      'x-session-id': context.loginInfo.sessionId,
      'authorization': 'Basic ' + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64'),
      'x-device-key': context.loginInfo.deviceKey,
      'X-User-Id': context.userId,
    });  

  let offset = 0;
  let chunkSize = 2 * 1024 * 1024;
  let partNumber = 1;
  const transDetails = await new GetTransactionId().getTransactionId(filePath);
  const uploadId = transDetails.transactionId;

if (!uploadId && transDetails.url) {
  console.log(transDetails.url);
  console.log("🎉 Upload complete.");
}

  console.log(uploadId)
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
      console.log(offset)
      const response = await axios.put(
        uploadUrl,
        buffer,
        {
          headers: {
            ...headers,
            "Content-Length": actualChunkSize,
            "Content-MD5": md5,
            "X-Offset": offset,
            "Content-Type": "application/octet-stream"
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
