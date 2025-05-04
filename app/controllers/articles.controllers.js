const fs = require('fs').promises;
const { selectArticleById, selectArticles, updateArticle, insertArticle } = require('../models/articles.models');
const { checkTopicExists } = require('../models/topics.models');
const { selectCommentsByArticleId, insertComment } = require('../models/comments.models');

exports.getArticleById = async (req, res, next) => {
  const { article_id } = req.params;
  try {
    const article = await selectArticleById(article_id);
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.getArticles = async (req, res, next) => {
  const { sort_by, order_by, topic, limit, p } = req.query;
  const validParams = ['sort_by', 'order_by', 'topic', 'limit', 'p'];
  const invalidParams = Object.keys(req.query).filter((key) => !validParams.includes(key));
  if (invalidParams.length > 0) return next({ status: 400, msg: 'Invalid query parameter' });
  try {
    if (topic) await checkTopicExists(topic);
    const { total_count, articles } = await selectArticles(sort_by, order_by, limit, p, topic);
    res.status(200).send({ total_count, articles });
  } catch (err) {
    next(err);
  }
};

exports.patchArticle = async (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (!inc_votes) return next({ status: 400, msg: 'Missing required field' });
  if (typeof inc_votes !== 'number') return next({ status: 400, msg: 'Invalid Data Type' });

  try {
    await selectArticleById(article_id);
    const article = await updateArticle(article_id, inc_votes);
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.getCommentsByArticleId = async (req, res, next) => {
  const { article_id } = req.params;
  const { limit, p } = req.query;
  try {
    await selectArticleById(article_id);
    const comments = await selectCommentsByArticleId(article_id, limit, p);
    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};

exports.postComment = async (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  if (!username || !body) {
    return next({ status: 400, msg: 'Missing required fields' });
  }
  try {
    await selectArticleById(article_id);
    const comment = await insertComment(article_id, username, body);
    res.status(201).send({ comment });
  } catch (err) {
    if (err.code === '23503') {
      next({ status: 404, msg: 'User not found' });
    }
    next(err);
  }
};

exports.postArticle = async (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  if (!author || !title || !body || !topic) {
    next({ status: 400, msg: 'Missing required fields' });
  }
  try {
    const article_id = await insertArticle(author, title, body, topic, article_img_url);
    const article = await selectArticleById(article_id);
    res.status(201).send({ article });
  } catch (err) {
    next(err);
  }
};
