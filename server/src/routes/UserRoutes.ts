import express from "express";

import { getPotentialFriends } from "../controllers/UsersController";
import { authMiddleware } from "../controllers/AuthController";

export const UserRoutes = () => {

    const router = express.Router();

    router.get("/getAllUsers/:user_id",authMiddleware, getPotentialFriends);

    return router;
}
