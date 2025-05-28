# NC News
For this project I have built a RESTful api using node.js, PostreSQL, and Express. The user can interact with a database of articles, comments, topics, and users via GET, POST, PATCH, and DELETE.

**Live API:** https://nc-news-d9d7.onrender.com/api

## Installation

Run the following commands in your terminal

`git clone https://github.com/Bryxny/NC-News-BE`

`npm install`

## Environments

- Create .env.test file containing `PGDATABASE=nc_news_test`
- Create .env.development file containing `PGDATABASE=nc_news`

## Database Setup

Run the following commands in your terminal

`npm run setup-dbs`

`npm run seed-dev`

## Testing

Check the databases have been created and seeded by running

`npm run test-seed`

`npm t`

## Dependecies

This project requires a minimum of

Node.js v23.8.0

PostgreSQL 14.17
