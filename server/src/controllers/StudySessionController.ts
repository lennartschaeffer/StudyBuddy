import { Request, Response } from "express";
import { Server } from "socket.io";
import { supabase } from "../supabaseClient";
import { getStudyGroupsByUserHelper } from "./StudyGroupController";

const createStudySession = async (req: Request, res: Response, io: Server) => {
  try {
    const { session_name, end_time, user_id, checklist, lat, lon } = req.body;

    // Start transaction
    const { data: newChecklist, error: checklistError } = await supabase
      .from("studysession_checklists")
      .insert({})
      .select("checklist_id")
      .single();

    if (checklistError) throw checklistError;

    // For each checklist item, add it to the task table
    for (const task of checklist) {
      const { error: taskError } = await supabase
        .from("studysession_tasks")
        .insert({
          checklist_id: newChecklist.checklist_id,
          task_name: task,
          task_completed: false,
        });

      if (taskError) throw taskError;
    }

    // Add the session to the study session table
    const { data: newStudySession, error: sessionError } = await supabase
      .from("solo_studysessions")
      .insert({
        end_time,
        user_id,
        checklist_id: newChecklist.checklist_id,
        start_time: new Date().toISOString(),
        session_name,
        lat,
        lon,
      })
      .select("*")
      .single();

    if (sessionError) throw sessionError;

    // Update checklist with the session id
    const { error: updateError } = await supabase
      .from("studysession_checklists")
      .update({ session_id: newStudySession.session_id })
      .eq("checklist_id", newChecklist.checklist_id);

    if (updateError) throw updateError;

    // Notify friends through web socket event
    // const { data: friends, error: friendsError } = await supabase
    //   .from("friends")
    //   .select("friend_id")
    //   .or(`user_id.eq.${user_id},friend_id.eq.${user_id}`);

    // if (friendsError) throw friendsError;

    // // For each friend, emit a web socket event
    // friends.forEach((friend) => {
    //   io.to(friend.friend_id.toString()).emit("studySessionStarted", {
    //     user_id,
    //     session_name,
    //     end_time,
    //     session_id: newStudySession.session_id,
    //   });
    // });

    res.json(newStudySession);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const completeTask = async (req: Request, res: Response) => {
  try {
    const { task_id } = req.params;

    // Update tasks table
    const { error: taskError } = await supabase
      .from("studysession_tasks")
      .update({ task_completed: true })
      .eq("task_id", task_id);

    if (taskError) throw taskError;

    res.status(200).send("Successfully updated task.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};
type SoloStudySession = {
  session_id: number;
  session_name: string;
  start_time: string;
  end_time: string;
  user_id: number;
  checklist_id: number;
  tasks: Task[];
};
type Task = {
  task_id: number;
  task_name: string;
  task_completed: boolean;
};

const getActiveStudySession = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    console.log("user_id", user_id);

    if (!user_id) {
      throw new Error("Missing required fields");
    }

    // Get the user's active study session
    const { data: session, error: sessionError } = await supabase
      .from("solo_studysessions")
      .select("*")
      .eq("user_id", user_id)
      .lt("start_time", new Date().toISOString())
      .gt("end_time", new Date().toISOString());

    if (sessionError) {
      console.log("sessionError", sessionError);
      throw sessionError;
    }
    console.log("session", session);
    if (session[0]) {
      let tasks: Task[] = [];
      if (session[0].checklist_id) {
        const { data: sessionTasks, error: tasksError } = await supabase
          .from("studysession_tasks")
          .select("*")
          .eq("checklist_id", session[0].checklist_id);

        if (tasksError) throw tasksError;

        tasks = sessionTasks.map((task) => ({
          task_id: task.task_id,
          task_name: task.task_name,
          task_completed: task.task_completed,
        }));
      }
      res.json({
        solo_session: {
          session_id: session[0].session_id,
          session_name: session[0].session_name,
          start_time: session[0].start_time,
          end_time: session[0].end_time,
          user_id: session[0].user_id,
          session_completed: session[0].session_completed,
          checklist_id: session[0].checklist_id ?? null,
          tasks: tasks,
        },
      });
      return;
    } 
    
    const groupSessions = await getStudyGroupsByUserHelper(user_id);

    const currentGroupSession = await Promise.all(
      groupSessions.map(async (studyGroup: any) => {
        const { data: sessions, error: sessionError } = await supabase
          .from("group_studysessions")
          .select(`
             start_time,
             end_time, 
             session_name, 
             studygroup_id, 
             studygroups(group_name)`)
          .eq("studygroup_id", studyGroup.studygroup_id)
          .lt("start_time", new Date().toISOString())
          .gt("end_time", new Date().toISOString())
          .limit(1);
        if (sessionError) throw sessionError;
        return sessions;
      })
    );

    console.log(currentGroupSession);

    res.json({groupSessions: currentGroupSession.filter((session) => session.length > 0)});
    // } else {
    //   const { data: groupSession, error: groupSessionError } = await supabase
    //     .from("group_studysessions")
    //     .select(
    //       "group_name, session_name, start_time, end_time, studygroup_id, group_studysessions_id"
    //     )
    //     .eq("user_id", user_id)
    //     .lt("start_time", new Date().toISOString())
    //     .gt("end_time", new Date().toISOString())
    //     .single();

    //   if (groupSessionError) throw groupSessionError;
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
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

const completeActiveStudySessionEarly = async (req: Request, res: Response) => {
  try {
    const { session_id, session_type } = req.params;
    if (session_type === "solo") {
      const { error: updateError } = await supabase
        .from("solo_studysessions")
        .update({ end_time: new Date() })
        .eq("session_id", session_id);

      if (updateError) throw updateError;
    } else {
      const { error: updateError } = await supabase
        .from("group_studysessions")
        .update({ end_time: new Date() })
        .eq("group_studysessions_id", session_id);

      if (updateError) throw updateError;
    }
    res.status(200).send("Study session completed early.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const completeActiveStudySession = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;
    const { error: updateError } = await supabase
      .from("solo_studysessions")
      .update({ end_time: new Date() })
      .eq("session_id", session_id);

    if (updateError) throw updateError;

    res.status(200).send("Study session completed.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getRecentStudySessions = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { data: recentSessions, error: recentSessionsError } = await supabase
      .from("solo_studysessions")
      .select("*")
      .eq("user_id", user_id)
      .lt("end_time", new Date().toISOString())
      .order("start_time", { ascending: false })
      .limit(2);

    if (recentSessionsError) throw recentSessionsError;

    
    const groupSessions = await getStudyGroupsByUserHelper(user_id);

    const recentGroupSessions = await Promise.all(
      groupSessions.map(async (studyGroup: any) => {
        const { data: sessions, error: sessionError } = await supabase
          .from("group_studysessions")
          .select(`
             start_time,
             end_time, 
             session_name, 
             studygroup_id, 
             studygroups(group_name)`)
          .eq("studygroup_id", studyGroup.studygroup_id)
          .lt("end_time", new Date().toISOString())
          .order("start_time", { ascending: false })
          .limit(1);
        if (sessionError) throw sessionError;
        return sessions;
      })
    );

    console.log(recentGroupSessions);
    res.json({
      userSessions: recentSessions,
      groupSessions: recentGroupSessions.filter((session) => session.length > 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("database error");
  }
};

const createGroupStudySession = async (req: Request, res: Response) => {
  try {
    const { studygroup_id, name, start_time, end_time } = req.body;
    // Check if studygroup is not already in session
    const { data: check, error: checkError } = await supabase
      .from("group_studysessions")
      .select("*")
      .eq("studygroup_id", studygroup_id)
      .lt("start_time", new Date().toISOString())
      .gt("end_time", new Date().toISOString());

    if (checkError) throw checkError;

    if (check.length > 0) {
      res.send("Study group is already in session");
      return;
    }

    const { data: newStudySession, error: sessionError } = await supabase
      .from("group_studysessions")
      .insert({
        studygroup_id,
        session_name: name,
        start_time,
        end_time,
      })
      .select("*")
      .single();

    if (sessionError) throw sessionError;

    res.json(newStudySession);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getUpcomingStudySessionsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    
      

    const studyGroups = await getStudyGroupsByUserHelper(user_id);

   
    //for each study group, check whether the corresponding row in group_studysessions has a start time in the future
    const upcomingSessions = await Promise.all(
      studyGroups.map(async (studyGroup: any) => {
        console.log(studyGroup);
        const { data: sessions, error: sessionError } = await supabase
          .from("group_studysessions")
          .select(`
             start_time,
             end_time, 
             session_name, 
             studygroup_id, 
             studygroups(group_name)`)
          .eq("studygroup_id", studyGroup.studygroup_id)
          .gt("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          
        if (sessionError) throw sessionError;
        console.log(sessions);
        return sessions;
      })
    );
    
    console.log(upcomingSessions);
    res.send(upcomingSessions.filter((session) => session.length > 0));
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
  completeActiveStudySessionEarly,
};
