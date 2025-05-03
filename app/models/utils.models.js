const db = require("../../db/connection");

exports.checkTopicExists = async (topic) => {
  const { rows } = await db.query(`SELECT * FROM topics WHERE slug = $1`, [
    topic,
  ]);
  if (rows.length === 0) {
    throw { status: 404, msg: "Topic not found" };
  }
};
