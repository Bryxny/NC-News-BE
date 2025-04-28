const db = require("../db/connection");
const express = require("express");
const app = express();
app.use(express.json());
const { getApi, getTopics } = require("./app.controllers");
const { errorHandler } = require("./app.errors");

app.get("/api", getApi);
app.get("/api/topics", getTopics);

app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});
app.use(errorHandler);

module.exports = app;
