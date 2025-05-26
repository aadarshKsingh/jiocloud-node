//generate test for auth
const SendOTP = require("../modules/SendOTPOnNumber");
const VerifyOTP = require("../modules/VerifyOTPOnNumber");
const GetUserData = require("../util/getUserData");

jest.mock("../modules/SendOTPOnNumber");
jest.mock("../modules/VerifyOTPOnNumber");
jest.mock("../util/getUserData");
const mobileNumber = "+919999999999";

describe("auth test",()=>{
    beforeEach(() => {
        jest.clearAllMocks();
    
        SendOTP.prototype.sendOTP = jest.fn().mockResolvedValue();
        VerifyOTP.prototype.verifyOTP = jest.fn().mockResolvedValue();
        GetUserData.prototype.getUserData = jest.fn().mockResolvedValue();
      });

    test("should send OTP, verify it, get user data, and start refresh interval", async () => {
    
        
        const auth = require("../modules/Auth");

        await auth.auth({mobileNumber});

        expect(SendOTP).toHaveBeenCalledWith();
        expect(SendOTP.prototype.sendOTP).toHaveBeenCalledWith(mobileNumber);

        expect(VerifyOTP).toHaveBeenCalledWith();
        expect(VerifyOTP.prototype.verifyOTP).toHaveBeenCalledWith();

        expect(GetUserData).toHaveBeenCalledWith();
        expect(GetUserData.prototype.getUserData).toHaveBeenCalledWith();

    });
});