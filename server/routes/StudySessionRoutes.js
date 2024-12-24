const express = require("express");

const {
  createStudySession,
  completeTask,
  getActiveStudySession,
  completeActiveStudySession,
  getRecentStudySessions,
  getMapStudySessionInfo
} = require("../controllers/StudySessionController.js");


module.exports = (io) => {
  const router = express.Router();

  //POST
  router.post("/",(req,res) => createStudySession(req,res,io));

  router.put("/completeTask/:task_id", completeTask);
  router.put("/completeActiveStudySession/:user_id", completeActiveStudySession);

  //GET
  router.get("/activeStudySession/:user_id", getActiveStudySession);
  router.get('/recentStudySessions/:user_id', getRecentStudySessions)
  router.get('/mapStudySessionInfo/:user_id', getMapStudySessionInfo)


  return router;
};






