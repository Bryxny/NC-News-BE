const db = require("../../db/connection");

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.comment_id):: INT AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`,
      [article_id]
    )
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 404,
          msg: `No articles with an ID of ${article_id}`,
        });
      }
      return rows[0];
    });
};

exports.selectArticles = (
  sort_by = "created_at",
  order_by = "DESC",
  limit = 10,
  p = 1,
  topic
) => {
  const sortGreenList = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];
  const orderGreenList = ["ASC", "DESC"];
  if (!sortGreenList.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid Column" });
  }
  if (!orderGreenList.includes(order_by.toUpperCase())) {
    return Promise.reject({ status: 400, msg: "Invalid Order" });
  }

  let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url,COUNT(comments.comment_id)::INT AS comment_count FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id`;
  const queryValues = [];

  if (topic) {
    queryStr += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  queryStr += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order_by}`;

  const countPromise = db.query(queryStr, queryValues).then(({ rows }) => {
    return rows.length;
  });

  if (
    Number.isInteger(Number(limit)) &&
    limit > 0 &&
    Number.isInteger(Number(p)) &&
    p > 0
  ) {
    const offset = (p - 1) * limit;
    queryStr += ` LIMIT ${limit} OFFSET ${offset}`;
  } else {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  const articlesPromise = db.query(queryStr, queryValues).then(({ rows }) => {
    return rows;
  });

  return Promise.all([countPromise, articlesPromise]).then(
    ([total_count, articles]) => {
      return { total_count, articles };
    }
  );
};

exports.updateArticle = (article_id, inc_votes) => {
  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *",
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertComment = (article_id, username, body) => {
  return db
    .query(
      "INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *",
      [username, body, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.insertArticle = (
  author,
  title,
  body,
  topic,
  article_img_url = "https://placebear.com/g/200/300"
) => {
  return db
    .query(
      "INSERT INTO articles (author, title, body, topic, article_img_url) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [author, title, body, topic, article_img_url]
    )
    .then(({ rows }) => {
      return rows[0].article_id;
    });
};
