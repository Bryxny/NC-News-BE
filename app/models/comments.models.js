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
