"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const AuthRoutes = () => {
    const router = express_1.default.Router();
    router.post('/signup', AuthController_1.signUp);
    router.post('/login', AuthController_1.login);
    router.post('/logout', AuthController_1.authMiddleware, AuthController_1.logout);
    router.get('/me', AuthController_1.authMiddleware, AuthController_1.getUser);
    // router.get("/isUserAuth", verifyJWT, isUserAuth);
    // router.post("/login", login);
    // router.post("/logout", verifyJWT, logout);
    // router.post("/refresh", verifyJWT, refresh);
    // router.post("/register", register);
    // router.delete("/deleteUser/:id", deleteUser);
    return router;
};
exports.AuthRoutes = AuthRoutes;
