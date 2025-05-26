const SendOTPNumber = require("../modules/SendOTPOnNumber");
const VerifyOTPOnNumber = require("../modules/VerifyOTPOnNumber");
const GetUserData = require("../util/getUserData");
const SendOTPEmail = require("../modules/SendOTPOnEmail");
const VerifyOTPEmail = require("../modules/VerifyOTPOnEmail");

jest.mock("../modules/SendOTPOnNumber");
jest.mock("../modules/VerifyOTPOnNumber");
jest.mock("../util/getUserData");
jest.mock("../modules/SendOTPOnEmail");
jest.mock("../modules/VerifyOTPOnEmail");

const mobileNumber = "+919999999999";
const email = "testemail@tuta.com";

describe("auth test",()=>{
    beforeEach(() => {
        jest.clearAllMocks();
    
        SendOTPNumber.prototype.sendOTP = jest.fn().mockResolvedValue();
        VerifyOTPOnNumber.prototype.verifyOTP = jest.fn().mockResolvedValue();
        GetUserData.prototype.getUserData = jest.fn().mockResolvedValue();
        SendOTPEmail.prototype.sendOTP = jest.fn().mockResolvedValue();
        VerifyOTPEmail.prototype.verifyOTP = jest.fn().mockResolvedValue();
      });

    test("should send OTP, verify it, get user data, and start refresh interval", async () => {
    
        
        const authNumber = require("../modules/AuthNumber");
        const authEmail = require("../modules/AuthEmail");
        await authNumber.auth({mobileNumber});

        expect(SendOTPNumber).toHaveBeenCalledWith();
        expect(SendOTPNumber.prototype.sendOTP).toHaveBeenCalledWith(mobileNumber);

        expect(VerifyOTPOnNumber).toHaveBeenCalledWith();
        expect(VerifyOTPOnNumber.prototype.verifyOTP).toHaveBeenCalledWith();

        expect(GetUserData).toHaveBeenCalledWith();
        expect(GetUserData.prototype.getUserData).toHaveBeenCalledWith();

        await authEmail.auth({email});
        
        expect(SendOTPEmail).toHaveBeenCalled();
        expect(SendOTPEmail.prototype.sendOTP).toHaveBeenCalledWith(email);

        expect(VerifyOTPEmail).toHaveBeenCalledWith();
        expect(VerifyOTPEmail.prototype.verifyOTP).toHaveBeenCalledWith();

    });
});