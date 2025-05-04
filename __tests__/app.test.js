const endpointsJson = require('../endpoints.json');
const request = require('supertest');
const app = require('../app/app');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data');
const db = require('../db/connection');

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe('GET /api', () => {
  test('200: Responds with an object detailing the documentation for each endpoint', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe('GET /api/invalidURL', () => {
  test('404: Not - found when given an invalid url', () => {
    return request(app)
      .get('/api/invalidURL')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not Found');
      });
  });
});

describe('ARTICLES', () => {
  describe('GET /api/articles/:article_id', () => {
    test('200: Responds with article associated with requested article ID', () => {
      return request(app)
        .get('/api/articles/2')
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
            comment_count: expect.any(Number),
          });
        });
    });
    test('400: Responds with bad request when given invalid path', () => {
      return request(app)
        .get('/api/articles/notANumber')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request');
        });
    });
    test('404: Responds with custom message when given a number not in database', () => {
      return request(app)
        .get('/api/articles/999999')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('No articles with an ID of 999999');
        });
    });
  });

  describe('GET /api/articles', () => {
    test('200: Responds with an array of article objects', () => {
      return request(app)
        .get('/api/articles?limit=200')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toEqual(data.articleData.length);
          expect(body.articles).toBeSortedBy('created_at', {
            descending: true,
          });
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

  describe('GET /api/articles/:article:id/comments', () => {
    test('200: Responds with all comments related to given article_id', () => {
      return request(app)
        .get('/api/articles/3/comments')
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.comments)).toBe(true);
          expect(body.comments.length).toBe(2);
          expect(body.comments).toBeSortedBy('created_at', {
            descending: true,
          });
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
    test('404: Responds with not found when given an invalid path', () => {
      return request(app)
        .get('/api/articles/4/commentz')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('Not Found');
        });
    });
    test('200: Responds with an empty array when no comments exist but article exists', () => {
      return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
        });
    });
    test('404: Responds with custom message when given a number not in database', () => {
      return request(app)
        .get('/api/articles/999999/comments')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('No articles with an ID of 999999');
        });
    });
    test('400: Responds with bad request', () => {
      return request(app)
        .get('/api/articles/notANumber/comments')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request');
        });
    });
  });

  describe('POST /api/articles/:article:id/comments', () => {
    test('201: posts a comment and responods with comment object', () => {
      const comment = {
        username: 'lurker',
        body: 'This is a comment',
      };
      return request(app)
        .post('/api/articles/3/comments')
        .send(comment)
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: 'lurker',
            body: 'This is a comment',
            article_id: 3,
          });
        });
    });
    test("404: responds with message if author isn't a valid user", () => {
      const comment = {
        username: 'bryxny',
        body: 'This is a comment',
      };
      return request(app)
        .post('/api/articles/3/comments')
        .send(comment)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('User not found');
        });
    });
    test("404: responds with message if article doesn't exist", () => {
      const comment = {
        username: 'lurker',
        body: 'This is a comment',
      };
      return request(app)
        .post('/api/articles/9999/comments')
        .send(comment)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('No articles with an ID of 9999');
        });
    });
    test('400: responds with bad request if missing fields', () => {
      const comment = {
        body: '',
      };
      return request(app)
        .post('/api/articles/4/comments')
        .send(comment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Missing required fields');
        });
    });
  });

  describe('PATCH /api/articles/:article_id', () => {
    test('200: updates article at given ID and returns it', () => {
      const incVotes = { inc_votes: 1 };
      return request(app)
        .patch('/api/articles/3')
        .send(incVotes)
        .expect(200)
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
    test('200: updates article at given ID and returns it', () => {
      const incVotes = { inc_votes: -100 };
      return request(app)
        .patch('/api/articles/2')
        .send(incVotes)
        .expect(200)
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
        .patch('/api/articles/99999')
        .send(incVotes)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('No articles with an ID of 99999');
        });
    });
    test('400: responds with bad request if given invalid data', () => {
      const incVotes = { inc_votes: 'notANumber' };
      return request(app)
        .patch('/api/articles/3')
        .send(incVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Invalid Data Type');
        });
    });
    test('400: responds with an error if given empty object', () => {
      const incVotes = [];
      return request(app)
        .patch('/api/articles/3')
        .send(incVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Missing required field');
        });
    });
  });
  describe('GET /api/articles (sorting queries)', () => {
    test('200: Responds with array of articles sorted by created_at and desc by default ', () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy('created_at', {
            descending: 'false',
          });
        });
    });
    test('200: Responds with articles sorted by specified column', () => {
      return request(app)
        .get('/api/articles?sort_by=votes')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy('votes', { descending: 'true' });
        });
    });
    test('200: Responds with articles sorted by specified column', () => {
      return request(app)
        .get('/api/articles?sort_by=article_id&order_by=asc')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy('article_id', {
            ascending: 'true',
          });
        });
    });
    test('400: responds with bad request when given invalid value', () => {
      return request(app)
        .get('/api/articles?sort_by=votez')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Invalid Column');
        });
    });
    test('400: responds with bad request when given invalid value', () => {
      return request(app)
        .get('/api/articles?sort_by=votes&order_by=up')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Invalid Order');
        });
    });
  });

  describe('GET /api/articles (topic query)', () => {
    test('200: Responds with all articles matching topic query', () => {
      return request(app)
        .get('/api/articles?topic=cats')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(1);
          body.articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: 'cats',
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            });
          });
        });
    });
    test('200: Responds with empty array if topic is valid but no related articles', () => {
      return request(app)
        .get('/api/articles?topic=paper')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toEqual([]);
        });
    });
    test('404: Responds with not found of topic doesnt exists', () => {
      return request(app)
        .get('/api/articles?topic=rock')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('Topic not found');
        });
    });
  });

  describe('GET /api/articles?queries', () => {
    test('400: responds with bad request if given an invalid query paramters', () => {
      return request(app)
        .get('/api/articles?filter_by=topic')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Invalid query parameter');
        });
    });
  });

  describe('POST /api/articles', () => {
    test('201: Responds with newly added article', () => {
      const newArticle = {
        author: 'lurker',
        title: 'article about articles',
        body: 'This is an article about how articles are articled',
        topic: 'paper',
        article_img_url: 'https://placebear.com/100/200',
      };
      return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            author: 'lurker',
            title: 'article about articles',
            body: 'This is an article about how articles are articled',
            topic: 'paper',
            article_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            comment_count: expect.any(Number),
            article_img_url: 'https://placebear.com/100/200',
          });
        });
    });
    test('201: Responds with newly added article, url will default if not given', () => {
      const newArticle = {
        author: 'lurker',
        title: 'article about articles',
        body: 'This is an article about how articles are articled',
        topic: 'paper',
      };
      return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            author: 'lurker',
            title: 'article about articles',
            body: 'This is an article about how articles are articled',
            topic: 'paper',
            article_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            comment_count: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
    });
    test('400: Responds with bad request if any fields are missing or invalid', () => {
      const newArticle = {
        title: 'article about articles',
        body: 'This is an article about how articles are articled',
        topic: 'paper',
      };
      return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Missing required fields');
        });
    });
    test('400: Responds with bad request if author or topic doesnt exist', () => {
      const newArticle = {
        author: 'bryxny',
        title: 'article about articles',
        body: 'This is an article about how articles are articled',
        topic: 'articles',
      };
      return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request');
        });
    });
  });

  describe('GET /api/articles pagination', () => {
    test('200: Responds with articles based on limit and page querys', () => {
      return request(app)
        .get('/api/articles?limit=2&p=2')
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(13);
          expect(Array.isArray(body.articles)).toBe(true);
          expect(body.articles.length <= 2).toBe(true);
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
    test('200: Responds with articles based on limit and page querys', () => {
      return request(app)
        .get('/api/articles?topic=cats&limit=2&p=1')
        .expect(200)
        .then(({ body }) => {
          expect(body.total_count).toBe(1);
          expect(body.articles[0]).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: 'cats',
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
    });
    test('400: Responds with bad request if limit or page is invalid', () => {
      return request(app)
        .get('/api/articles?limit=NaN&p=2')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request');
        });
    });
    test('400: Responds with bad request if limit or page is invalid', () => {
      return request(app)
        .get('/api/articles?limit=-6')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request');
        });
    });
    test('200: Responds with empty array but correct_total count when page exceeds articles', () => {
      return request(app)
        .get('/api/articles?p=20')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toEqual([]);
          expect(body.total_count).toBe(13);
        });
    });
  });
});

