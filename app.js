"use strict";

// Load modules
const express = require("express");
const morgan = require("morgan");
const { sequelize } = require("./models");
const routes = require("./routes");

// This section allows your frontend to make requests to your backend with the NPM CORS Package
// https://stackoverflow.com/questions/43871637/no-access-control-allow-origin-header-is-present-on-the-requested-resource-whe/43881141#43881141
const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";
// create the Express app
const app = express();
app.use(express.json());
app.use("/api", routes);
app.use(cors(corsOptions));

//authentication
sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .then(sequelize.sync())
  .then(() => console.log("Models synced with database"))
  .catch((err) => console.log(`Error: ${err}`));

// setup morgan which gives us http request logging
app.use(morgan("dev"));

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!",
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set("port", process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
