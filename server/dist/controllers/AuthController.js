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
exports.getMe = exports.logout = exports.getUser = exports.authMiddleware = exports.login = exports.signUp = void 0;
const supabaseClient_1 = require("../supabaseClient");
const prismaClient_1 = __importDefault(require("../prismaClient"));
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
        const user = yield prismaClient_1.default.users.create({
            data: userData,
        });
        return user;
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
            secure: process.env.NODE_ENV == "production", //send cookie only over HTTPS in production
            sameSite: process.env.NODE_ENV == "production" ? "none" : "strict",
            maxAge: data.session.expires_in * 1000, // Expiration time in milliseconds
        });
        const user = yield getUserByAuthId(data.user.id);
        res.status(200).json({ user: user, message: "Logged in successfully" });
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
        if (!user) {
            res.status(401).send("Access denied");
            return;
        }
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
        const data = yield prismaClient_1.default.users.findUnique({
            where: {
                auth_id: authId,
            },
        });
        //map to user object
        const user = {
            user_id: data === null || data === void 0 ? void 0 : data.user_id,
            auth_id: data === null || data === void 0 ? void 0 : data.auth_id,
            username: data === null || data === void 0 ? void 0 : data.username,
            email: data === null || data === void 0 ? void 0 : data.email,
            first_name: data === null || data === void 0 ? void 0 : data.first_name,
            last_name: data === null || data === void 0 ? void 0 : data.last_name,
            university: data === null || data === void 0 ? void 0 : data.university,
            degree: data === null || data === void 0 ? void 0 : data.degree,
        };
        return user;
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
        const data = yield prismaClient_1.default.users.delete({
            where: {
                auth_id: authId,
            },
        });
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
