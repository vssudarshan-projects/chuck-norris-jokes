/*Native Node modules*/
const https = require("https");

/*EJS modules*/
const ejs = require("ejs");

/*Express modules*/
const express = require("express");
const bodyParser = require("body-parser");

/*Environment Variables*/
const PORT = process.env.PORT || 3000;
const PATH = __dirname;
const PATH_PUBLIC = PATH + "/public";
const CATEGORY_URI = "https://api.chucknorris.io/jokes/categories";
const JOKE_URI = "https://api.chucknorris.io/jokes/random?category=";
/*Express middleware settings*/
const app = express();
app.use(bodyParser.json());
app.use(express.static(PATH_PUBLIC));
app.set("view engine", "ejs");

/*GET request for page load*/
app.get("/", (req, res) => {
  var session = {
    cat: null,
    res: res,
  };

  getCat(session);
});

app.get("/chuck", (req, res) => {
  if (!req.query) {
    res.send("Bad luck Chuck!");
    return;
  }

  var session = {
    joke: null,
    cat: req.query.category,
    res: res,
  };
  getJoke(session);
});

function getCat(session) {
  var data = [];
  https
    .get(CATEGORY_URI, (resAPI) => {
      resAPI
        .on("data", (chunk) => {
          data.push(chunk);
        })
        .once("error", (err) => {
          console.log("API GET Data Error");
          console.log(err);
          end(session, false);
        });

      resAPI.on("end", () => {

session.cat = JSON.parse(data);

        session.cat.forEach((cat, i) => {
          cat = cat.split("");
          cat[0] = cat[0].toUpperCase();
          cat = cat.join("");
          session.cat[i] = cat;
        });
        end(session, true, "cat");
      });
    })
    .on("error", (err) => {
      console.log("HTTPS GET Error");
      console.log(err);
      end(session, false);
    });
}

function getJoke(session) {
  https
    .get(JOKE_URI + session.cat.toLowerCase(), (resAPI) => {
      var data = [];
      resAPI
        .on("data", (chunk) => {
            data.push(chunk);
        })
        .once("error", (err) => {
          console.log("API GET Data Error");
          console.log(err);
          end(session, false);
        });

      resAPI.on("end", () => {
      session.joke = JSON.parse(data).value;
        end(session, true, "joke");
      });
    })
    .on("error", (err) => {
      console.log("HTTPS GET Error");
      console.log(err);
      end(session, false);
    });
}

function end(session, ok, type) {
  if (ok) {
    switch (type) {
      case "cat":
        session.res.render("index", {
          cat: session.cat,
          joke: null,
        });
        break;

      case "joke":
        console.log(session.joke);
        session.res.render("index", {
          joke: session.joke,
          cat: session.cat,
        });
    }
  } else session.res.send("There was an error. Bad luck Chuck!");
}

app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
