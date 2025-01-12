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
exports.StudySessionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const StudySessionController_1 = require("../controllers/StudySessionController");
const AuthController_1 = require("../controllers/AuthController");
const StudySessionRoutes = (io) => {
    const router = express_1.default.Router();
    //POST
    router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, StudySessionController_1.createStudySession)(req, res, io); }));
    router.post("/group", StudySessionController_1.createGroupStudySession);
    router.put("/completeTask/:task_id", AuthController_1.authMiddleware, StudySessionController_1.completeTask);
    router.put("/completeActiveStudySession/:session_id/:session_type", AuthController_1.authMiddleware, StudySessionController_1.completeActiveStudySession);
    //GET
    router.get("/activeStudySession/:user_id", AuthController_1.authMiddleware, StudySessionController_1.getActiveStudySession);
    router.get("/recentStudySessions/:user_id", AuthController_1.authMiddleware, StudySessionController_1.getRecentStudySessions);
    //router.get("/mapStudySessionInfo/:user_id", getMapStudySessionInfo);
    router.get("/upcomingGroupSessions/:user_id", AuthController_1.authMiddleware, StudySessionController_1.getUpcomingStudySessionsByUser);
    return router;
};
exports.StudySessionRoutes = StudySessionRoutes;
