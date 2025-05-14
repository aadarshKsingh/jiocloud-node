const axios = require("axios");
const context = require("../context");

class Logout {
    async logout() {
        const payload = {
            "revokeAll": "N",
            "forceLogout": "N",
            "devices": [
                {
                    "deviceKey": context.loginInfo.deviceKey,
                    "appName": "JioCloud"
                }
            ]
        }
        const headers = {
            "Accept": "application/json; charset=UTF-8",
            "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
            "Authorization": "Basic " +
                Buffer.from(context.authToken.accessToken, "utf-8").toString("base64"),
            "Connection": "keep-alive",
            "Content-Type": "application/json; charset=UTF-8",
            "Origin": "https://www.jiocloud.com",
            "Referer": "https://www.jiocloud.com/home",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
            "X-Api-Key": "c153b48e-d8a1-48a0-a40d-293f1dc5be0e",
            "X-App-Secret": "ODc0MDE2M2EtNGY0MC00YmU2LTgwZDUtYjNlZjIxZGRkZjlj",
            "X-Client-Details": "clientType:WEB; appVersion:78.0.2",
            "X-Device-Key": context.loginInfo.deviceKey,
            "X-Device-Type": "W",
            "X-User-Id": context.userAccounts[0].userId,
            "sec-ch-ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Linux"',
        };

        try{
            const response = await axios.put("https://api.jiocloud.com/security/users/logout", { payload }, headers)
            if(response.status === 204){
                console.log("Successfully logged out")
            }
        }catch(err){
            console.log("Error occurred "+err.message())
        }
    }
}

module.exports = Logout