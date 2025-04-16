const db = require("../db/connection");

db.query("SELECT users.name FROM users;").then((result) => {
  console.log(
    `query, select all users, ${JSON.stringify(result.rows, null, 2)}`
  );
});

db.query(
  "SELECT articles.title, articles.topic FROM articles WHERE articles.topic = 'coding';"
).then((result) => {
  console.log(
    `query, select all articles where topic is coding,${JSON.stringify(
      result.rows,
      null,
      2
    )}`
  );
});

db.query(
  "SELECT comments.comment_id, comments.votes FROM comments WHERE comments.votes <= 0;"
).then((result) => {
  console.log(
    `query, select all comments with 0 or less votes,${JSON.stringify(
      result.rows,
      null,
      2
    )}`
  );
});

db.query("SELECT * FROM topics;").then((result) => {
  console.log(
    `query, select all topics,${JSON.stringify(result.rows, null, 2)}`
  );
});

db.query(
  "SELECT articles.title, articles.author FROM articles WHERE articles.author = 'grumpy19';"
).then((result) => {
  console.log(
    `query, select all articles where author is GRUMPY19,${JSON.stringify(
      result.rows,
      null,
      2
    )}`
  );
});

db.query(
  "SELECT comments.comment_id, comments.votes FROM comments WHERE comments.votes >= 10;"
).then((result) => {
  console.log(
    `query, select all comments with 10 or more votes,${JSON.stringify(
      result.rows,
      null,
      2
    )}`
  );
});

db.end();
