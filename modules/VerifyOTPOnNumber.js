const axios = require("axios");
const context = require("../context");
const prompt = require("prompt-sync")();
const getJioHeaders = require("../util/getJioHeaders");
class VerifyOTPOnNumber {
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
    
;
    
        const data = {
            mobileNumber: context.mobileNumber,
            otp: this.otp
        };
    
        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                const response = await axios.post(
                    "https://api.jiocloud.com/account/jioid/verifyotp",
                    data,
                    {
                        headers: getJioHeaders(),
                        timeout: 30000
                    }
                );
    
                console.log("Response:", JSON.stringify(response.data, null, 2));
    
                context.requestId = response.data.requestId;
    
                if (Array.isArray(response.data.userAccounts)) {
                    context.userId = response.data.userAccounts[0]?.userId;
                } else if (typeof response.data.userAccounts === 'object') {
                    context.userId = response.data.userAccounts.userId;
                } else {
                    console.warn("Unexpected userAccounts format.");
                }
    
                console.log("OTP verified successfully.");
                break;
    
            } catch (error) {
                retries++;
    
                if (error.response) {
                    console.error(`Request failed with status ${error.response.status}`);
                    console.error("Response data:", error.response.data);
    
                    if (error.response.status === 412) {
                        console.error("Invalid or expired OTP.");
                        break;
                    }
                } else if (error.request) {
                    console.error("No response received from server.");
                } else {
                    console.error("Error setting up request:", error.message);
                }
    
                if (retries < this.maxRetries) {
                    console.log(`Retrying (${retries}/${this.maxRetries})...`);
                    await new Promise(res => setTimeout(res, 2000));
                } else {
                    console.error("Max retries reached.");
                }
            }
        }
    }
    

    async verifyOTP() {
        this.promptUserForOTP();
        await this.verify();
    }
}

module.exports = VerifyOTPOnNumber;