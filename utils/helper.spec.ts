import jwt from "jsonwebtoken";
import { getJwtToken, sendEmail } from "./helpers";

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValueOnce({
    sendMail: jest
      .fn()
      .mockResolvedValueOnce({ accepted: ["pratham@gmail.com"] }),
  }),
}));

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Utils/helper", () => {
  describe("JWT Token", () => {
    it("Should give JWT token", async () => {
      jest.spyOn(jwt, "sign").mockResolvedValueOnce("JWT_TOKEN");

      let token = await getJwtToken(10);

      expect(token).toBeDefined();
      expect(token).toBe("JWT_TOKEN");
    });
  });

  describe("Send Mail", () => {
    it("should send email", async () => {
      let resp = await sendEmail({});

      expect(resp).toBeDefined();
      expect(resp).toHaveProperty("accepted", ["pratham@gmail.com"]);
    });
  });
});
