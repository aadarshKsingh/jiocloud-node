const axios = require("axios");
const prompt = require("prompt-sync")();
const context = require("../context");
const getJioHeaders = require("../util/getJioHeaders");

class SendOTPOnNumber {
  constructor() {
    this.maxRetries = 3;
  }

  async send(mobileNumber) {
    context.mobileNumber = mobileNumber

    const data = {
      "mobileNumber": mobileNumber
    };

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios.post(
          "https://api.jiocloud.com/account/jioid/sendotp", 
          data, 
          { 
            headers: getJioHeaders(),
            timeout: 30000, // 30 second timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpAgent: new (require('http').Agent)({ keepAlive: true }),
            httpsAgent: new (require('https').Agent)({ keepAlive: true, rejectUnauthorized: false })
          }
        );
        console.log(response);
        if (response.status === 204) {
          console.log("OTP sent successfully");
          break;
        } 
        else {
          console.log("Failed to send OTP");
          break;
        }
      } catch (err) {
        retries++;
        if (err.code === 'ECONNRESET' || err.message.includes('socket hang up')) {
          console.log(`Connection error during OTP sending (socket hangup). Retry ${retries}/${this.maxRetries}...`);
          if (retries < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
            continue;
          }
        }
        
        if (err.status === 412) {
          console.log("You have made too many OTP requests. Please try after sometime.");
          process.exit();
        }
        
        console.error("Error sending OTP:", err);
        if (retries >= this.maxRetries) {
          console.error("Max retries reached. Please try again later.");
        }
      }
    }
  }

  async sendOTP(mobileNumber) {
    await this.send();
  }
}

module.exports = SendOTPOnNumber;