describe('USERS', () => {
  describe('GET /api/users', () => {
    test('200: Responds with an array of user objects', () => {
      return request(app)
        .get('/api/users')
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
  describe('GET /api/users/:username', () => {
    test('200: Responds with a user object of given username', () => {
      return request(app)
        .get('/api/users/lurker')
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toMatchObject({
            username: 'lurker',
            name: 'do_nothing',
            avatar_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
          });
        });
    });
  });
  test("404: Responds if username doesn't exist", () => {
    return request(app)
      .get('/api/users/bryxny')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User not found');
      });
  });
});

describe('COMMENTS', () => {
  describe('DELETE /api/comments/:comment_id', () => {
    test('204: Responds with no content at given id', () => {
      return request(app)
        .delete('/api/comments/3')
        .expect(204)
        .then((response) => {
          expect(response.noContent).toBe(true);
          return db.query('SELECT * FROM comments WHERE comment_id = 3');
        })
        .then(({ rows }) => {
          expect(rows).toEqual([]);
        });
    });
    test('400: Responds with bad request if given invalid data', () => {
      return request(app)
        .delete('/api/comments/notANumber')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request');
        });
    });
    test('404: Responds with not found if comment doesnt exist', () => {
      return request(app)
        .delete('/api/comments/9999')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('No comment with an ID of 9999');
        });
    });
  });
  describe('PATCH /api/comments/:comment_id', () => {
    test('200: Responds with updated comment object', () => {
      const votes = { inc_votes: 10 };
      return request(app)
        .patch('/api/comments/3')
        .send(votes)
        .expect(200)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: 3,
            article_id: 1,
            body: 'Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.',
            votes: 110,
            author: 'icellusedkars',
            created_at: '2020-03-01T01:13:00.000Z',
          });
        });
    });
    test('200: Responds with updated comment object', () => {
      const votes = { inc_votes: -110 };
      return request(app)
        .patch('/api/comments/3')
        .send(votes)
        .expect(200)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: 3,
            article_id: 1,
            body: 'Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.',
            votes: -10,
            author: 'icellusedkars',
            created_at: '2020-03-01T01:13:00.000Z',
          });
        });
    });
    test('404: Responds with not found if comment doesnt exist', () => {
      const votes = { inc_votes: -110 };
      return request(app)
        .patch('/api/comments/9999')
        .send(votes)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('No comment with an ID of 9999');
        });
    });
    test('400: Responds with bad request if given an empty object', () => {
      const votes = {};
      return request(app)
        .patch('/api/comments/9999')
        .send(votes)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Missing require field');
        });
    });
  });

  describe('GET /api/articles/:article_id/comments pagination', () => {
    test('200: Responds with comments based on article, limit and page querys', () => {
      return request(app)
        .get('/api/articles/1/comments?limit=2&p=2')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(2);
          body.comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              article_id: 1,
              body: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
            });
          });
        });
    });
    test('400: Responds with bad request if limit or page is invalid', () => {
      return request(app)
        .get('/api/articles/1/comments?limit=NaN&p=2')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request');
        });
    });
    test('400: Responds with bad request if limit or page is invalid', () => {
      return request(app)
        .get('/api/articles/1/comments?p=-4')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request');
        });
    });
    test('200: Responds with empty array when page exceeds comments', () => {
      return request(app)
        .get('/api/articles/1/comments?p=20')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
        });
    });
    test('404: Responds with not found if article doesnt exists', () => {
      return request(app)
        .get('/api/articles/9999/comments?p=20')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual('No articles with an ID of 9999');
        });
    });
    test('200: Defaults when limit or p arent provided', () => {
      return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(10);
        });
    });
  });
});

