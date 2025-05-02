const express = require("express");
const usersRouter = express.Router();
const { getUsers } = require("../app.controllers");

usersRouter.get("/", getUsers);

module.exports = usersRouter;
