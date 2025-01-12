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
const prismaClient_1 = __importDefault(require("../prismaClient"));
const getPotentialFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = Number(req.params.user_id);
    try {
        const potentialFriends = yield prismaClient_1.default.users.findMany({
            where: {
                AND: [
                    { user_id: { not: user_id } }, // Exclude the current user
                    {
                        friends_friends_user_idTousers: {
                            none: { friend_id: user_id }, // User is not in `friends` as a friend
                        },
                    },
                    {
                        friends_friends_friend_idTousers: {
                            none: { user_id: user_id }, // User is not in `friends` as a user
                        },
                    },
                ],
            },
            select: {
                first_name: true,
                last_name: true,
                username: true,
                user_id: true,
            },
        });
        res.json(potentialFriends);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("database error");
    }
});
exports.getPotentialFriends = getPotentialFriends;
