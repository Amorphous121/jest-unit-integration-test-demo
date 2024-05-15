import bcrypt from "bcryptjs";
import User from "../models/users";
import { loginUser, registerUser, test as testCtrl } from "./authController";

jest.mock("../utils/helpers", () => ({
  getJwtToken: jest.fn(() => "jwt_token"),
}));

const mockRequest = () => {
  return {
    body: {
      name: "Test user",
      email: "test@gmail.com",
      password: "123456789",
    },
  };
};

const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};

const mockUser = {
  id: "1234",
  name: "Test user",
  email: "test@gmail.com",
  password: "hashedPassword",
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Register User", () => {
  it("Should register user", async () => {
    jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashedPassword");
    jest.spyOn(User, "create").mockResolvedValueOnce(mockUser);

    const mockReq = mockRequest();
    const mockRes = mockResponse();

    await registerUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(bcrypt.hash).toHaveBeenCalledWith("123456789", 10);
    expect(mockRes.json).toHaveBeenCalledWith({ token: "jwt_token" });
    expect(User.create).toHaveBeenCalledWith({
      name: "Test user",
      email: "test@gmail.com",
      password: "hashedPassword",
    });
  });

  it("should throw validation error", async () => {
    const mockReq = (mockRequest().body = { body: {} });
    const mockRes = mockResponse();

    await registerUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Please enter all values",
    });
  });

  it("should throw duplicate email entered error", async () => {
    jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashedPassword");
    jest.spyOn(User, "create").mockRejectedValueOnce({ code: 11000 });

    const mockReq = mockRequest();
    const mockRes = mockResponse();

    await registerUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Duplicate email" });
  });
});

describe("Login User", () => {
  it("should throw missing email or password error", async () => {
    const mockReq = (mockRequest().body = { body: {} });
    const mockRes = mockResponse();

    await loginUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Please enter email & Password",
    });
  });

  it("should throw invalid email error", async () => {
    const mockReq = mockRequest();
    const mockRes = mockResponse();

    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValueOnce(null),
    }));

    await loginUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid Email or Password",
    });
  });

  it("should throw invalid password error", async () => {
    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);
    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(mockUser),
    }));

    const mockReq = (mockRequest().body = {
      body: { email: "test@gmail.com", password: "123456789" },
    });

    const mockRes = mockResponse();

    await loginUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid Email or Password",
    });
  });

  it("should return the token", async () => {
    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);
    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(mockUser),
    }));

    const mockReq = (mockRequest().body = {
      body: { email: "test@gmail.com", password: "123456789" },
    });

    const mockRes = mockResponse();

    await loginUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      token: "jwt_token",
    });
  });

  describe("Test route", () => {
    it("should return hello", async () => {
      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await testCtrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
