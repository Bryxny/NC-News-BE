exports.badRequest = (err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23503") {
    res.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
};

exports.customError = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};
