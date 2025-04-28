const db = require("../db/connection");
const { response } = require("./app");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics`).then((result) => {
    return result.rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `No articles with an ID of ${article_id}`,
        });
      }
      return result.rows[0];
    });
};

exports.selectArticles = () => {
  return db
    .query(`SELECT * FROM articles ORDER BY created_at DESC`)
    .then(({ rows }) => {
      const addCommentCount = rows.map((article) => {
        return countComments(article.article_id).then((count) => {
          article.comment_count = count;
          delete article.body;
          return article;
        });
      });
      return Promise.all(addCommentCount);
    });
};

const countComments = (article_id) => {
  return db
    .query("SELECT * FROM comments WHERE article_id = $1", [article_id])
    .then((result) => {
      return result.rows.length;
    });
};

exports.selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
};
