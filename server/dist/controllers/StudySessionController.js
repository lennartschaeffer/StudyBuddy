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
exports.getUpcomingStudySessionsByUser = exports.createGroupStudySession = exports.getRecentStudySessions = exports.completeActiveStudySession = exports.getActiveStudySession = exports.completeTask = exports.createStudySession = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const createStudySession = (req, res, io) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { session_name, end_time, user_id, checklist, lat, lon } = req.body;
        let checklist_id = null;
        //start transaction
        yield prismaClient_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Create the checklist and tasks
            if (checklist.length > 0) {
                const newChecklist = yield prisma.studysession_checklists.create({
                    data: {},
                });
                checklist_id = newChecklist.checklist_id;
                for (const task of checklist) {
                    yield prisma.studysession_tasks.create({
                        data: {
                            checklist_id: newChecklist.checklist_id,
                            task_name: task,
                            task_completed: false,
                        },
                    });
                }
            }
            // Create the study session
            yield prisma.solo_studysessions.create({
                data: {
                    end_time: new Date(end_time).toISOString(),
                    user_id: user_id,
                    checklist_id: checklist_id,
                    start_time: new Date().toISOString(),
                    session_name: session_name,
                    lat: lat,
                    lon: lon,
                },
            });
        }));
        res.status(200).send("Study session created successfully");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.createStudySession = createStudySession;
const completeTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { task_id } = req.params;
        yield prismaClient_1.default.studysession_tasks.update({
            where: {
                task_id: Number(task_id),
            },
            data: {
                task_completed: true,
            },
        });
        res.status(200).send("Successfully updated task.");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.completeTask = completeTask;
const getActiveStudySession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        if (!user_id) {
            throw new Error("Missing required fields");
        }
        const soloSession = yield getSoloStudySession(user_id);
        const groupSessions = yield getGroupStudySessions(user_id);
        res.json({
            soloSession: soloSession,
            groupSessions: groupSessions,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.getActiveStudySession = getActiveStudySession;
const getSoloStudySession = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const soloSession = yield prismaClient_1.default.solo_studysessions.findFirst({
        where: {
            user_id: Number(user_id), // Filter by user_id
            end_time: { gt: new Date().toISOString() }, // Ensure the session has not ended
            start_time: { lt: new Date().toISOString() }, // Ensure the session has started
        },
    });
    //if there is a solo session, get the tasks
    if (soloSession) {
        let tasks = [];
        if (soloSession.checklist_id) {
            const sessionTasks = yield prismaClient_1.default.studysession_tasks.findMany({
                where: {
                    checklist_id: soloSession.checklist_id,
                },
            });
            tasks = sessionTasks.map((task) => ({
                task_id: task.task_id,
                task_name: task.task_name,
                task_completed: task.task_completed,
            }));
        }
        return {
            session_id: soloSession.session_id,
            session_name: soloSession.session_name,
            start_time: soloSession.start_time,
            end_time: soloSession.end_time,
            user_id: soloSession.user_id,
            checklist_id: (_a = soloSession.checklist_id) !== null && _a !== void 0 ? _a : null,
            tasks: tasks,
        };
    }
    return null;
});
const getGroupStudySessions = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const groupSessions = yield prismaClient_1.default.group_studysessions.findMany({
        where: {
            studygroups: {
                user_studygroups: {
                    some: { user_id: Number(user_id) }, // Filter for study groups where the user is a member
                },
            },
            end_time: { gt: new Date().toISOString() }, //make sure the session has not ended
            start_time: { lt: new Date().toISOString() }, //make sure the session has started
        },
        orderBy: {
            start_time: 'desc', // Order by start_time in descending order
        },
        select: {
            studygroups: {
                select: {
                    group_name: true,
                },
            },
            session_name: true,
            start_time: true,
            end_time: true,
        },
    });
    return groupSessions;
});
// const getMapStudySessionInfo = async (req: Request, res: Response) => {
//   const { user_id } = req.params;
//   try {
//     // Get the user's active study session
//     const { data: userSession, error: userSessionError } = await supabase
//       .from('studysessions')
//       .select('user_id, session_name, endtime')
//       .eq('user_id', user_id)
//       .eq('session_completed', false)
//       .single();
//     if (userSessionError) throw userSessionError;
//     const { data: friendSessions, error: friendSessionsError } = await supabase
//       .from('friends')
//       .select('u.username, u.first_name, u.last_name, u.user_id, s.endtime, s.session_name, s.lat, s.lon')
//       .join('users u', 'u.user_id', 'friends.friend_id')
//       .join('studysessions s', 's.user_id', 'u.user_id')
//       .or(`friends.user_id.eq.${user_id},friends.friend_id.eq.${user_id}`)
//       .eq('s.session_completed', false)
//       .neq('u.user_id', user_id);
//     if (friendSessionsError) throw friendSessionsError;
//     let user, friends;
//     if (userSession) {
//       user = {
//         session_id: userSession.session_id,
//         session_name: userSession.session_name,
//         endtime: userSession.endtime,
//         user_id: userSession.user_id,
//         session_completed: userSession.session_completed,
//         checklist_id: userSession.checklist_id,
//       };
//     }
//     if (friendSessions.length > 0) {
//       friends = friendSessions.map((friend) => ({
//         username: friend.username,
//         first_name: friend.first_name,
//         last_name: friend.last_name,
//         user_id: friend.user_id,
//         session_id: friend.session_id,
//         session_name: friend.session_name,
//         endtime: friend.endtime,
//         lat: friend.lat,
//         lon: friend.lon,
//       }));
//     }
//     res.json({
//       user: user ?? "User not currently in session",
//       friends: friends ?? "No friends currently in session",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Database error");
//   }
// };
const completeActiveStudySession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { session_id, session_type } = req.params;
        if (session_type === "solo") {
            yield prismaClient_1.default.solo_studysessions.update({
                where: {
                    session_id: Number(session_id),
                },
                data: {
                    end_time: new Date().toISOString(),
                },
            });
        }
        else if (session_type === "group") {
            yield prismaClient_1.default.group_studysessions.update({
                where: {
                    group_studysessions_id: Number(session_id),
                },
                data: {
                    end_time: new Date().toISOString(),
                },
            });
        }
        else {
            res.status(400).send("Invalid session type");
            return;
        }
        res.status(200).send("Study session completed early.");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.completeActiveStudySession = completeActiveStudySession;
