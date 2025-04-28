const {} = require("./app.models");
const fs = require("fs").promises;
const { selectTopics } = require("./app.models");

exports.getApi = (req, res, next) => {
  fs.readFile("./endpoints.json", "utf-8")
    .then((data) => {
      const endpoints = JSON.parse(data);
      res.status(200).send({ endpoints });
    })
    .catch((err) => next(err));
};

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => next(err));
};
