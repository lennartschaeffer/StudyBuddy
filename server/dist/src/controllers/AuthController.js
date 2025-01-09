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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.getUser = exports.authMiddleware = exports.login = exports.signUp = void 0;
const supabaseClient_1 = require("../supabaseClient");
const createAuthUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabaseClient_1.supabase.auth.signUp({
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
    }
    catch (error) {
        console.log(error);
        throw new Error("Error creating auth user");
    }
});
const createDbUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabaseClient_1.supabase.from("users").insert(userData);
        if (error) {
            console.log(error);
            throw new Error("Error creating database user");
        }
        return data;
    }
    catch (error) {
        console.log(error);
        throw new Error("Error creating database user");
    }
});
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, first_name, last_name, university, degree, } = req.body;
        //insert user into supabase auth
        const authId = yield createAuthUser(email, password);
        if (!authId) {
            throw new Error("Error signing up");
        }
        //insert user into database
        const userData = {
            auth_id: authId,
            username: username,
            email: email,
            first_name: first_name,
            last_name: last_name,
            university: university,
            degree: degree,
        };
        yield createDbUser(userData);
        res.status(201).send("User created");
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error signing up");
    }
});
exports.signUp = signUp;
const authLogin = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabaseClient_1.supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) {
            console.log(error);
            throw new Error("Error logging in" + error);
        }
        return data;
    }
    catch (error) {
        console.log(error);
        throw new Error("Error logging in");
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const data = yield authLogin(email, password);
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
        const user = yield getUserByAuthId(data.user.id);
        res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error logging in");
    }
});
exports.login = login;
const supaBaseAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        //get token from header 
        const token = req.cookies.access_token;
        if (!token) {
            res.status(401).send("Access denied. No token found");
            return;
        }
        //get user data from token
        const { data, error } = yield supabaseClient_1.supabase.auth.getUser(token);
        if (error) {
            console.log(error);
            res.status(401).send("Access denied");
            return;
        }
        const authId = (_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = yield getUserByAuthId(authId);
        req.user = user;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).send("Access denied");
    }
});
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    supaBaseAuthMiddleware(req, res, next);
});
exports.authMiddleware = authMiddleware;
const getUserByAuthId = (authId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield supabaseClient_1.supabase
            .from("users")
            .select("*")
            .eq("auth_id", authId)
            .single();
        if (error) {
            console.log(error);
            throw new Error("Error getting user by auth id");
        }
        return data;
    }
    catch (error) {
        console.log(error);
        throw new Error("Error getting user by auth id");
    }
});
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send(req.user);
});
exports.getUser = getUser;
const logout = (req, res) => {
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).send("Logged out successfully");
};
exports.logout = logout;
const deleteUserByAuthId = (authId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!authId) {
        throw new Error("No auth id was provided");
    }
    try {
        const { data, error } = yield supabaseClient_1.supabase
            .from("users")
            .delete()
            .eq("auth_id", authId);
        if (error) {
            console.log(error);
            throw new Error("Error deleting user by auth id");
        }
        return data;
    }
    catch (error) {
        console.log(error);
        throw new Error("Error deleting user by auth id");
    }
});
const deleteAuthUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = yield supabaseClient_1.supabase.auth.admin.deleteUser(userId);
        if (error) {
            console.log(error);
            throw new Error("Error deleting auth user");
        }
        return { message: "User deleted" };
    }
    catch (error) {
        console.log(error);
        throw new Error("Error deleting auth user");
    }
});
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield req.user;
        const authId = user.auth_id;
        //delete from users table  
        yield deleteUserByAuthId(authId);
        //delete from auth table
        yield deleteAuthUser(authId);
        res.status(200).send("User deleted");
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error deleting user");
    }
});
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield req.user;
        res.status(200).send(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Error getting user");
    }
});
exports.getMe = getMe;
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
