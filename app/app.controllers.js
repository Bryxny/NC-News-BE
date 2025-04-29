const {} = require("./app.models");
const fs = require("fs").promises;
const {
  selectTopics,
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
} = require("./app.models");

exports.getApi = (req, res, next) => {
  fs.readFile("./endpoints.json", "utf-8")
    .then((data) => {
      const endpoints = JSON.parse(data);
      res.status(200).send({ endpoints });
    })
    .catch(next);
};

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  selectArticles()
    .then((articles) => {
      res.status(200).send({ articles });
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
