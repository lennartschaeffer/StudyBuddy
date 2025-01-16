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
exports.getProfileInfo = exports.getPotentialFriends = void 0;
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
const getProfileInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const totalStudyTime = yield getTotalStudyTime(user_id);
        const numberOfStudyGroups = yield getNumberOfStudyGroups(user_id);
        const numberOfStudySessions = yield getNumberOfStudySessions(user_id);
        res.json({ totalStudyTime: totalStudyTime, numberOfStudyGroups: numberOfStudyGroups, numberOfStudySessions: numberOfStudySessions });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("database error");
    }
});
exports.getProfileInfo = getProfileInfo;
const getNumberOfStudyGroups = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //get the number of study groups the user is in
        const numberOfStudyGroups = yield prismaClient_1.default.user_studygroups.count({
            where: {
                user_id: Number(userId),
            },
        });
        return numberOfStudyGroups;
    }
    catch (error) {
        console.error(error);
        throw new Error("Error getting number of study groups");
    }
});
const getNumberOfStudySessions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //get the number of study sessions the user has completed
        const numberOfStudySessions = yield prismaClient_1.default.solo_studysessions.count({
            where: {
                user_id: Number(userId),
            },
        });
        return numberOfStudySessions;
    }
    catch (error) {
        console.error(error);
        throw new Error("Error getting number of study sessions");
    }
});
const getTotalStudyTime = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const times = yield prismaClient_1.default.solo_studysessions.findMany({
            where: {
                user_id: Number(userId),
            },
            select: {
                start_time: true,
                end_time: true,
            },
        });
        //sum up the total 
        let total = 0;
        times.forEach((time) => {
            total += (time.end_time.getTime() - time.start_time.getTime());
        });
        //convert to minutes
        total = total / (60000);
        return total;
    }
    catch (error) {
        console.error(error);
        throw new Error("Error getting total study time");
    }
});
