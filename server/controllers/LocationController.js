const { get } = require("http");
const pool = require("../db.js");

const getLocations = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM locations;");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

const createLocation = async (req, res) => {
  try {
    const { building_name, room_name, latitude, longitude, busyness_level, additional_info } = req.body;
    const newLocation = await pool.query(
      "INSERT INTO locations (building_name, room_name, latitude, longitude, busyness_level, additional_info) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
      [building_name, room_name, latitude, longitude, busyness_level, additional_info]
    );
    res.json(newLocation.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};


module.exports = {getLocations, createLocation};
