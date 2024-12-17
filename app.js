require("dotenv").config();
require("express-async-errors");
const path = require("path");

//extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();

//connectDB
const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");

//routers
const authRouter = require("./routes/auth");
const watchesRouter = require("./routes/watches");
const cartsRouter = require("./routes/carts");

//error-handler
const errorHandlerMiddleWare = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowsMs: 15 * 60 * 1000, //15minutes
    max: 100, //limit each IP to 100 requests per windowMs
  })
);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/watches", watchesRouter);
app.use("/api/v1/carts", authenticateUser, cartsRouter);

//extra packages

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
