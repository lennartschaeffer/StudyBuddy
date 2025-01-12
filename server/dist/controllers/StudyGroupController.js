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
exports.respondToStudyGroupInvite = exports.inviteToStudyGroup = exports.getStudyGroupsByUser = exports.joinStudyGroup = exports.createStudyGroup = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const createStudyGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, group_name } = req.body;
        yield prismaClient_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Step 1: Create the study group
            const studygroup = yield prisma.studygroups.create({
                data: {
                    group_name: group_name,
                },
            });
            // Step 2: Use the studygroup_id from the previous query for user_studygroups
            yield prisma.user_studygroups.create({
                data: {
                    user_id: user_id,
                    user_role: 'admin',
                    studygroup_id: studygroup.studygroup_id, // Reference the returned studygroup_id
                },
            });
        }));
        res.send("Study group created successfully");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.createStudyGroup = createStudyGroup;
const joinStudyGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, studygroup_id } = req.body;
        yield prismaClient_1.default.user_studygroups.create({
            data: {
                studygroup_id: studygroup_id,
                user_id: user_id,
                user_role: 'member',
                joined_at: new Date().toISOString()
            }
        });
        res.send("User joined study group successfully");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.joinStudyGroup = joinStudyGroup;
const getStudyGroupsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const studyGroups = yield prismaClient_1.default.user_studygroups.findMany({
            where: {
                user_id: Number(user_id),
            },
            select: {
                studygroups: {
                    select: {
                        group_name: true,
                        studygroup_id: true,
                    },
                },
            },
        });
        //pull the group_name and studygroup_id from the studygroups object
        res.send(studyGroups.map((studyGroup) => studyGroup.studygroups));
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.getStudyGroupsByUser = getStudyGroupsByUser;
const inviteToStudyGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sender_id, receiver_id, studygroup_id } = req.body;
        //check if user already exists in the studygroup
        const check = yield prismaClient_1.default.user_studygroups.findFirst({
            where: {
                user_id: receiver_id,
                studygroup_id: studygroup_id
            }
        });
        if (check) {
            res.send("User is already in the study group");
            return;
        }
        //check if the invite already exists
        const existingInvite = yield prismaClient_1.default.studygroup_invites.findFirst({
            where: {
                receiver_id: receiver_id,
                studygroup_id: studygroup_id
            }
        });
        if (existingInvite) {
            res.send("User has already been invited to the study group");
            return;
        }
        //insert the invite
        yield prismaClient_1.default.studygroup_invites.create({
            data: {
                sender_id: sender_id,
                receiver_id: receiver_id,
                studygroup_id: studygroup_id,
                created_at: new Date().toISOString()
            }
        });
        res.send("Invite sent successfully");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.inviteToStudyGroup = inviteToStudyGroup;
const respondToStudyGroupInvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studygroup_id, studygroup_invite_id, response, user_id } = req.body;
        if (!studygroup_id || !studygroup_invite_id || !response || !user_id) {
            res.status(400).send("Missing required fields");
            return;
        }
        if (!["accepted", "rejected"].includes(response)) {
            res.status(400).send("Invalid response");
            return;
        }
        if (response === "accepted") {
            yield prismaClient_1.default.user_studygroups.create({
                data: {
                    user_id: user_id,
                    studygroup_id: studygroup_id,
                    user_role: 'member',
                    joined_at: new Date().toISOString()
                }
            });
            yield prismaClient_1.default.studygroup_invites.update({
                where: {
                    studygroup_invite_id: studygroup_invite_id
                },
                data: {
                    status: 'accepted'
                }
            });
        }
        else {
            yield prismaClient_1.default.studygroup_invites.update({
                where: {
                    studygroup_invite_id: studygroup_invite_id
                },
                data: {
                    status: 'rejected'
                }
            });
        }
        res.send("Response recorded successfully");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.respondToStudyGroupInvite = respondToStudyGroupInvite;
