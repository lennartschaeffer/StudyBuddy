const express = require("express");

const { getLocations, createLocation } = require("../controllers/LocationController.js");

const router = express.Router();

router.get("/", getLocations);

router.post("/", createLocation);

module.exports = router;