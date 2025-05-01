const app = require("./app");
const { PORT = 9090 } = process.env;

app.listen(PORT, (err) => {
  if (err) {
    console.log("Can't connect to port");
  } else {
    console.log(`Server is listening on port ${port}`);
  }
});
