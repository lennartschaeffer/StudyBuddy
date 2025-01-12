"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudyGroupRoutes = void 0;
const AuthController_1 = require("../controllers/AuthController");
const express_1 = __importDefault(require("express"));
const StudyGroupController_1 = require("../controllers/StudyGroupController");
const StudyGroupRoutes = (io) => {
    const router = express_1.default.Router();
    //GET
    router.get("/:user_id", StudyGroupController_1.getStudyGroupsByUser);
    //POST
    router.post("/", AuthController_1.authMiddleware, StudyGroupController_1.createStudyGroup);
    router.post("/join", AuthController_1.authMiddleware, StudyGroupController_1.joinStudyGroup);
    router.post("/invite", AuthController_1.authMiddleware, StudyGroupController_1.inviteToStudyGroup);
    router.post("/respond", AuthController_1.authMiddleware, StudyGroupController_1.respondToStudyGroupInvite);
    return router;
};
exports.StudyGroupRoutes = StudyGroupRoutes;
