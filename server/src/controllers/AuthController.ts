import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../db";
import { supabase } from "../supabaseClient";
import { createUserData } from "../models/User";

//extend the Request interface to include userId
declare module "express-serve-static-core" {
  interface Request {
    user: Promise<any>;
  }
}

const createAuthUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      console.log(error);
      throw new Error("Error creating auth user");
    }
    if (!data || !data.user) {
      throw new Error("Coudlnt get auth user info");
    }
    return data.user.id;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating auth user");
  }
};

const createDbUser = async (userData: createUserData) => {
  try {
    const { data, error } = await supabase.from("users").insert(userData);
    if (error) {
      console.log(error);
      throw new Error("Error creating database user");
    }
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating database user");
  }
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      university,
      degree,
    } = req.body;
    //insert user into supabase auth
    const authId = await createAuthUser(email, password);
    if (!authId) {
      throw new Error("Error signing up");
    }
    //insert user into database
    const userData: createUserData = {
      auth_id: authId,
      username: username,
      email: email,
      first_name: first_name,
      last_name: last_name,
      university: university,
      degree: degree,
    };
    await createDbUser(userData);
    res.status(201).send("User created");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error signing up");
  }
};

const authLogin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.log(error);
      throw new Error("Error logging in"+ error);
    }
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Error logging in");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await authLogin(email, password);
    if (!data || !data.session) {
      res.status(401).send("Invalid credentials");
      return;
    }
    //set access token in http only cookie
    res.cookie("access_token", data.session.access_token, {
      httpOnly: true, //prevent access via JavaScript
      secure: process.env.NODE_ENV === "production", //send cookie only over HTTPS in production
      sameSite: "strict", // Prevent CSRF
      maxAge: data.session.expires_in * 1000, // Expiration time in milliseconds
    });
    const user = await getUserByAuthId(data.user.id);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error logging in");
  }
};

const supaBaseAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get token from header 
    const token = req.cookies.access_token;
    if (!token) {
      res.status(401).send("Access denied. No token found");
      return;
    }
    //get user data from token
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      console.log(error);
      res.status(401).send("Access denied");
      return;
    }
    const authId = data?.user?.id;
    const user = await getUserByAuthId(authId!);
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send("Access denied");
  }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  supaBaseAuthMiddleware(req, res, next);
}

const getUserByAuthId = async (authId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .single();
    if (error) {
      console.log(error);
      throw new Error("Error getting user by auth id");
    }
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Error getting user by auth id");
  }
}

export const getUser = async (req: Request, res: Response) => {
  res.status(200).send(req.user);
}

export const logout = (req: Request, res: Response) => {
  
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).send("Logged out successfully");
};

const deleteUserByAuthId = async (authId: string) => {
  if(!authId){  
    throw new Error("No auth id was provided");
  }
  try {
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("auth_id", authId);
    if (error) {
      console.log(error);
      throw new Error("Error deleting user by auth id");
    }
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Error deleting user by auth id");
  }
}

const deleteAuthUser = async (userId: string) => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.log(error);
      throw new Error("Error deleting auth user");
    }
    return { message: "User deleted" };
  } catch (error) {
    console.log(error);
    throw new Error("Error deleting auth user");
  }
}

const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await req.user;
    const authId = user.auth_id;
    //delete from users table  
    await deleteUserByAuthId(authId);
    //delete from auth table
    await deleteAuthUser(authId);
    res.status(200).send("User deleted");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting user");
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await req.user;
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting user");
  }
}




// //salt rounds for hashing pw
// const saltRounds = 10;

// const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers["x-access-token"];

//   if (!token) {
//     res.send("Token not provided");
//   } else {
//     jwt.verify(token[0], process.env.JWT_SECRET!, (err, decoded) => {
//       if (err) {
//         res.json({ auth: false, message: "Failed to authenticate" });
//       } else {
//         req.userId = (decoded as jwt.JwtPayload)?.id;
//         next();
//       }
//     });
//   }
// };

