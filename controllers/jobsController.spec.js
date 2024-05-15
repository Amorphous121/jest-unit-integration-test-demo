import Job from "../models/jobs";
import { deleteJob, getJob, getJobs, newJob, updateJob } from "./jobsController";

const mockJob = {
  _id: "664067296409e8233abAZf93",
  title: "Software Engineer",
  description:
    "We are seeking a skilled Software Engineer to join our dynamic team.",
  email: "example@example.com",
  address: "123 Main Street, City, State, Zip",
  company: "Tech Solutions Inc.",
  industry: ["Information Technology"],
  positions: 2,
  salary: 80000,
  postingDate: "2024-05-12T00:00:00.000Z",
  user: "664067296409e8233abc9f93",
};

const mockRequest = () => {
  return {
    body: {},
    query: {},
    params: {},
    user: {},
  };
};

const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};

afterEach(() => {
  // restore all mocks created by jest.spyon()
  jest.restoreAllMocks();
});

describe("Jobs Controller", () => {
  describe("Get all jobs", () => {
    it("should get all jobs", async () => {
      jest.spyOn(Job, "find").mockImplementationOnce(() => ({
        limit: () => ({ skip: jest.fn().mockResolvedValue([mockJob]) }),
      }));

      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await getJobs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ jobs: [mockJob] });
    });
  });

  describe("Create new job", () => {
    it("should create a new job", async () => {
      jest.spyOn(Job, "create").mockResolvedValueOnce(mockJob);

      const mockRes = mockResponse();
      const mockReq = (mockRequest().body = {
        body: {
          title: "Software Engineer",
          description:
            "We are seeking a skilled Software Engineer to join our dynamic team.",
          email: "example@example.com",
          address: "123 Main Street, City, State, Zip",
          company: "Tech Solutions Inc.",
          positions: 2,
          salary: 80000,
        },
        user: {
          id: "664067296409e8233abc9f93",
        },
      });

      await newJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.status).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenLastCalledWith({ job: mockJob });
    });

    it("should throw validation error", async () => {
      jest
        .spyOn(Job, "create")
        .mockRejectedValueOnce({ name: "ValidationError" });

      const mockRes = mockResponse();
      const mockReq = (mockRequest().body = {
        body: {
          title: "Software Engineer",
        },
        user: {
          id: "664067296409e8233abc9f93",
        },
      });

      await newJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.status).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenLastCalledWith({
        error: "Please enter all values",
      });
    });
  });

  describe("Get job by id", () => {
    it("should get the job by id", async () => {
      jest.spyOn(Job, "findById").mockResolvedValue(mockJob);

      const mockRes = mockResponse();
      const mockReq = (mockRequest().params = {
        params: { id: "664067296409e8233abAZf93" },
      });

      await getJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ job: mockJob });
    });

    it("should throw job not found error", async () => {
      jest.spyOn(Job, "findById").mockResolvedValue(null);

      const mockRes = mockResponse();
      const mockReq = (mockRequest().params = {
        params: { id: "664067296409e8233abAZf93" },
      });

      await getJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should throw invalid id error", async () => {
      jest.spyOn(Job, "findById").mockRejectedValue({ name: "CastError" });

      const mockRes = mockResponse();
      const mockReq = (mockRequest().params = {
        params: { id: "1" },
      });

      await getJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Please enter correct id",
      });
    });
  });

  describe("Update job by id", () => {
    it("should update the job", async () => {
      jest.spyOn(Job, "findById").mockResolvedValueOnce(mockJob);
      jest.spyOn(Job, "findByIdAndUpdate").mockResolvedValueOnce(mockJob);

      const mockRes = mockResponse();
      const mockReq = (mockRequest().params = {
        params: { id: "664067296409e8233abAZf93" },
        body: { title: "NodeJs Developer" },
        user: { id: "664067296409e8233abc9f93" },
      });

      await updateJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ job: mockJob });
    });

    it("should throw job not found error", async () => {
      jest.spyOn(Job, "findById").mockResolvedValueOnce(null);

      const mockRes = mockResponse();
      const mockReq = (mockRequest().params = {
        params: { id: "664067296409e8233abAZf93" },
      });

      await updateJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should throw ownership error", async () => {
      jest.spyOn(Job, "findById").mockResolvedValueOnce(mockJob);

      const mockRes = mockResponse();
      const mockReq = (mockRequest().params = {
        params: { id: "664067296409e8233abAZf93" },
        body: { title: "NodeJs Developer" },
        user: { id: "664067296409e8233abc9f92" },
      });

      await updateJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "You are not allowed to update this job",
      });
    });
  });

  describe("Delete job by id", () => {
    it("should throw job not found error", async () => {
      jest.spyOn(Job, "findById").mockResolvedValueOnce(null);

      const mockReq = (mockRequest().params = {
        params: { id: "664067296409e8233abAZf93" },
      });
      const mockRes = mockResponse();

      await deleteJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Job not found' });
    });

    it("should delete the job", async () => {
      jest.spyOn(Job, "findById").mockResolvedValueOnce(mockJob);
      jest.spyOn(Job, 'findByIdAndDelete').mockResolvedValueOnce(mockJob);

      const mockReq = (mockRequest().params = {
        params: { id: "664067296409e8233abAZf93" },
      });

      const mockRes = mockResponse();

      await deleteJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ job: mockJob });
    });
  });
});
