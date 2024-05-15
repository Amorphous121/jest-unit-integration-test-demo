import { S3Service } from "./s3Service";

const mockFile = {
  name: "image1.jpeg",
  data: "<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff e2 02 1c 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 02 0c 6c 63 6d 73 02 10 00 00 ... 19078 more bytes>",
  size: 19128,
  encoding: "7bit",
  tempFilePath: "",
  truncated: false,
  mimetype: "image/jpeg",
  md5: "f130032ca8fc855c9687e8e14e8f10df",
};

const uploadRes = {
  ETag: "",
  Location:
    "https://pratham-test-bucket.s3.amazonaws.com/test-folder/image1.jpeg",
  key: "test-folder/image1.jpeg",
  Key: "test-folder/image1.jpeg",
  Bucket: "pratham-test-bucket",
};

jest.mock("aws-sdk", () => ({
  S3: jest.fn(() => ({
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValueOnce(uploadRes),
  })),
}));

describe("S3 File upload", () => {
  it("should upload the file", async () => {
    const s3Service = new S3Service();
    const resp = await s3Service.upload(mockFile);

    expect(resp).toBeDefined();
    expect(resp).toHaveProperty('Location')
  });
});
