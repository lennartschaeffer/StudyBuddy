const express = require("express");

const { getFriendsByUser, removeFriend, getAllFriendsInSession } = require("../controllers/FriendsController");

const router = express.Router();

router.get("/:user_id", getFriendsByUser);
router.get("/getAllFriendsInSession/:user_id", getAllFriendsInSession);
router.delete("/removeFriend/:user_id/:friend_id", removeFriend);

module.exports = router;