const fs = require("fs").promises;
const {
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
  insertComment,
  updateArticle,
} = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order_by, topic } = req.query;
  const validParams = ["sort_by", "order_by", "topic"];
  const invalidParams = Object.keys(req.query).filter(
    (key) => !validParams.includes(key)
  );
  if (invalidParams.length > 0)
    next({ status: 400, msg: "Invalid query parameter" });

  selectArticles(sort_by, order_by, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};
exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (!inc_votes) {
    return next({ status: 400, msg: "Missing required field" });
  }
  selectArticleById(article_id)
    .then(() => {
      return updateArticle(article_id, inc_votes);
    })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then(() => {
      return selectCommentsByArticleId(article_id);
    })
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if (!username || !body) {
    return next({ status: 400, msg: "Missing required fields" });
  }

  selectArticleById(article_id)
    .then(() => {
      return insertComment(article_id, username, body);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      if (err.code === "23503") {
        next({ status: 404, msg: "User not found" });
      }
      next(err);
    });
};
