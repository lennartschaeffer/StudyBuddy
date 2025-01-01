import express from "express";

import { getPotentialFriends } from "../controllers/UsersController";

export const UserRoutes = () => {

    const router = express.Router();

    router.get("/getAllUsers/:user_id", getPotentialFriends);

    return router;
}
