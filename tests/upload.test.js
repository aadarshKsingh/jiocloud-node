const UploadFile = require("../modules/UploadFile");
const fs = require("fs");
const path = require("path");

jest.mock("../modules/UploadFile");

describe("upload test", () => {
    const uploadPath = path.join(__dirname, "..", "Uploads", "test-file.txt");

    beforeEach(() => {
        jest.clearAllMocks();
        UploadFile.prototype.upload = jest.fn().mockResolvedValue();
    });

    afterEach(() => {
        if (fs.existsSync(uploadPath)) {
            fs.unlinkSync(uploadPath);
        }
    });

    test("should upload file successfully", async () => {
        const uploadFileInstance = new UploadFile();

        await uploadFileInstance.upload(uploadPath);

        expect(UploadFile).toHaveBeenCalledWith();
        expect(UploadFile.prototype.upload).toHaveBeenCalledWith(uploadPath);
    });
});