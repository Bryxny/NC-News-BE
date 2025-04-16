const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (articleArray) => {
  const refObj = {};
  articleArray.forEach((article) => {
    refObj[article.title] = article.article_id;
  });
  return refObj;
};
