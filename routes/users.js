/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const { getUserByID, getMapListByUserID, getFavsByUserID, getFavsMapIDByUserID } = require('../db/queries');


const profileRouter = (db) => {
  router.get("/:id", (req, res) => {
    const id = Number.parseInt(req.cookies["user_id"]);
    getUserByID(db, id)
      .then((user)  => {
        res.render("iaan file name", { user });
      })
      .catch((err) => {
        console.log("get/users/:id error:", err.message);
      })
   });

  router.get("/myMapList", (req, res) => {
    const id = Number.parseInt(req.cookies["user_id"]);
    const myMapListPromise = getMapListByUserID(db, id);
    const myFavPromise = getFavsMapIDByUserID(db, id);
    Promise.all([myMapListPromise, myFavPromise])
    .then((values) => {
      res.json(values);
    })
    .catch((err) => {
      console.log("get/myMapList error:", err.message)
    })
  });

  router.get("/myFavMaps", (req, res) => {
    const id = Number.parseInt(req.cookies["user_id"]);
    getFavsByUserID(db, id)
    .then((favMaps) => {
      res.json(favMaps);
    })
    .catch((err) => {
      console.log("get/myFavMaps error:", err.message);
    })
  });
  return router;
};

module.exports = profileRouter;

