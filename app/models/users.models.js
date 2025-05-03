const db = require('../../db/connection');

exports.selectUsers = async () => {
  const { rows } = await db.query('SELECT * FROM users');
  return rows;
};

exports.selectUserByUsername = async (username) => {
  const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  if (!rows[0])
    throw {
      status: 404,
      msg: `User not found`,
    };
  return rows[0];
};
