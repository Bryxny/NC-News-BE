const fs = require("fs").promises;

exports.getApi = (req, res, next) => {
  fs.readFile("./endpoints.json", "utf-8")
    .then((data) => {
      const endpoints = JSON.parse(data);
      res.status(200).send({ endpoints });
    })
    .catch(next);
};
