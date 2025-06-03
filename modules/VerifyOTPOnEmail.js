const axios = require("axios");
const context = require("../context");
const prompt = require("prompt-sync")();
const getJioHeaders = require("../util/getJioHeaders");

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
        let retries = 0;

        while (retries < this.maxRetries) {
            this.promptUserForOTP();

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
            };

            try {
                const response = await axios.post(
                    "https://www.jiocloud.com/account/otp/login",
                    data,
                    {
                        headers: getJioHeaders(),
                        timeout: 30000,
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    }
                );

                context.authToken = response.data.authToken;
                context.rootFolderKey = response.data.rootFolderKey;
                context.userId = response.data.userId;
                context.loginInfo = response.data;

                console.log("OTP verified successfully.");
                return;
            } catch (error) {
                retries++;

                if (error.response && error.response.status === 412) {
                    // Invalid OTP
                    console.log("OTP is invalid. Please try again.");
                } else if (error.code === 'ECONNRESET' || (error.message && error.message.includes('socket hang up'))) {
                    console.log(`Connection error (socket hangup). Retry ${retries}/${this.maxRetries}...`);
                } else {
                    console.error("Error verifying OTP:", error.message || error);
                }

                if (retries >= this.maxRetries) {
                    console.error("Max retries reached. Please try again later.");
                    process.exit(1);
                }

                await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds before retrying
            }
        }
    }

    async verifyOTP() {
        await this.verify();
    }
}

module.exports = VerifyOTPOnEmail;