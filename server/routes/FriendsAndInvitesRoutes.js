const express = require("express");
const {
  sendFriendRequest,
  respondToFriendRequest,
  getFriendsAndInvites,
  removeFriend,
  getAllFriendsInSession,
} = require("../controllers/FriendsAndInvitesController");

module.exports = (io) => {
  const router = express.Router();

  router.post("/send", (req, res) => sendFriendRequest(req, res, io));
  router.post("/respond", (req, res) => respondToFriendRequest(req, res, io));
  router.get("/:user_id", getFriendsAndInvites);
  router.get("/getAllFriendsInSession/:user_id", getAllFriendsInSession);
  router.delete("/removeFriend/:user_id/:friend_id", removeFriend);

  return router;
};