const getRecentSoloStudySessions = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const recentSessions = yield prismaClient_1.default.solo_studysessions.findMany({
        where: {
            user_id: Number(user_id), // Filter by user_id
            end_time: { lt: new Date().toISOString() }, // Ensure the session has ended
        },
        orderBy: {
            start_time: 'desc', // Order by start_time in descending order
        },
        take: 2, // Limit to 2 results
    });
    return recentSessions;
});
const getRecentGroupStudySessions = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const recentGroupSessions = yield prismaClient_1.default.group_studysessions.findMany({
        where: {
            studygroups: {
                user_studygroups: {
                    some: { user_id: Number(user_id) },
                },
            },
            end_time: { lt: new Date().toISOString() },
        },
        orderBy: {
            start_time: 'desc',
        },
        take: 2,
        select: {
            studygroups: {
                select: {
                    group_name: true,
                },
            },
            session_name: true,
            start_time: true,
            end_time: true,
        },
    });
    return recentGroupSessions;
});
const getRecentStudySessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const recentSoloSessions = yield getRecentSoloStudySessions(user_id);
        const recentGroupSessions = yield getRecentGroupStudySessions(user_id);
        res.json({
            userSessions: recentSoloSessions !== null && recentSoloSessions !== void 0 ? recentSoloSessions : [],
            groupSessions: recentGroupSessions !== null && recentGroupSessions !== void 0 ? recentGroupSessions : [],
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("database error");
    }
});
exports.getRecentStudySessions = getRecentStudySessions;
const createGroupStudySession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studygroup_id, name, start_time, end_time } = req.body;
        yield prismaClient_1.default.group_studysessions.create({
            data: {
                studygroup_id,
                session_name: name,
                start_time,
                end_time,
            },
        });
        res.status(200).send("Group study session created successfully");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.createGroupStudySession = createGroupStudySession;
const getUpcomingStudySessionsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const upcomingGroupSessions = yield prismaClient_1.default.group_studysessions.findMany({
            where: {
                studygroups: {
                    user_studygroups: {
                        some: { user_id: Number(user_id) },
                    },
                },
                start_time: { gt: new Date().toISOString() },
            },
            orderBy: {
                start_time: 'asc',
            },
            select: {
                studygroups: {
                    select: {
                        group_name: true,
                    },
                },
                session_name: true,
                start_time: true,
                end_time: true,
            },
        });
        res.send(upcomingGroupSessions);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.getUpcomingStudySessionsByUser = getUpcomingStudySessionsByUser;
