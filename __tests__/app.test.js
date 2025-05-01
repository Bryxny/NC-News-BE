const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app/app");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/invalidURL", () => {
  test("404: Not - found when given an invalid url", () => {
    return request(app)
      .get("/api/invalidURL")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topics objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const topics = body.topics;
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBe(3);
        expect(topics).toEqual(data.topicData);
        topics.forEach((topic) => {
          expect(topic.hasOwnProperty("slug")).toBe(true);
          expect(topic.hasOwnProperty("description")).toBe(true);
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with article associated with requested article ID", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 2,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("400: Responds with bad request when given invalid path", () => {
    return request(app)
      .get("/api/articles/notANumber")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: Responds with custom message when given a number not in database", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No articles with an ID of 999999");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toEqual(data.articleData.length);
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
});

describe("GET /api/articles/:article:id/comments", () => {
  test("200: Responds with all comments related to given article_id", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments.length).toBe(2);
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 3,
          });
        });
      });
  });
  test("404: Responds with not found when given an invalid path", () => {
    return request(app)
      .get("/api/articles/4/commentz")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("200: Responds with an empty array when no comments exist but article exists", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test("404: Responds with custom message when given a number not in database", () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No articles with an ID of 999999");
      });
  });
  test("400: Responds with bad request", () => {
    return request(app)
      .get("/api/articles/notANumber/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/articles/:article:id/comments", () => {
  test("201: posts a comment and responods with comment object", () => {
    const comment = {
      username: "lurker",
      body: "This is a comment",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(comment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: "lurker",
          body: "This is a comment",
          article_id: 3,
        });
      });
  });
  test("404: responds with message if author isn't a valid user", () => {
    const comment = {
      username: "bryxny",
      body: "This is a comment",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(comment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found");
      });
  });
  test("404: responds with message if article doesn't exist", () => {
    const comment = {
      username: "lurker",
      body: "This is a comment",
    };
    return request(app)
      .post("/api/articles/9999/comments")
      .send(comment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No articles with an ID of 9999");
      });
  });
  test("400: responds with bad request if missing fields", () => {
    const comment = {
      body: "",
    };
    return request(app)
      .post("/api/articles/4/comments")
      .send(comment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing required fields");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("201: updates article at given ID and returns it", () => {
    const incVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/3")
      .send(incVotes)
      .expect(201)
      .then(({ body }) => {
        const expectedVotes = data.articleData[2].votes + 1;
        expect(body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 3,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expectedVotes,
          article_img_url: expect.any(String),
        });
      });
  });
  test("201: updates article at given ID and returns it", () => {
    const incVotes = { inc_votes: -100 };
    return request(app)
      .patch("/api/articles/2")
      .send(incVotes)
      .expect(201)
      .then(({ body }) => {
        const expectedVotes = data.articleData[1].votes - 100;
        expect(body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 2,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expectedVotes,
          article_img_url: expect.any(String),
        });
      });
  });
  test("404: responds with custom message if article doesn't exist", () => {
    const incVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/99999")
      .send(incVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No articles with an ID of 99999");
      });
  });
  test("400: responds with bad request if given invalid data", () => {
    const incVotes = { inc_votes: "notANumber" };
    return request(app)
      .patch("/api/articles/3")
      .send(incVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: responds with an error if given empty object", () => {
    const incVotes = {};
    return request(app)
      .patch("/api/articles/3")
      .send(incVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing required field");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Responds with no content at given id", () => {
    return request(app)
      .delete("/api/comments/3")
      .expect(204)
      .then((response) => {
        expect(response.noContent).toBe(true);
        return db.query("SELECT * FROM comments WHERE comment_id = 3");
      })
      .then(({ rows }) => {
        expect(rows).toEqual([]);
      });
  });
  test("400: Responds with bad request if given invalid data", () => {
    return request(app)
      .delete("/api/comments/notANumber")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/users", () => {
  test("200: Responds with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toEqual(data.userData.length);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles (sorting queries)", () => {
  test("200: Responds with array of articles sorted by created_at and desc by default ", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", {
          descending: "false",
        });
      });
  });
  test("200: Responds with articles sorted by specified column", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes", { descending: "true" });
      });
  });
  test("200: Responds with articles sorted by specified column", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order_by=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("article_id", { ascending: "true" });
      });
  });
  test("400: responds with bad request when given invalid value", () => {
    return request(app)
      .get("/api/articles?sort_by=votez")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Column");
      });
  });
  test("400: responds with bad request when given invalid value", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order_by=up")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid Order");
      });
  });
});

describe("GET /api/articles (topic query)", () => {
  test("200: Responds with all articles matching topic query", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(1);
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: "cats",
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("404: Responds not found if there's no related articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No articles with a topic of paper");
      });
  });
});
