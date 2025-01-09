require('dotenv').config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { supabase } from "./supabaseClient";
import cookieParser from "cookie-parser";

import bodyParser from "body-parser";


//initializatoin
const app = express();
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process?.env?.CORS_ORIGINS?.split(","),
    methods: ["GET", "POST", "PUT"],
  }
})
const port = process.env.PORT;

//middlewares 
app.use(express.json());
app.use(
  cors({
    origin: process?.env?.CORS_ORIGINS?.split(","),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};


//Routes

import { StudySessionRoutes } from "./routes/StudySessionRoutes";
import { FriendsAndInvitesRoutes } from "./routes/FriendsAndInvitesRoutes";
import { StudyGroupRoutes } from "./routes/StudyGroupRoutes";
import { AuthRoutes } from "./routes/AuthRoutes";
import { UserRoutes } from "./routes/UserRoutes";


app.use("/studysessions", StudySessionRoutes(io));

app.use("/users", UserRoutes())

app.use("/friends", FriendsAndInvitesRoutes(io));

 app.use("/studygroups", StudyGroupRoutes(io));

app.use("/auth", AuthRoutes());

//listen for socket events

io.on("connection", (socket) => {

  //when a user connects, join the room with their user id 
  socket.on("joinRoom", (userId) => {
    socket.join(userId.toString());
  });

})


//start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
