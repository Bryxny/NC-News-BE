const fs = require("fs").promises;
const {
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
  insertComment,
  updateArticle,
  insertArticle,
} = require("../models/articles.models");
const { checkTopicExists } = require("../models/utils.models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = async (req, res, next) => {
  const { sort_by, order_by, topic, limit, p } = req.query;
  const validParams = ["sort_by", "order_by", "topic", "limit", "p"];
  const invalidParams = Object.keys(req.query).filter(
    (key) => !validParams.includes(key)
  );
  if (invalidParams.length > 0)
    next({ status: 400, msg: "Invalid query parameter" });

  try {
    if (topic) {
      await checkTopicExists(topic);
    }
    const { total_count, articles } = await selectArticles(
      sort_by,
      order_by,
      limit,
      p,
      topic
    );
    res.status(200).send({ total_count, articles });
  } catch (err) {
    next(err);
  }
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

exports.postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  if (!author || !title || !body || !topic) {
    next({ status: 400, msg: "Missing required fields" });
  }
  insertArticle(author, title, body, topic, article_img_url)
    .then((article_id) => {
      return selectArticleById(article_id);
    })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
