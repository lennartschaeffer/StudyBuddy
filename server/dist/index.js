"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
//initializatoin
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: (_b = (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.CORS_ORIGINS) === null || _b === void 0 ? void 0 : _b.split(","),
        methods: ["GET", "POST", "PUT"],
    }
});
const port = process.env.PORT;
//middlewares 
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: (_d = (_c = process === null || process === void 0 ? void 0 : process.env) === null || _c === void 0 ? void 0 : _c.CORS_ORIGINS) === null || _d === void 0 ? void 0 : _d.split(","),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
BigInt.prototype.toJSON = function () {
    return this.toString();
};
//Routes
const StudySessionRoutes_1 = require("./routes/StudySessionRoutes");
const FriendsAndInvitesRoutes_1 = require("./routes/FriendsAndInvitesRoutes");
const StudyGroupRoutes_1 = require("./routes/StudyGroupRoutes");
const AuthRoutes_1 = require("./routes/AuthRoutes");
const UserRoutes_1 = require("./routes/UserRoutes");
//test route
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use("/studysessions", (0, StudySessionRoutes_1.StudySessionRoutes)(io));
app.use("/users", (0, UserRoutes_1.UserRoutes)());
app.use("/friends", (0, FriendsAndInvitesRoutes_1.FriendsAndInvitesRoutes)(io));
app.use("/studygroups", (0, StudyGroupRoutes_1.StudyGroupRoutes)(io));
app.use("/auth", (0, AuthRoutes_1.AuthRoutes)());
//listen for socket events
io.on("connection", (socket) => {
    //when a user connects, join the room with their user id 
    socket.on("joinRoom", (userId) => {
        socket.join(userId.toString());
    });
});
//start server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
