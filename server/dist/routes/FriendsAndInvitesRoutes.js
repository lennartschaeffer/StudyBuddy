"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendsAndInvitesRoutes = void 0;
const express_1 = __importDefault(require("express"));
const FriendsAndInvitesController_1 = require("../controllers/FriendsAndInvitesController");
const AuthController_1 = require("../controllers/AuthController");
const FriendsAndInvitesRoutes = (io) => {
    const router = express_1.default.Router();
    router.post("/send", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, FriendsAndInvitesController_1.sendFriendRequest)(req, res, io);
    }));
    router.post("/respond", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, FriendsAndInvitesController_1.respondToFriendRequest)(req, res, io);
    }));
    router.get("/:user_id", AuthController_1.authMiddleware, FriendsAndInvitesController_1.getFriendsAndInvites);
    router.get("/getAllFriendsInSession/:user_id", AuthController_1.authMiddleware, FriendsAndInvitesController_1.getAllFriendsInSession);
    router.delete("/removeFriend/:user_id/:friend_id", AuthController_1.authMiddleware, FriendsAndInvitesController_1.removeFriend);
    return router;
};
exports.FriendsAndInvitesRoutes = FriendsAndInvitesRoutes;
