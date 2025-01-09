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
exports.respondToStudyGroupInvite = exports.inviteToStudyGroup = exports.getStudyGroupsByUser = exports.joinStudyGroup = exports.createStudyGroup = exports.getStudyGroupsByUserHelper = void 0;
const supabaseClient_1 = require("../supabaseClient");
const getStudyGroupsByUserHelper = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const { data: userStudyGroups, error } = yield supabaseClient_1.supabase
        .from("user_studygroups")
        .select(`
      studygroups (
        group_name,
        studygroup_id
      )
    `)
        .eq("user_id", user_id);
    if (error) {
        console.error('get study groups by user helper error' + error);
        return [];
    }
    if (userStudyGroups.length === 0) {
        return [];
    }
    const studyGroups = userStudyGroups.map((userStudyGroup) => userStudyGroup.studygroups);
    return studyGroups;
});
exports.getStudyGroupsByUserHelper = getStudyGroupsByUserHelper;
const createStudyGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, group_name } = req.body;
        const { data: newGroup, error } = yield supabaseClient_1.supabase.from("studygroups").insert({
            group_name: group_name
        }).select();
        if (error) {
            res.status(500).send("Database error");
            console.error('create study group error' + error);
            return;
        }
        console.log(newGroup);
        const studyGroup = newGroup[0];
        const { error: userGroupError } = yield supabaseClient_1.supabase.from("user_studygroups").insert({
            studygroup_id: studyGroup.studygroup_id,
            user_id: user_id,
            user_role: 'admin'
        });
        if (userGroupError) {
            res.status(500).send("Database error");
            console.error('create study group error' + userGroupError);
            return;
        }
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
        const { error } = yield supabaseClient_1.supabase.from("user_studygroups").insert({
            studygroup_id: studygroup_id,
            user_id: user_id,
            user_role: 'member',
            joined_at: new Date()
        });
        if (error) {
            res.status(500).send("Database error");
            console.error('join study group error' + error);
            return;
        }
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
        const studyGroups = yield (0, exports.getStudyGroupsByUserHelper)(user_id);
        res.send(studyGroups);
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
        const { data: existingUser, error: checkError } = yield supabaseClient_1.supabase
            .from("user_studygroups")
            .select("*")
            .eq("user_id", receiver_id)
            .eq("studygroup_id", studygroup_id);
        if (checkError) {
            res.status(500).send("Database error");
            console.error('invite to study group check error' + checkError);
            return;
        }
        if (existingUser.length > 0) {
            res.send("User is already in the study group");
            return;
        }
        const { error } = yield supabaseClient_1.supabase.from("studygroup_invites").insert({
            sender_id: sender_id,
            receiver_id: receiver_id,
            studygroup_id: studygroup_id,
            created_at: new Date()
        });
        if (error) {
            res.status(500).send("Database error");
            console.error('invite to study group error' + error);
            return;
        }
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
        if (!["accepted", "rejected"].includes(response)) {
            res.status(400).send("Invalid response");
            return;
        }
        if (response === "accepted") {
            const { error: insertError } = yield supabaseClient_1.supabase.from("user_studygroups").insert({
                studygroup_id: studygroup_id,
                user_id: user_id,
                user_role: 'member',
                joined_at: new Date()
            });
            if (insertError) {
                res.status(500).send("Database error");
                console.error('respond to study group invite insert error' + insertError);
                return;
            }
            const { error: updateError } = yield supabaseClient_1.supabase.from("studygroup_invites")
                .update({ status: 'accepted' })
                .eq("studygroup_invite_id", studygroup_invite_id);
            if (updateError) {
                res.status(500).send("Database error");
                console.error('respond to study group invite update error' + updateError);
                return;
            }
        }
        else {
            const { error: updateError } = yield supabaseClient_1.supabase.from("studygroup_invites")
                .update({ status: 'rejected' })
                .eq("studygroup_invite_id", studygroup_invite_id);
            if (updateError) {
                res.status(500).send("Database error");
                console.error('respond to study group invite update error' + updateError);
                return;
            }
        }
        res.send("Response recorded successfully");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.respondToStudyGroupInvite = respondToStudyGroupInvite;
