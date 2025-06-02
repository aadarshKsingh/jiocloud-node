const axios = require("axios");
const context = require("../context");
const getJioHeaders = require("../util/getJioHeaders")

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

        const headers = getJioHeaders({
                    'x-session-id': context.loginInfo.sessionId,
                    'x-user-id': context.userId,
                    'authorization': 'Basic ' + Buffer.from(context.authToken.accessToken, 'utf-8').toString('base64'),
                    'x-device-key': context.loginInfo.deviceKey,
                    'X-User-Id': context.userId,
                  })

        try{
            const response = await axios.put("https://api.jiocloud.com/security/users/logout", payload , { headers })
            console.log(response.data);
            if(response.status === 204){
                console.log("Successfully logged out")
            }
        }catch(err){
            console.log("Error occurred "+err)
        }
    }
}

module.exports = Logout