describe('TOPICS', () => {
  describe('GET /api/topics', () => {
    test('200: Responds with an array of topics objects', () => {
      return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          const topics = body.topics;
          expect(Array.isArray(topics)).toBe(true);
          expect(topics.length).toBe(3);
          expect(topics).toEqual(data.topicData);
          topics.forEach((topic) => {
            expect(topic.hasOwnProperty('slug')).toBe(true);
            expect(topic.hasOwnProperty('description')).toBe(true);
          });
        });
    });
  });
  describe('POST /api/topics', () => {
    test('201: Responds with newly created topic', () => {
      const topic = {
        slug: 'dogs',
        description: 'not cats',
      };
      return request(app)
        .post('/api/topics')
        .send(topic)
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).toMatchObject({
            slug: 'dogs',
            description: 'not cats',
            img_url: null,
          });
        });
    });
  });
  test('400: Responds with bad request if any keys are missing', () => {
    const topic = {
      description: 'not cats',
    };
    return request(app)
      .post('/api/topics')
      .send(topic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Missing required fields');
      });
  });
  test('400: Responds with bad request if topic is a duplicate', () => {
    const topic = {
      description: 'what books are made of',
      slug: 'paper',
    };
    return request(app)
      .post('/api/topics')
      .send(topic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Topic already exists');
      });
  });
});
