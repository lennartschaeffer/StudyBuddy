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
exports.getPotentialFriends = void 0;
const db_1 = __importDefault(require("../db"));
const getPotentialFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    try {
        const users = yield db_1.default.query(`SELECT u.first_name, u.last_name, u.username, u.user_id
             FROM users u
             LEFT JOIN friends f1 ON u.user_id = f1.friend_id AND f1.user_id = $1
             LEFT JOIN friends f2 ON u.user_id = f2.user_id AND f2.friend_id = $1
             WHERE u.user_id != $1 AND f1.friend_id IS NULL AND f2.user_id IS NULL;`, [user_id]);
        res.json(users.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("database error");
    }
});
exports.getPotentialFriends = getPotentialFriends;
