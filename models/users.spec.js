import User from "./users";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("User Model", () => {
  it("should create a new user", async () => {
    const user = new User({
      name: "Prathamesh",
      email: "pratham@gmail.com",
      password: "12345678",
    });

    expect(user).toHaveProperty("_id");
  });

  it("should throw validation error for required fields", async () => {
    const user = new User();

    jest.spyOn(user, "validate").mockRejectedValueOnce({
      errors: {
        name: "name",
        email: "email",
        password: "password",
      },
    });

    try {
      await user.validate();
    } catch (err) {
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.password).toBeDefined();
    }
  });

  it("should throw password length error", async () => {
    const user = new User({
      name: "Prathamesh",
      email: "pratham@gmail.com",
      password: "123456",
    });

    jest.spyOn(user, "validate").mockRejectedValueOnce({
      errors: {
        password: {
          message: "Your password must be at least 8 characters long",
        },
      },
    });

    try {
      await user.validate();
    } catch (err) {
      expect(err.errors.password).toBeDefined();
      expect(err.errors.password.message).toMatch(
        "Your password must be at least 8 characters long"
      );
    }
  });
});
