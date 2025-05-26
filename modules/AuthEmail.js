const SendOTP = require("./SendOTPOnEmail");
const VerifyOTP = require("./VerifyOTPOnEmail");
const GetUserData = require("../util/getUserData");
const refreshAuth = require("./RefreshAuth");
let refreshStarted = false;
let refreshIntervalId = null;
async function auth({ email }) {
  const sendOTPInstance = new SendOTP();
  await sendOTPInstance.sendOTP(email);

  const verifyOTPInstance = new VerifyOTP();
  await verifyOTPInstance.verifyOTP();

  if (!refreshStarted) {
    startTokenRefresh();
  }
}

function startTokenRefresh() {
  refreshIntervalId = setInterval(async () => {
    try {
      const refreshInstance = new refreshAuth();
      await refreshInstance.refreshAuth();
      console.log("✅ Auth token refreshed");
    } catch (err) {
      console.error("❌ Auth refresh failed:", err.message);
    }
  }, 28 * 60 * 1000); // 28 minutes

  refreshStarted = true;
}

function stopTokenRefresh() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
    refreshStarted = false;
  }
}

module.exports = {
  auth,
  startTokenRefresh,
  stopTokenRefresh
};