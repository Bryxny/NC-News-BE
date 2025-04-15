const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate } = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query("DROP TABLE IF EXISTS comments, articles, users, topics CASCADE;")
    .then(() => {
      return db.query(
        `CREATE TABLE topics(slug VARCHAR PRIMARY KEY, description VARCHAR, img_url VARCHAR(1000))`
      );
    })
    .then(() => {
      return db.query(
        "CREATE TABLE users(username VARCHAR PRIMARY KEY, name VARCHAR, avatar_url VARCHAR(1000))"
      );
    })
    .then(() => {
      return db.query(
        "CREATE TABLE articles(article_id SERIAL PRIMARY KEY, title VARCHAR, topic VARCHAR REFERENCES topics(slug), author VARCHAR REFERENCES users(username), body TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, votes INT DEFAULT 0, article_img_url VARCHAR(1000))"
      );
    })
    .then(() => {
      return db.query(
        "CREATE TABLE comments(comment_id SERIAL PRIMARY KEY, article_id INT REFERENCES articles(article_id), body TEXT, votes INT DEFAULT 0, author VARCHAR REFERENCES users(username), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
      );
    })
    .then(() => {
      const topicValues = topicData.map((topic) => {
        return [topic.slug, topic.description, topic.img_url];
      });
      const insertTopics = format(
        `INSERT INTO topics(slug, description, img_url) VALUES %L`,
        topicValues
      );
      return db.query(insertTopics);
    })
    .then(() => {
      const userValues = userData.map((user) => {
        return [user.username, user.name, user.avatar_url];
      });
      const insertUsers = format(
        `INSERT INTO users(username, name, avatar_url) VALUES %L`,
        userValues
      );
      return db.query(insertUsers);
    })
    .then(() => {
      const articleValues = articleData.map((article) => {
        const formattedvalues = convertTimestampToDate(article);
        return [
          formattedvalues.title,
          formattedvalues.topic,
          formattedvalues.author,
          formattedvalues.body,
          formattedvalues.created_at,
          formattedvalues.votes,
          formattedvalues.article_img_url,
        ];
      });
      const insertArticles = format(
        "INSERT INTO articles(title, topic, author, body, created_at, votes, article_img_url) VALUES %L",
        articleValues
      );
      return db.query(insertArticles);
    })
    .then(() => {
      const commentsValues = commentData.map((comment) => {
        const formattedvalues = convertTimestampToDate(comment);
        return [
          formattedvalues.body,
          formattedvalues.article_id,
          formattedvalues.author,
          formattedvalues.votes,
          formattedvalues.created_at,
        ];
      });
      const insertComments = format(
        "INSERT INTO comments(body, article_id, author, votes, created_at) VALUES %L",
        commentsValues
      );
      return db.query(insertComments);
    });
};
module.exports = seed;
