const express = require("express");
const usersRouter = express.Router();
const { getUsers, getUserByUsername } = require("../app.controllers");

usersRouter.route("/").get(getUsers);
usersRouter.route("/:username").get(getUserByUsername);

module.exports = usersRouter;
