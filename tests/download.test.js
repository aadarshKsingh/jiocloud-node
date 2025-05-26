const DownloadFile = require("../modules/DownloadFile");
const fs = require("fs");
const path = require("path");

jest.mock("../modules/DownloadFile");

describe("download test", () => {
    const downloadPath = path.join(__dirname, "..", "Downloads", "test-file.txt");
    const objectKey = "0DWB23IJ23";
    beforeEach(() => {
        jest.clearAllMocks();
        DownloadFile.prototype.download = jest.fn().mockResolvedValue();
    });
    afterEach(() => {
        if (fs.existsSync(downloadPath)) {
            fs.unlinkSync(downloadPath);
        }
    });

    test("should download file successfully", async () => {
        const downloadFileInstance = new DownloadFile();
       

        await downloadFileInstance.download(objectKey);

        expect(DownloadFile).toHaveBeenCalledWith();
        expect(DownloadFile.prototype.download).toHaveBeenCalledWith(objectKey);
        
    });
});