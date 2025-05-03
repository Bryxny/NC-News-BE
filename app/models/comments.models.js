const db = require('../../db/connection');

exports.removeCommentById = async (comment_id) => {
  const { rows } = await db.query('DELETE FROM comments WHERE comment_id = $1 RETURNING *', [comment_id]);
  if (!rows[0]) throw { status: 404, msg: `No comment with an ID of ${comment_id}` };
};

exports.updateCommentById = async (comment_id, inc_votes) => {
  const { rows } = await db.query('UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *', [
    inc_votes,
    comment_id,
  ]);
  if (!rows[0]) throw { status: 404, msg: `No comment with an ID of ${comment_id}` };
  return rows[0];
};
exports.selectCommentsByArticleId = async (article_id, limit = 10, p = 1) => {
  if (!Number.isInteger(Number(limit)) || limit < 1 || !Number.isInteger(Number(p)) || p < 1)
    throw { status: 400, msg: 'Bad Request' };
  const offset = (p - 1) * limit;
  const { rows } = await db.query(
    `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};`,
    [article_id]
  );
  return rows;
};

exports.insertComment = async (article_id, username, body) => {
  const { rows } = await db.query('INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *', [
    username,
    body,
    article_id,
  ]);
  return rows[0];
};
