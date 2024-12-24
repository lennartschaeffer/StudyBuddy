const express = require("express");
const { sendFriendRequest, respondToFriendRequest, getPendingRequests } = require("../controllers/FriendRequestController");

module.exports = (io) => {
  const router = express.Router();

  router.post("/send", (req, res) => sendFriendRequest(req, res, io));
  router.post("/respond",(req,res) => respondToFriendRequest(req,res,io));
  router.get("/pending/:receiver_id", getPendingRequests)

  return router;
};
