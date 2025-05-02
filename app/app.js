const express = require("express");
const app = express();
app.use(express.json());

const { badRequest, customError } = require("./app.errors");

const apiRouter = require("./routes/api-router");

app.use("/api", apiRouter);

app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

app.use(badRequest);

app.use(customError);

module.exports = app;
