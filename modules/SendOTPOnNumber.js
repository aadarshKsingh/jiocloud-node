const axios = require("axios");
const prompt = require("prompt-sync")();
const context = require("../context");
const randomUseragent = require('random-useragent');
class SendOTPOnNumber {
  constructor() {
    this.mobileNumber = "";
    this.maxRetries = 3;
  }

  promptUserForMobileNumber() {
    const number = prompt("Enter your mobile number: ");
    this.mobileNumber = number;
    context.mobileNumber = number;
    return number;
  }

  async send() {
    console.log("Sending OTP...");

    const headers = {
      'if-modified-since': '1743771263693',
      "Accept": "application/json; charset=UTF-8",
      "Content-Type": "application/json; charset=UTF-8",
      "Origin": "https://www.jiocloud.com",
      "Referer": "https://www.jiocloud.com/",
      "user-agent": randomUseragent.getRandom(),
      "x-client-details": "clientType:ANDROID; appVersion:21.13.27",
      "x-app-secret": "ODc0MDE2M2EtNGY0MC00YmU2LTgwZDUtYjNlZjIxZGRkZjlj",
      "x-api-key": "c153b48e-d8a1-48a0-a40d-293f1dc5be0e",
      "accept-language": "en",
      "x-Device-Type": "W",
      "Connection": "keep-alive",
      "sec-ch-ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
    };

    // If mobile number is part of the request body, send it in the data object (replace with real key if necessary)
    const data = {
      "mobileNumber": this.mobileNumber, // Example, make sure this matches the actual API requirement
    };

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios.post(
          "https://api.jiocloud.com/account/jioid/sendotp", 
          data, 
          { 
            headers,
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
          break; // Success, exit retry loop
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
        
        console.error("Error sending OTP:", err.message);
        if (retries >= this.maxRetries) {
          console.error("Max retries reached. Please try again later.");
        }
      }
    }
  }

  async sendOTP() {
    this.promptUserForMobileNumber();
    await this.send();
  }
}

module.exports = SendOTPOnNumber;