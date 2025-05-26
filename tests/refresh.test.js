const RefreshAuth = require("../modules/RefreshAuth");

jest.mock("../modules/RefreshAuth");
const mobileNumber = "+919999999999";
describe("auth test",()=>{
    beforeEach(() => {
        jest.clearAllMocks();
    
        RefreshAuth.prototype.refreshAuth = jest.fn().mockResolvedValue();
      });

    test('should start token refresh interval',async()=>{
        jest.useFakeTimers();
        const auth = require("../modules/Auth");
        auth.startTokenRefresh();
        expect(RefreshAuth).not.toHaveBeenCalledWith();
        expect(RefreshAuth.prototype.refreshAuth).toHaveBeenCalledTimes(0); // Not called immediately
        jest.advanceTimersByTime(29 * 60 * 1000); // Fast-forward time by 28 minutes
        expect(RefreshAuth.prototype.refreshAuth).toHaveBeenCalled();
    }
    );
});