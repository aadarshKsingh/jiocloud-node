// index.js

const SendOTPOnNumber = require("./modules/SendOTPOnNumber");
const VerifyOTPOnNumber = require("./modules/VerifyOTPOnNumber");
const SendOTPOnEmail = require("./modules/SendOTPOnEmail");
const VerifyOTPOnEmail = require("./modules/VerifyOTPOnEmail");
const GetFiles = require("./modules/GetFiles");
const GetUserData = require("./util/getUserData");
const refreshAuth = require("./modules/RefreshAuth");
const DownloadFile = require("./modules/DownloadFile");
const UploadFile = require("./modules/UploadFile");
const Logout = require("./modules/Logout");
const context = require("./context");

let refreshIntervalStarted = false;
let refreshInterval = null;

function startTokenRefresh() {
  if (refreshIntervalStarted) return;
  console.log("⏳ Starting background token refresh every 28 minutes...");
  refreshInterval = setInterval(async () => {
    try {
      const refreshInstance = new refreshAuth();
      await refreshInstance.refreshAuth();
      console.log("✅ Token refreshed");
    } catch (err) {
      console.error("❌ Refresh failed:", err.message);
    }
  }, 28 * 60 * 1000);
  refreshIntervalStarted = true;
}

module.exports = {
  auth: async function auth({ mobileNumber }) {
    console.log(mobileNumber)
    const sendOtpInstance = new SendOTPOnNumber();
    await sendOtpInstance.sendOTP(mobileNumber);

    const verifyOtpInstance = new VerifyOTPOnNumber();
    await verifyOtpInstance.verifyOTP();

    const getUserDataInstance = new GetUserData();
    await getUserDataInstance.getUserData();

    startTokenRefresh();
  },

  authEmail: async function authEmail({ email }) {
    const sendOtpEmailInstance = new SendOTPOnEmail();
    await sendOtpEmailInstance.sendOTP(email);

    const verifyOtpEmailInstance = new VerifyOTPOnEmail();
    await verifyOtpEmailInstance.verifyOTP();

    startTokenRefresh();
  },

  upload: async function upload(filePath) {
    const uploader = new UploadFile();
    return await uploader.upload(filePath);
  },

  download: async function download(objectKey,downloadDir) {
    const downloader = new DownloadFile();
    await downloader.download(objectKey,downloadDir);
  },

  getFiles: async function getFiles() {
    const files = new GetFiles();
    return await files.getFiles();
  },

  logout: function logout() {
    const logoutInstance = new Logout();
    logoutInstance.logout();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshIntervalStarted = false;
  },

  getContext: function getContext() {
    return context.loginInfo;
  },

  startTokenRefresh,
};
