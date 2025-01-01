import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../db";

//extend the Request interface to include userId
declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

//salt rounds for hashing pw
const saltRounds = 10;

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["x-access-token"];
    
  if (!token) {
    res.send("Token not provided");
  } else {
    jwt.verify(token[0], process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "Failed to authenticate" });
      } else {
        req.userId = (decoded as jwt.JwtPayload)?.id;
        next();
      }
    });
  }
};

const createAccessToken = (id: number) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "3h",
  });
  return accessToken;
};

const createRefreshToken = (id: number) => {
  const refreshToken = jwt.sign({ id },  process.env.JWT_REFRESH_SECRET!);
  return refreshToken;
};

const isUserAuth = async(req: Request, res: Response) => {
  res.send("You are authenticated");
};

const login = async(req: Request, res: Response) => {
  const { username, password } = req.body;
  pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.rows.length > 0) {
        const user = result.rows[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.log(err);
          }
          if (isMatch) {
            //create access token
            const id = result.rows[0].user_id;
            const accessToken = createAccessToken(id);
            const refreshToken = createRefreshToken(id);
            //add refresh token to database
            pool.query(
              `UPDATE users SET refresh_token = $1 WHERE user_id = $2`,
              [refreshToken, id],
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                console.log(result);
              }
            );
            res.json({
              auth: true,
              token: accessToken,
              result: result.rows[0],
            });
          } else {
            res.json({ auth: false, message: "Wrong username/password" });
          }
        });
      } else {
        res.json({ auth: false, message: "user does not exist" });
      }
    }
  );
};

const logout = async(req: Request, res: Response) => {
  const username = req.body.username;
  pool.query(
    `UPDATE users SET refresh_token = $1 WHERE username = $2`,
    [null, username],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.json({ message: "User logged out succesfully." });
    }
  );
};

const refresh = async (req: Request, res: Response)=> {
  //take refresh token from user
  const token = req.body.token;
  //send error if no refresh token
  if (!token) {
    res.status(401).send("Access denied, you are not authenticated" );
  }
  pool.query(
    `SELECT * FROM users WHERE refresh_token = $1`,
    [token],
    (err, result) => {
      if (err) {
        res.status(403).send("Error: could not find refresh token.");
      }
      if (result.rows.length > 0) {
        try {
          jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
          const user = result.rows[0];
          const accessToken = createAccessToken(user.id);
          res.json({ token: accessToken });
        } catch (error) {
          res.status(403).send("Error: invalid refresh token.");
        }
      } else {
        res.status(403).send("Error: invalid refresh token.");
      }
    }
  );
};

const register = async (req: Request, res: Response) => {
  const { username, password, first_name, last_name } = req.body;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }
    pool.query(
      "INSERT INTO users (username, password, first_name, last_name) VALUES($1, $2, $3, $4) RETURNING *",
      [username, hash, first_name, last_name],
      (err, result) => {
        if (err) {
          console.log(err);
        }
        res.json(result.rows[0]);
      }
    );
  });
};

const deleteUser = async(req:Request, res: Response) => {
  const id = req.params.id;
  pool.query("DELETE FROM users WHERE user_id = $1", [id], (err, result) => {
    if (err) {
      res.status(400).send("Error: could not delete user");
      console.log(err);
    }
    res.status(200).send("User deleted");
  });
};

export { verifyJWT, createAccessToken, createRefreshToken, isUserAuth, login, logout, refresh, register, deleteUser };