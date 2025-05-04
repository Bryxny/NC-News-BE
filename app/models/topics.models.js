const db = require('../../db/connection');

exports.selectTopics = async () => {
  const { rows } = await db.query(`SELECT * FROM topics`);
  return rows;
};

exports.insertTopic = async (slug, description) => {
  const { rows } = await db.query(`INSERT INTO topics(slug, description) VALUES($1, $2) RETURNING *`, [
    slug,
    description,
  ]);
  return rows[0];
};

exports.checkTopicExists = async (topic) => {
  const { rows } = await db.query(`SELECT * FROM topics WHERE slug = $1`, [topic]);
  if (rows.length === 0) {
    throw { status: 404, msg: 'Topic not found' };
  }
};

exports.rejectIfTopicExists = async (slug) => {
  const { rows } = await db.query(`SELECT * FROM topics WHERE slug = $1`, [slug]);
  if (rows.length > 0) {
    throw { status: 400, msg: 'Topic already exists' };
  }
};
