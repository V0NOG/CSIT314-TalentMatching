import swaggerJSDoc from "swagger-jsdoc";

const PORT = process.env.PORT || 5050;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Talent Matching API",
      version: "1.0.0",
      description: "API documentation for the CSIT314 Talent Matching backend",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local development server",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "User", description: "User account endpoints" },
      { name: "Candidate", description: "Candidate profile endpoints" },
      { name: "Candidates", description: "Candidate listing/search endpoints" },
      { name: "Employer", description: "Employer endpoints" },
      { name: "Jobs", description: "Job listing endpoints" },
      { name: "Recommendations", description: "Matching and recommendation endpoints" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Route not found",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              example: "password123",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: {
              type: "string",
              example: "Connor Drainas",
            },
            email: {
              type: "string",
              format: "email",
              example: "connor@example.com",
            },
            password: {
              type: "string",
              example: "password123",
            },
            role: {
              type: "string",
              enum: ["candidate", "employer"],
              example: "candidate",
            },
          },
        },
        Candidate: {
          type: "object",
          properties: {
            _id: { type: "string", example: "66123456789abcdef012345" },
            fullName: { type: "string", example: "Connor Drainas" },
            email: { type: "string", format: "email", example: "connor@example.com" },
            education: { type: "string", example: "Bachelor of Computer Science" },
            experience: { type: "number", example: 2 },
            skills: {
              type: "array",
              items: { type: "string" },
              example: ["JavaScript", "React", "Node.js"],
            },
          },
        },
        Job: {
          type: "object",
          properties: {
            _id: { type: "string", example: "77123456789abcdef012345" },
            title: { type: "string", example: "Frontend Developer" },
            company: { type: "string", example: "Acme Pty Ltd" },
            description: { type: "string", example: "React developer role" },
            skillsRequired: {
              type: "array",
              items: { type: "string" },
              example: ["React", "JavaScript"],
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;