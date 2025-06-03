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
      let retries = 0;
      while (retries < this.maxRetries) {
        this.promptUserForOTP();
    
        const data = {
          mobileNumber: context.mobileNumber,
          otp: this.otp
        };
        try {
          const response = await axios.post(
            "https://api.jiocloud.com/account/jioid/verifyotp",
            data,
            {
              headers: getJioHeaders(),
              timeout: 30000
            }
          );

          context.requestId = response.data.requestId;  
          if (Array.isArray(response.data.userAccounts)) {
            context.userId = response.data.userAccounts[0]?.userId;
          } else if (typeof response.data.userAccounts === "object") {
            context.userId = response.data.userAccounts.userId;
          }

          console.log("OTP verified successfully.");
          return;
 
        } catch (error) {
          retries++;
  
          if (error.response) {
            const message = error.response.data?.error || "OTP verification failed.";
            console.error(`Invalid OTP`);
          } else if (error.request) {
            console.error("No response received from server.");
          } else {
            console.error("Request error:", error.message);
          }
  
          if (retries >= this.maxRetries) {
            console.error("Max retries reached. Exiting.");
            process.exit(1);
          }
  
          await new Promise(res => setTimeout(res, 1000)); // Small delay before retry
        }
      }
    }
  
    async verifyOTP() {
      await this.verify();
    }
  }
  
  module.exports = VerifyOTPOnNumber;
  