// const createAccessToken = (id: number) => {
//   const accessToken = jwt.sign({ id }, process.env.JWT_SECRET!, {
//     expiresIn: "3h",
//   });
//   return accessToken;
// };

// const createRefreshToken = (id: number) => {
//   const refreshToken = jwt.sign({ id },  process.env.JWT_REFRESH_SECRET!);
//   return refreshToken;
// };

// const isUserAuth = async(req: Request, res: Response) => {
//   res.send("You are authenticated");
// };

// const login = async(req: Request, res: Response) => {
//   const { username, password } = req.body;
//   pool.query(
//     "SELECT * FROM users WHERE username = $1",
//     [username],
//     (err, result) => {
//       if (err) {
//         console.log(err);
//       }
//       if (result.rows.length > 0) {
//         const user = result.rows[0];
//         bcrypt.compare(password, user.password, (err, isMatch) => {
//           if (err) {
//             console.log(err);
//           }
//           if (isMatch) {
//             //create access token
//             const id = result.rows[0].user_id;
//             const accessToken = createAccessToken(id);
//             const refreshToken = createRefreshToken(id);

//             //add refresh token to database
//             pool.query(
//               `UPDATE users SET refresh_token = $1 WHERE user_id = $2`,
//               [refreshToken, id],
//               (err, result) => {
//                 if (err) {
//                   console.log(err);
//                 }
//                 console.log(result);
//               }
//             );
//             res.json({
//               auth: true,
//               token: accessToken,
//               result: result.rows[0],
//             });
//           } else {
//             res.json({ auth: false, message: "Wrong username/password" });
//           }
//         });
//       } else {
//         res.json({ auth: false, message: "user does not exist" });
//       }
//     }
//   );
// };

// const logout = async(req: Request, res: Response) => {
//   const username = req.body.username;
//   pool.query(
//     `UPDATE users SET refresh_token = $1 WHERE username = $2`,
//     [null, username],
//     (err, result) => {
//       if (err) {
//         console.log(err);
//       }
//       res.json({ message: "User logged out succesfully." });
//     }
//   );
// };

// const refresh = async (req: Request, res: Response)=> {
//   //take refresh token from user
//   const token = req.body.token;
//   //send error if no refresh token
//   if (!token) {
//     res.status(401).send("Access denied, you are not authenticated" );
//   }
//   pool.query(
//     `SELECT * FROM users WHERE refresh_token = $1`,
//     [token],
//     (err, result) => {
//       if (err) {
//         res.status(403).send("Error: could not find refresh token.");
//       }
//       if (result.rows.length > 0) {
//         try {
//           jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
//           const user = result.rows[0];
//           const accessToken = createAccessToken(user.id);
//           res.json({ token: accessToken });
//         } catch (error) {
//           res.status(403).send("Error: invalid refresh token.");
//         }
//       } else {
//         res.status(403).send("Error: invalid refresh token.");
//       }
//     }
//   );
// };

// const register = async (req: Request, res: Response) => {
//   const { username, password, first_name, last_name } = req.body;
//   bcrypt.hash(password, saltRounds, (err, hash) => {
//     if (err) {
//       console.log(err);
//     }
//     pool.query(
//       "INSERT INTO users (username, password, first_name, last_name) VALUES($1, $2, $3, $4) RETURNING *",
//       [username, hash, first_name, last_name],
//       (err, result) => {
//         if (err) {
//           console.log(err);
//         }
//         res.json(result.rows[0]);
//       }
//     );
//   });
// };

// const deleteUser = async(req:Request, res: Response) => {
//   const id = req.params.id;
//   pool.query("DELETE FROM users WHERE user_id = $1", [id], (err, result) => {
//     if (err) {
//       res.status(400).send("Error: could not delete user");
//       console.log(err);
//     }
//     res.status(200).send("User deleted");
//   });
// };

// export { verifyJWT, createAccessToken, createRefreshToken, isUserAuth, login, logout, refresh, register, deleteUser };
