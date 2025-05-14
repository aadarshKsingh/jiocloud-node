const axios = require('axios');
const path = require('path');
const context = require("../context");
const fs = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);
const getFiles = require("./GetFiles");

class DownloadFile {
    async download(objectKey,dirName) {
        const headers = {
            'if-modified-since': '1743771263693',
            'authorization': 'Basic ' + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64'),
            'x-client-details': 'clientType:ANDROID; appVersion:21.13.27',
            'x-session-id': context.loginInfo.sessionId,
            'x-user-id': context.userAccounts[0].userId,
            'x-app-secret': 'ODc0MDE2M2EtNGY0MC00YmU2LTgwZDUtYjNlZjIxZGRkZjlj',
            'x-api-key': 'c153b48e-d8a1-48a0-a40d-293f1dc5be0e',
            'accept-language': 'en',
            'x-device-key': context.loginInfo.deviceKey,
            'content-type': 'application/json; charset=UTF-8',
            'accept-encoding': 'gzip',
            'user-agent': 'okhttp/4.9.2'
        };

        try {

            const fileList = new getFiles();
            const files = await fileList.getFiles();
            const file = files['objects'].find(obj => obj.objectKey === objectKey);
            console.log(file)
            const response = await axios.get(file.url, {
                headers,
                responseType: 'stream'
            });2

            let filename = file.objectName;
            const disposition = response.headers['content-disposition'];
            if (disposition && disposition.includes('filename=')) {
                filename = disposition.split('filename=')[1].replace(/['"]/g, '');
            }
            // if directory doesnt exist, make one
            if(!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, { recursive: true });
            }
            const downloadPath = path.join(__dirname,"..", "Downloads", filename);
            await streamPipeline(response.data, fs.createWriteStream(downloadPath));
            console.log("File downloaded successfully:", filename);
        } catch (error) {
            console.error("Error downloading file:", error.message);
        }
    }

}

module.exports = DownloadFile;
