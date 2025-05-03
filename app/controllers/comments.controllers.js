const fs = require('fs').promises;
const { removeCommentById, updateCommentById } = require('../models/comments.models');

exports.deleteCommentById = async (req, res, next) => {
  const { comment_id } = req.params;
  try {
    await removeCommentById(comment_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.patchCommentById = async (req, res, next) => {
  const { inc_votes } = req.body;
  const { comment_id } = req.params;

  if (inc_votes === undefined) return next({ status: 400, msg: 'Missing require field' });
  if (typeof inc_votes !== 'number') return next({ status: 400, msg: 'Invalid Data Type' });

  try {
    const comment = await updateCommentById(comment_id, inc_votes);
    res.status(200).send({ comment });
  } catch (err) {
    next(err);
  }
};
