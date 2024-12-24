const express = require("express");

const { createStudyGroup, joinStudyGroup, getStudyGroupsByUser, inviteToStudyGroup, respondToStudyGroupInvite } = require("../controllers/StudyGroupController.js");

module.exports = (io) => {

    const router = express.Router();

    //GET 
    router.get("/:user_id", getStudyGroupsByUser);

    //POST
    router.post("/", createStudyGroup);
    router.post("/join", joinStudyGroup);
    router.post("/invite", inviteToStudyGroup);
    router.post("/respond", respondToStudyGroupInvite);

    return router;
}