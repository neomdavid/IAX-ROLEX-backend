require("dotenv").config();
require("express-async-errors");
const path = require("path");

// Extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();

// ConnectDB and middleware
const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");

// Routers
const authRouter = require("./routes/auth");
const watchesRouter = require("./routes/watches");
const cartsRouter = require("./routes/carts");

// Error handler middleware
const errorHandlerMiddleWare = require("./middleware/error-handler");

app.set("trust proxy", 1);
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//   })
// );

app.use(express.json());
app.use(helmet());
app.use(cors()); // Ensure that the CORS middleware is correctly configured
app.use(xss());

// Serving static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

//X-Content-Type-Options Header Missing (1058
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

// Serving uploads folder (if needed)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve the index.html file on the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/watches", watchesRouter);
app.use("/api/v1/carts", authenticateUser, cartsRouter);

// Error handler middleware
app.use(errorHandlerMiddleWare);

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server is listening at port ${PORT}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
