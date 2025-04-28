const db = require("../db/connection");
const { response } = require("./app");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics`).then((result) => {
    return result.rows;
  });
};
