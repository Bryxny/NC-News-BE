exports.errorHandler = (err, req, res, next) => {
  if (err) {
    console.log(err);
  } else {
    next(err);
  }
};
