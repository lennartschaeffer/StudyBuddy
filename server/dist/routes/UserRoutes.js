"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const UsersController_1 = require("../controllers/UsersController");
const UserRoutes = () => {
    const router = express_1.default.Router();
    router.get("/getAllUsers/:user_id", UsersController_1.getPotentialFriends);
    return router;
};
exports.UserRoutes = UserRoutes;
