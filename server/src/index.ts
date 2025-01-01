require('dotenv').config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import pool from "./db.js";
import http from "http";
import { Server } from "socket.io";

//auth
import bcrypt from "bcrypt";
const saltRounds = 10;
import jwt from "jsonwebtoken";

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
  console.log(`User connected: ${socket.id}`)

  //when a user connects, join the room with their user id 
  socket.on("joinRoom", (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined room ${userId}`);
  });

})


//start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
