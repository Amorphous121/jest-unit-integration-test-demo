import jwt from "jsonwebtoken";
import User from "../models/users";
import { isAuthenticatedUser } from "./auth";

jest.setTimeout(10000);

const mockRequest = () => {
  return {
    headers: {
      authorization: "Bearer",
    },
  };
};

const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};

const mockNext = jest.fn();

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Authentication Middleware", () => {
  it("should throw missing authorization header error", async () => {
    const mockReq = (mockRequest().headers = { headers: {} });
    const mockRes = mockResponse();

    await isAuthenticatedUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing Authorization header with Bearer token",
    });
  });

  it("should throw missing jwt error", async () => {
    const mockReq = (mockRequest().headers = {
      headers: { authorization: "Bearer" },
    });
    const mockRes = mockResponse();

    await isAuthenticatedUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Authentication Failed",
    });
  });

  it("should not authenticate user", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
      throw new Error();
    });

    const mockReq = (mockRequest().headers = {
      headers: { authorization: "Bearer abc" },
    });
    const mockRes = mockResponse();

    await isAuthenticatedUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "User authentication failed",
    });
  });

  it("should authenticate user", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({ id: "123456789" });
    jest.spyOn(User, "findById").mockResolvedValueOnce({ id: "123456789" });

    const mockReq = (mockRequest().headers = {
      headers: { authorization: "Bearer abc" },
    });
    const mockRes = mockResponse();

    await isAuthenticatedUser(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
