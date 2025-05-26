const GetFiles = require("../modules/GetFiles");

jest.mock("../modules/GetFiles");

describe("getFiles test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        GetFiles.prototype.getFiles = jest.fn().mockResolvedValue([]);
    });

    test("should fetch files successfully", async () => {
        const getFilesInstance = new GetFiles();
        const files = await getFilesInstance.getFiles();

        expect(GetFiles).toHaveBeenCalledWith();
        expect(GetFiles.prototype.getFiles).toHaveBeenCalledWith();
    });
});