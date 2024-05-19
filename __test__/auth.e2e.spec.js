import request from "supertest";
import app from "../app";
import { closeDatabase, connectDatabase } from "./db-handler";

let db = Date.now().toString();

beforeAll(async () => {
  await connectDatabase(db);
});

afterAll(async () => {
  await closeDatabase(db);
});

describe("Auth (e2e)", () => {
  describe("(POST) - Register User", () => {
    it("should throw validation error", async () => {
      const res = await request(app)
        .post("/api/v1/register")
        .send({ name: "pratham", email: "pratham@gmail.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Please enter all values");
    });

    it("should register the user", async () => {
      const res = await request(app).post("/api/v1/register").send({
        name: "pratham",
        email: "pratham@gmail.com",
        password: "12345678",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
    });

    it("should throw duplicate email error", async () => {
      const res = await request(app).post("/api/v1/register").send({
        name: "pratham",
        email: "pratham@gmail.com",
        password: "12345678",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Duplicate email");
    });
  });

  describe("(POST) - Login User", () => {
    it("should throw validation error", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({ email: "pratham@gmail.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Please enter email & Password");
    });

    it("should throw invalid email or password error on invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({ email: "pratham2@gmail.com", password: "12345678" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid Email or Password");
    });

    it("should throw invalid email or password error on invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({ email: "pratham@gmail.com", password: "123456789" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid Email or Password");
    });

    it("should login the user", async () => {
      await request(app).post("/api/v1/register").send({
        name: "pravin",
        email: "pratham@gmail.com",
        password: "12345678",
      });
      const res = await request(app)
        .post("/api/v1/login")
        .send({ email: "pratham@gmail.com", password: "12345678" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.token).toBeDefined();
    });
  });

  describe("(404) - Route Not found", () => {
    it("should throw Route not found error", async () => {
      const res = await request(app).get("/invalid-route");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Route not found");
    });
  });
});
