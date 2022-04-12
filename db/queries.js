/** A function that makes a query to the provided database and returns the user object with matching id */
const getUserByID = function(db, id) {
  return db.query(`
  SELECT *
  FROM users
  WHERE id = ${id};
  `)
    .then((result) => {
      console.log("user result", result.rows[0]);
      const user = result.rows[0];
      return user;
    })
    .catch((err) => {
      console.log("get user by id error:", err.message);
    });
};


/** A function that returns an array of maps object with its id and name */
const getMapList = function(db) {
  return db.query(`
  SELECT id, name
  FROM maps
  ORDER BY id DESC;
  `)
    .then((result) => {
      console.log(result.rows);
      const mapList = result.rows;
      return mapList;
    })
    .catch((err) => {
      console.log("getMapList error:", err.message);
    });
};
/** Get a list of all maps that belong to a specific user */
const getMapListByUserID = function(db, id) {
  return db.query(`
  SELECT maps.id, maps.name
  FROM maps
  WHERE owner_id = ${id}
  ORDER BY maps.id
  `)
    .then(res => {
      const myMapList = res.rows;
      return myMapList;
    })
    .catch((err) => {
      console.log("getMapListByUserID error:", err.message);
    });
};

/** Given a map id and user id, return the fav id if existing  */
const getFav = (db, mapID, userID) => {
  return db.query(`
  SELECT favs.id
  FROM favs
  WHERE map_id = $1
  AND user_id = $2;`, [mapID, userID])
    .then(res => {
      const fav = res.rows[0];
      return fav;
    })
    .catch((err) => {
      console.log("getFav error:", err.message);
    });
};

/** Get a list of all favs */
const getFavsMapIDByUserID = (db, id) => {
  return db.query(`
  SELECT map_id FROM favs
  WHERE user_id = ${id}
  ORDER BY id`)
    .then(res => {
      const favs = res.rows;
      return favs;
    })
    .catch((err) => {
      console.log("getFavsMapIDByUserID error:", err.message);
    });
};

/** Get a list of fav maps for a specific user */
const getFavsByUserID = (db, id) => {
  return db.query(`
  SELECT map_id, maps.name
  FROM favs
  JOIN maps ON map_id = maps.id
  WHERE user_id = ${id}
  AND owner_id <> ${id}
  ORDER BY map_id
  `)
    .then(res => {
      const favMaps = res.rows;
      return favMaps;
    })
    .catch((err) => {
      console.log("getFavsByUserID error:", err.message);
    });
};


/** a function to create new fav given a user id and map id */
const insertFav = (db, mapID, userID) => {
  return db.query(`
  INSERT INTO favs (map_id, user_id)
  VALUES ($1, $2)
  RETURNING *`, [mapID, userID])
    .then((newFav) => {
      // $(`#${mapID}`).addClass("liked");
      console.log("newFav inserted", newFav);
    })
    .catch((err) => {
      console.log("insertFav error:", err.message);
    });
};

/** a function to delete the fav given the fav id */
const deleteFav = (db, favID) => {
  return db.query(`
  DELETE FROM favs
  WHERE favs.id = $1`, [favID])
    .then(() => {
      // $(`#${mapID}`).removeClass("liked");
      console.log("fav deleted");
    })
    .catch((err) => {
      console.log("deleteFav error:", err.message);
    });
};
module.exports = { getMapList, getUserByID, getFav, getFavsMapIDByUserID, insertFav, deleteFav, getFavsByUserID, getMapListByUserID};
