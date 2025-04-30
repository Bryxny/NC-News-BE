const db = require("../db/connection");
const express = require("express");
const app = express();
app.use(express.json());
const {
  getApi,
  getTopics,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postComment,
  patchArticle,
  deleteCommentById,
} = require("./app.controllers");
const { badRequest, customError } = require("./app.errors");

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postComment);
app.patch("/api/articles/:article_id", patchArticle);
app.delete("/api/comments/:comment_id", deleteCommentById);
app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});
app.use(badRequest);
app.use(customError);
module.exports = app;
