const axios = require("axios");
const prompt = require("prompt-sync")();
const context = require("../context");
const getJioHeaders = require("../util/getJioHeaders");
class SendOTPOnEmail {
  constructor() {
    this.maxRetries = 3;
  }


  async send(email) {
    context.email = email;
    const data = {
      emailId: email,
    };
  
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios.post(
          "https://api.jiocloud.com/account/login/otp/send",
          data,
          {
            headers: getJioHeaders(),
            timeout: 30000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            httpAgent: new (require('http').Agent)({ keepAlive: true }),
            httpsAgent: new (require('https').Agent)({ keepAlive: true, rejectUnauthorized: false }),
          }
        );
  
        if (response.status === 204) {
          console.log("OTP sent successfully");
          break; // Success, exit retry loop
        } else {
          console.log("Failed to send OTP");
          break;
        }
      } catch (err) {
        retries++;
  
        if (err.code === 'ECONNRESET' || (err.message && err.message.includes('socket hang up'))) {
          console.log(`Connection error during OTP sending (socket hang up). Retry ${retries}/${this.maxRetries}...`);
          if (retries < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
            continue;
          }
        }
  
        if (err.response) {
          if (err.response.status === 412) {
            console.log("You have made too many OTP requests. Please try after sometime.");
            process.exit(1);
          } else if (err.response.status === 400) {
            console.log("Error:", err.response.data.error || "Bad Request");
            process.exit(1);
          }
        }
  
        console.error("Error sending OTP:", err.message || err);
        
        if (retries >= this.maxRetries) {
          console.error("Max retries reached. Please try again later.");
          process.exit(1);
        }
      }
    }
  }

  async sendOTP(email) {
    await this.send(email);
  }
}

module.exports = SendOTPOnEmail;