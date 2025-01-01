"use strict";
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const pool = require("./db.js");
const http = require("http");
const { Server } = require("socket.io");
//auth
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
//initializatoin
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGINS.split(","),
        methods: ["GET", "POST", "PUT"],
    }
});
const port = process.env.PORT;
//middlewares 
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGINS.split(","),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
//Routes
const locationRoutes = require("./routes/LocationRoutes.js");
const studySessionRoutes = require("./routes/StudySessionRoutes.js")(io);
const userRoutes = require("./routes/UserRoutes.js");
const friendsAndInvitesRoutes = require("./routes/FriendsAndInvitesRoutes.js")(io);
const studyGroupRoutes = require("./routes/StudyGroupRoutes.js")(io);
const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"];
    if (!token) {
        res.send("Token not provided");
    }
    else {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.json({ auth: false, message: "Failed to authenticate" });
            }
            else {
                req.userId = decoded.id;
                next();
            }
        });
    }
};
const createAccessToken = (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "3h",
    });
    return accessToken;
};
const createRefreshToken = (id) => {
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET);
    return refreshToken;
};
app.use("/locations", locationRoutes);
app.use("/studysessions", studySessionRoutes);
app.use("/users", userRoutes);
app.use("/friends", friendsAndInvitesRoutes);
app.use("/studygroups", studyGroupRoutes);
app.get("/isUserAuth", verifyJWT, (req, res) => {
    res.send("You are authenticated");
});
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    pool.query("SELECT * FROM users WHERE username = $1", [username], (err, result) => {
        if (err) {
            console.log(err);
        }
        if (result.rows.length > 0) {
            const user = result.rows[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.log(err);
                }
                if (isMatch) {
                    //create access token
                    const id = result.rows[0].user_id;
                    const accessToken = createAccessToken(id);
                    const refreshToken = createRefreshToken(id);
                    //add refresh token to database
                    pool.query(`UPDATE users SET refresh_token = $1 WHERE user_id = $2`, [refreshToken, id], (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log(result);
                    });
                    res.json({
                        auth: true,
                        token: accessToken,
                        result: result.rows[0],
                    });
                }
                else {
                    res.json({ auth: false, message: "Wrong username/password" });
                }
            });
        }
        else {
            res.json({ auth: false, message: "user does not exist" });
        }
    });
});
app.post("/logout", verifyJWT, (req, res) => {
    const username = req.body.username;
    pool.query(`UPDATE users SET refresh_token = $1 WHERE username = $2`, [null, username], (err, result) => {
        if (err) {
            console.log(err);
        }
        res.json({ message: "User logged out succesfully." });
    });
});
app.post("/refresh", (req, res) => {
    //take refresh token from user
    const token = req.body.token;
    //send error if no refresh token
    if (!token) {
        return res
            .sendStatus(401)
            .message("Access denied, you are not authenticated");
    }
    pool.query(`SELECT * FROM users WHERE refresh_token = $1`, [token], (err, result) => {
        if (err) {
            res.status(403).send("Error: could not find refresh token.");
        }
        if (result.rows.length > 0) {
            jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
                if (err) {
                    res.status(403).send("Error: invalid refresh token.");
                }
                //create new access token
                const accessToken = createAccessToken(user.id);
                res.json({ token: accessToken });
            });
        }
        else {
            res.status(403).send("Error: invalid refresh token.");
        }
    });
});
app.post("/register", (req, res) => {
    const { username, password, first_name, last_name } = req.body;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
        }
        pool.query("INSERT INTO users (username, password, first_name, last_name) VALUES($1, $2, $3, $4) RETURNING *", [username, hash, first_name, last_name], (err, result) => {
            if (err) {
                console.log(err);
            }
            res.json(result.rows[0]);
        });
    });
});
app.delete("/delete/:id", verifyJWT, (req, res) => {
    const id = req.params.id;
    pool.query("DELETE FROM users WHERE user_id = $1", [id], (err, result) => {
        if (err) {
            res.status(400).send("Error: could not delete user");
            console.log(err);
        }
        res.status(200).send("User deleted");
    });
});
//listen for socket events
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    //when a user connects, join the room with their user id 
    socket.on("joinRoom", (userId) => {
        socket.join(userId.toString());
        console.log(`User ${userId} joined room ${userId}`);
    });
});
//start server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
