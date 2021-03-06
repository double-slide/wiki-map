// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require('cookie-parser');

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users",usersRoutes(db) );
app.use("/api/widgets", widgetsRoutes(db));

// Note: mount other resources here, using the same pattern above
const loginRouter = require("./routes/login");
app.use("/login", loginRouter);

const mapsRouter = require("./routes/maps");
app.use("/maps", mapsRouter(db));

const favRouter = require("./routes/favs");
app.use("/favs", favRouter(db))

const usersRouter = require("./routes/users");
app.use("/users", usersRouter(db));
// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

// app.get("/", (req, res) => {
//   // res.send("Wrong route.");
//   res.redirect("maps");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
