const express = require("express");

const { getAllUsers } = require("../controllers/UsersController");

const router = express.Router();

router.get("/getAllUsers/:user_id", getAllUsers);

module.exports = router;
