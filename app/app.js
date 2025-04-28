const db = require("../db/connection");
const express = require("express");
const app = express();
app.use(express.json());
const { getApi } = require("./app.controllers");
const { errorHandler } = require("./app.errors");

app.get("/api", getApi);

app.use(errorHandler);

module.exports = app;
