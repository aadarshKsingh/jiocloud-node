const prompt = require("prompt-sync")();
const SendOTPOnNumber = require("./modules/SendOTPOnNumber");
const VerifyOTPOnNumber = require("./modules/VerifyOTPOnNumber");
const SendOTPOnEmail = require("./modules/SendOTPOnEmail");
const VerifyOTPOnEmail = require("./modules/VerifyOTPOnEmail");
const GetFiles = require("./modules/GetFiles");
const GetUserData = require("./util/getUserData");
const refreshAuth = require("./modules/RefreshAuth");
const DownloadFile = require("./modules/DownloadFile");
const Logout = require("./modules/Logout")
const UploadFile = require("./modules/UploadFile")
const context = require("./context")
let refreshIntervalStarted = false;
let refreshInterval = null;

// refreshes auth every 2 minutes
function refreshAuthToken() {
  console.log("Started background auth token refresh every 2 minutes.");
  
  // Clear any existing interval to prevent duplicate refreshes
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  refreshInterval = setInterval(async () => {
    try {
      const refreshInstance = new refreshAuth();
      await refreshInstance.refreshAuth();
      console.log("✅ Auth token refreshed");
    } catch (err) {
      console.error("❌ Failed to refresh auth token:", err.message);
      if (err.code === 'ECONNRESET' || err.message.includes('socket hang up')) {
        console.log("Connection error detected, will retry on next interval");
      } else {
        console.log("Please re-authenticate if this error persists.");
      }
    }
  }, 28 * 60 * 1000); // 2 minutes in milliseconds
  
  // Add cleanup handler for process exit
  process.on('exit', () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
  
  return refreshInterval;
}

async function mainMenu() {
  while (true) {
    console.log("\n==== JioCloud CLI ====");
    console.log("1. Authenticate with number");
    console.log("2. Show Files");
    console.log("3. Exit");
    console.log("4. Download")
    console.log("5. Upload Test")
    console.log("6. Auth with email")
    console.log("7. Show context")
    console.log("======================");

    const choice = prompt("Choose an option: ").trim();

    switch (choice) {
      case "1":
        const sendOtpInstance = new SendOTPOnNumber();
        await sendOtpInstance.sendOTP();

        const verifyOtpInstance = new VerifyOTPOnNumber();
        await verifyOtpInstance.verifyOTP();

        const getUserDataInstance = new GetUserData();
        await getUserDataInstance.getUserData();


        if (!refreshIntervalStarted) {
          refreshAuthToken(); // starts interval
          refreshIntervalStarted = true;
        }
        break;



      case "2":
        const filesInstance = new GetFiles();
        await filesInstance.getFiles();
        break;

      case "3":
        const logoutInstance = new Logout();
        logoutInstance.logout();
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
        process.exit(0);

      case "4":
        const downloadFileInstance = new DownloadFile();
        const objectKey = prompt("Enter object key: ").trim();
        await downloadFileInstance.download(objectKey, "/overlord/Desktop/Downloads");
        break;
      
      case "5":
        const uploadFileInstance = new UploadFile();
        const path = prompt("Enter file path: ").trim()
        await uploadFileInstance.upload(path)
        break;
      case "6":
        const sendOtpEmailInstance = new SendOTPOnEmail();
        await sendOtpEmailInstance.sendOTP();

        const verifyOtpEmailInstance = new VerifyOTPOnEmail();
        await verifyOtpEmailInstance.verifyOTP();
        break;
      case "7":
        console.log(context.loginInfo)
      default:
        console.log("Invalid option. Try again.");
    }
  }
}

mainMenu();