import { Request, Response } from "express";
import { Server } from "socket.io";
import { supabase } from "../supabaseClient";
import { group, log } from "console";
import prisma from "../prismaClient";


const createStudySession = async (req: Request, res: Response, io: Server) => {
  try {
    const { session_name, end_time, user_id, checklist, lat, lon } = req.body;
    let checklist_id: any = null;
    //start transaction
    await prisma.$transaction(async (prisma) => {

      // Create the checklist and tasks
      if (checklist.length > 0) {
        const newChecklist = await prisma.studysession_checklists.create({
          data: {},
        });
        checklist_id = newChecklist.checklist_id;

        for (const task of checklist) {
          await prisma.studysession_tasks.create({
            data: {
              checklist_id: newChecklist.checklist_id,
              task_name: task,
              task_completed: false,
            },
          });
        }
      }

      // Create the study session
      await prisma.solo_studysessions.create({
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
    }
    );

    res.status(200).send("Study session created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const completeTask = async (req: Request, res: Response) => {
  try {
    const { task_id } = req.params;
    await prisma.studysession_tasks.update({
      where: {
        task_id: Number(task_id),
      },
      data: {
        task_completed: true,
      },
    });
    res.status(200).send("Successfully updated task.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};
type Task = {
  task_id: number;
  task_name: string;
  task_completed: boolean;
};

const getActiveStudySession = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      throw new Error("Missing required fields");
    }

    const soloSession = await getSoloStudySession(user_id);
    const groupSessions = await getGroupStudySessions(user_id);

    res.json({
      soloSession: soloSession,
      groupSessions: groupSessions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getSoloStudySession = async (user_id: string) => {

  const soloSession = await prisma.solo_studysessions.findFirst({
    where: {
      user_id: Number(user_id), // Filter by user_id
      end_time: { gt: new Date().toISOString() }, // Ensure the session has not ended
      start_time: { lt: new Date().toISOString() }, // Ensure the session has started
    },
  });
  //if there is a solo session, get the tasks
  if (soloSession) {
    let tasks: any = [];
    if (soloSession.checklist_id) {
      const sessionTasks = await prisma.studysession_tasks.findMany({
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
      checklist_id: soloSession.checklist_id ?? null,
      tasks: tasks,
    };
  }
  return null;
};

const getGroupStudySessions = async (user_id: string) => {
  
    const groupSessions = await prisma.group_studysessions.findMany({
      where: {
        studygroups: {
          user_studygroups: {
            some: { user_id: Number(user_id)}, // Filter for study groups where the user is a member
          },
        },
        end_time: { gt: new Date().toISOString() }, //make sure the session has not ended
        start_time: {lt : new Date().toISOString() }, //make sure the session has started
      },
      orderBy: {
        start_time: 'desc', // Order by start_time in descending order
      },
      select: {
        studygroups: {
          select: {
            group_name: true,
            user_studygroups: {
              select: {
                user_id: true,
                users: {
                  select: {
                    username: true,
                    first_name: true,
                    last_name: true,
                  },
                },
                user_role: true,
              },
            },
          },
        },
        session_name: true,
        start_time: true,
        end_time: true,
        group_studysessions_id: true,
      },
    });
  
   //format the data
   const formattedGroupSessions = groupSessions.map((session) => ({
    session_id: session.group_studysessions_id,
    group_studysession_id: session.group_studysessions_id,
    session_name: session.session_name,
    group_name: session.studygroups.group_name,
    start_time: session.start_time,
    end_time: session.end_time,
    members: session.studygroups.user_studygroups.map((user) => ({
      user_id: user.user_id,
      username: user.users.username,
      first_name: user.users.first_name,
      last_name: user.users.last_name,
      user_role: user.user_role,
    }))
  }));

  return formattedGroupSessions;
};

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

const completeActiveStudySession = async (req: Request, res: Response) => {
  try {
    const { session_id, session_type } = req.params;
    if (session_type === "solo") {
      await prisma.solo_studysessions.update({
        where: {
          session_id: Number(session_id),
        },
        data: {
          end_time: new Date().toISOString(),
        },
      });
    } else if(session_type === "group") {
      await prisma.group_studysessions.update({
        where: {
          group_studysessions_id: Number(session_id),
        },
        data: {
          end_time: new Date().toISOString(),
        },
      });
    }
    else{
       res.status(400).send("Invalid session type"); 
       return;
    }
    res.status(200).send("Study session completed early.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};


const getRecentSoloStudySessions = async (user_id: string) => {
  
  const recentSessions = await prisma.solo_studysessions.findMany({
    where: {
      user_id: Number(user_id), 
      end_time: { lt: new Date().toISOString() },
    },
    orderBy: {
      start_time: 'desc',
    },
    take: 8,
  });

  return recentSessions;
};

const getRecentGroupStudySessions = async (user_id: string) => {
  
  const recentGroupSessions = await prisma.group_studysessions.findMany({
    where: {
      studygroups: {
        user_studygroups: {
          some: { user_id: Number(user_id)}, 
        },
      },
      end_time: { lt: new Date().toISOString() }, 
    },
    orderBy: {
      start_time: 'desc', 
    },
    take: 8, 
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
};

const getRecentStudySessions = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const recentSoloSessions = await getRecentSoloStudySessions(user_id);
    const recentGroupSessions = await getRecentGroupStudySessions(user_id);

    res.json({
      userSessions: recentSoloSessions ?? [],
      groupSessions: recentGroupSessions ?? [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("database error");
  }
};

const createGroupStudySession = async (req: Request, res: Response) => {
  try {
    const { studygroup_id, name, start_time, end_time } = req.body;

    await prisma.group_studysessions.create({
      data: {
        studygroup_id,
        session_name: name,
        start_time,
        end_time,
      },
    });
    res.status(200).send("Group study session created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getUpcomingStudySessionsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const upcomingGroupSessions = await prisma.group_studysessions.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

export {
  createStudySession,
  completeTask,
  getActiveStudySession,
  completeActiveStudySession,
  getRecentStudySessions,
  createGroupStudySession,
  getUpcomingStudySessionsByUser,
};
