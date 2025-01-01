import express from "express";

import {
  deleteUser,
  isUserAuth,
  login,
  logout,
  refresh,
  register,
  verifyJWT,
} from "../controllers/AuthController";

export const AuthRoutes = () => {
  const router = express.Router();

  router.get("/isUserAuth", verifyJWT, isUserAuth);

  router.post("/login", login);

  router.post("/logout", verifyJWT, logout);

  router.post("/refresh", verifyJWT, refresh);

  router.post("/register", register);

  router.delete("/deleteUser/:id", deleteUser);

  return router;
};