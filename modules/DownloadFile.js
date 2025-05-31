const axios = require('axios');
const path = require('path');
const context = require("../context");
const fs = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);
const getFiles = require("./GetFiles");
const getJioHeaders = require("../util/getJioHeaders")
class DownloadFile {
    async download(objectKey,downloadDir) {
        console.log(downloadDir)
        const downloadsDir = path.join(downloadDir);

        const headers = getJioHeaders({
                    'x-session-id': context.loginInfo.sessionId,
                    'x-user-id': context.userId,
                    'authorization': 'Basic ' + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64'),
                    'x-device-key': context.loginInfo.deviceKey,
                    'X-User-Id': context.userId,
                  })

        try {

            const fileList = new getFiles();
            const files = await fileList.getFiles();
            const file = files.find(obj => obj.objectKey === objectKey);
            console.log(file)
            const response = await axios.get(file.url, {
                headers: headers,
                responseType: 'stream'
            });2

            let filename = file.objectName;
            const disposition = response.headers['content-disposition'];
            if (disposition && disposition.includes('filename=')) {
                filename = disposition.split('filename=')[1].replace(/['"]/g, '');
            }
            // if directory doesnt exist, make one
            if(!fs.existsSync(downloadsDir)){
                fs.mkdirSync(downloadsDir, { recursive: true });
            }
            const downloadPath = path.join(downloadsDir, filename);
            await streamPipeline(response.data, fs.createWriteStream(downloadPath));
            console.log("File downloaded successfully:", filename);
        } catch (error) {
            console.error("Error downloading file:", error.message);
        }
    }

}

module.exports = DownloadFile;
