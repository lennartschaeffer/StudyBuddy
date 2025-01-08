import express from "express";
import { authMiddleware, getUser, login, logout, signUp } from "../controllers/AuthController";



export const AuthRoutes = () => {
  const router = express.Router();

  router.post('/signup', signUp);

  router.post('/login', login);

  router.post('/logout', authMiddleware, logout);

  router.get('/me', authMiddleware, getUser);

  // router.get("/isUserAuth", verifyJWT, isUserAuth);

  // router.post("/login", login);

  // router.post("/logout", verifyJWT, logout);

  // router.post("/refresh", verifyJWT, refresh);

  // router.post("/register", register);

  // router.delete("/deleteUser/:id", deleteUser);

  return router;
};