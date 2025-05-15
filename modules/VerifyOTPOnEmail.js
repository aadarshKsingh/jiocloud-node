const axios = require("axios");
const context = require("../context");
const prompt = require("prompt-sync")();

class VerifyOTPOnEmail {
    constructor() {
        this.otp = "";
        this.maxRetries = 3;
    }

    promptUserForOTP() {
        const otp = prompt("Enter the OTP: ");
        this.otp = otp;
    }

    async verify() {
        console.log("Verifying OTP...");
        const headers = {
            "Accept": "application/json; charset=UTF-8",
            "Content-Type": "application/json; charset=UTF-8",
            "Origin": "https://www.jiocloud.com",
            "Referer": "https://www.jiocloud.com/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
            "x-client-details": "clientType:ANDROID; appVersion:21.13.27",
            "x-app-secret": "ODc0MDE2M2EtNGY0MC00YmU2LTgwZDUtYjNlZjIxZGRkZjlj",
            "x-api-key": "c153b48e-d8a1-48a0-a40d-293f1dc5be0e",
            "accept-language": "en",
            "Connection": "keep-alive",
        };

        const data = {
            mobileNumber: "",
            emailId: context.email,
            otp: this.otp,
            deviceType: 'W',
            deviceInfo: {
                model: 'browser',
                deviceName: 'Web Device',
                platformType: 'Chrome',
                platformVersion: '134.0.0.0',
                type: 'browser',
                isWebClient: true,
            },
            isStaySignIn: true,
        }


        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                const response = await axios.post(
                    "https://www.jiocloud.com/account/otp/login", 
                    data, 
                    { 
                        headers,
                        timeout: 30000, // 30 second timeout
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    }
                );
                // console.log(response.data)
                context.authToken = response.data.authToken;
                context.rootFolderKey = response.data.rootFolderKey;
                context.userId = response.data.userId;
                context.loginInfo = response.data;
                console.log("OTP verified successfully.");
                if(response.status === 412){
                    console.log("Invalid or expired OTP")
                }
                // console.log(response.data);
                break; // Success, exit the retry loop
                
            } catch (error) {
                retries++;
                if (error.code === 'ECONNRESET' || error.message.includes('socket hang up')) {
                    console.log(`Connection error (socket hangup). Retry ${retries}/${this.maxRetries}...`);
                    if (retries < this.maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
                        continue;
                    }
                }
                console.error("Error verifying OTP:", error);
                if (retries >= this.maxRetries) {
                    console.error("Max retries reached. Please try again later.");
                }
            }
        }
    }

    async verifyOTP() {
        this.promptUserForOTP();
        await this.verify();
    }
}

module.exports = VerifyOTPOnEmail;