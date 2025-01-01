import { Request, Response } from "express";
import pool from "../db";
import { Server } from "socket.io";

const createStudySession = async (req: Request, res: Response, io: Server) => {
  try {
    const { session_name, end_time, user_id, checklist, lat, lon } = req.body;

    //start transaction
    await pool.query("BEGIN");

    //first create the checklist in the checklist table with the studysession id
    const newChecklist = await pool.query(
      "INSERT INTO studysession_checklists DEFAULT VALUES RETURNING checklist_id;"
    );

    //for each checklist item, add it to the task table

    for (const task of checklist) {
      await pool.query(
        "INSERT INTO studysession_tasks (checklist_id, task_name, task_completed) VALUES($1, $2, $3);",
        [newChecklist.rows[0].checklist_id, task, false]
      );
    }

    //add the session to the study session table
    const newStudySession = await pool.query(
      `INSERT INTO studysessions (end_time, user_id, checklist_id, start_time, session_name, lat, lon) 
      VALUES($1, $2, $3, NOW(),$4, $5, $6) RETURNING *;`,
      [
        end_time,
        user_id,
        newChecklist.rows[0].checklist_id,
        session_name,
        lat,
        lon,
      ]
    );

    //update checklist with the session id
    await pool.query(
      `UPDATE studysession_checklists SET session_id = $1 WHERE checklist_id = $2;`,
      [newStudySession.rows[0].session_id, newChecklist.rows[0].checklist_id]
    );

    //commit transaction
    await pool.query("COMMIT");

    //notify friends through web socket event
    const friends = await pool.query(
      `SELECT friend_id FROM friends WHERE user_id = $1
       UNION
       SELECT user_id FROM friends WHERE friend_id = $1;`,
      [user_id]
    );

    //for each friend, emit a web socket event
    friends.rows.forEach((friend) => {
      io.to(friend.friend_id.toString()).emit("studySessionStarted", {
        user_id,
        session_name,
        end_time,
        session_id: newStudySession.rows[0].session_id,
      });
    });

    res.json(newStudySession.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).send("Database error");
  }
};

const completeTask = async (req: Request, res: Response) => {
  try {
    const { task_id } = req.params;

    //update tasks table
    const task = await pool.query(
      `UPDATE studysession_tasks SET task_completed = true WHERE task_id = $1;`,
      [task_id]
    );

    res.status(200).send("Successfully updated task.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getActiveStudySession = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    //get the users active study session
    const session = await pool.query(
      ` SELECT * FROM studysessions
        JOIN studysession_checklists USING (checklist_id)
        JOIN studysession_tasks USING (checklist_id)
        WHERE start_time < NOW()
        AND end_time > NOW()
        AND user_id = $1;
     `,
      [user_id]
    );
    const groupSession = await pool.query(
      `SELECT group_name, session_name, start_time, end_time, studygroup_id, group_studysessions_id 
       FROM group_studysessions
       JOIN user_studygroups USING (studygroup_id)
       JOIN studygroups USING (studygroup_id)
       WHERE user_id = $1
       AND start_time < NOW()
       AND NOW() < end_time;
       `,
      [user_id]
    );
    if (!session.rows[0] && !groupSession.rows[0]) {
      res.send("User currently has no active session");
    } else if (session.rows[0]) {
      const tasks = session.rows.map((task) => {
        return {
          task_id: task.task_id,
          task_name: task.task_name,
          task_completed: task.task_completed,
        };
      });
      res.json({
        solo_session: {
          session_id: session.rows[0].session_id,
          session_name: session.rows[0].session_name,
          start_time: session.rows[0].start_time,
          end_time: session.rows[0].end_time,
          user_id: session.rows[0].user_id,
          session_completed: session.rows[0].session_completed,
          checklist_id: session.rows[0].checklist_id,
          tasks: tasks,
        },
      });
    } else {
      res.json({ group_session: groupSession.rows[0] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getMapStudySessionInfo = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    //get the users active study session
    const userSession = await pool.query(
      ` SELECT user_id, session_name, endtime
        FROM studysessions
        WHERE session_completed = false
        AND user_id = $1;
     `,
      [user_id]
    );

    const friendSessions = await pool.query(
      `
        SELECT u.username, u.first_name, u.last_name, u.user_id, s.endtime, s.session_name, s.lat, s.lon
        FROM friends f
        JOIN users u ON (u.user_id = f.friend_id OR u.user_id = f.user_id)
	      JOIN studysessions s ON u.user_id = s.user_id
        WHERE (f.user_id = $1 OR f.friend_id = $1)
	      AND s.session_completed = false
        AND u.user_id != $1;
        `,
      [user_id]
    );

    let user, friends;

    if (userSession.rows[0]) {
      user = {
        session_id: userSession.rows[0].session_id,
        session_name: userSession.rows[0].session_name,
        endtime: userSession.rows[0].endtime,
        user_id: userSession.rows[0].user_id,
        session_completed: userSession.rows[0].session_completed,
        checklist_id: userSession.rows[0].checklist_id,
      };
    }
    if (friendSessions.rows[0]) {
      friends = friendSessions.rows.map((friend) => {
        return {
          username: friend.username,
          first_name: friend.first_name,
          last_name: friend.last_name,
          user_id: friend.user_id,
          session_id: friend.session_id,
          session_name: friend.session_name,
          endtime: friend.endtime,
          lat: friend.lat,
          lon: friend.lon,
        };
      });
    }
    res.json({
      user: user ?? "User not currently in session",
      friends: friends ?? "No friends currently in session",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const completeActiveStudySessionEarly = async (req: Request, res: Response) => {
  try {
      const { session_id, session_type } = req.params;
      if(session_type === 'solo'){
          await pool.query(
              `UPDATE studysessions 
              SET end_time = NOW() 
              WHERE session_id = $1`,
              [session_id]
          );
      }
      else{
          await pool.query(
              `UPDATE group_studysessions 
              SET end_time = NOW() 
              WHERE group_studysessions_id = $1`,
              [session_id]
          );
      }
      res.status(200).send("Study session completed early.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
}
const completeActiveStudySession = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    await pool.query(
      `UPDATE studysessions SET session_completed = true WHERE user_id = $1`,
      [user_id]
    );
    res.status(200).send("Study session completed.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getRecentStudySessions = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const recentSessions = await pool.query(
      `SELECT * FROM studysessions 
            WHERE user_id = $1
            AND NOW() > end_time
            ORDER BY start_time DESC
            LIMIT 2;`,
      [user_id]
    );
    const recentGroupSessions = await pool.query(
      `SELECT group_name, session_name, start_time, end_time
        FROM group_studysessions
        JOIN user_studygroups USING (studygroup_id)
        JOIN studygroups USING (studygroup_id)
        WHERE user_id = $1
        AND NOW() > end_time
        ORDER BY start_time DESC
        LIMIT 2;`,
      [user_id]
    );
    res.json({
      userSessions: recentSessions.rows,
      groupSessions: recentGroupSessions.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("database error");
  }
};

const createGroupStudySession = async (req: Request, res: Response) => {
  try {
    const { studygroup_id, name, start_time, end_time } = req.body;
    //check if studygroup is not already in session, ie start_time < NOW() < end_time
    const check = await pool.query(
      `SELECT * FROM group_studysessions
          WHERE studygroup_id = $1
          AND NOW() < end_time
          AND start_time < NOW();`,
      [studygroup_id]
    );
    if (check.rows.length > 0) {
      res.send("Study group is already in session");
      return;
    }
    const newStudySession = await pool.query(
      `INSERT INTO group_studysessions (studygroup_id, session_name, start_time, end_time)
          VALUES ($1, $2, $3, $4) RETURNING *;`,
      [studygroup_id, name, start_time, end_time]
    );
    res.json(newStudySession.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getUpcomingStudySessionsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const upcomingSessions = await pool.query(
      `SELECT group_name, session_name, start_time, end_time 
       FROM group_studysessions
       JOIN user_studygroups USING (studygroup_id)
       JOIN studygroups USING (studygroup_id)
       WHERE user_id = $1
       AND start_time > NOW();`,
      [user_id]
    );
    res.json(upcomingSessions.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

export{
  createStudySession,
  completeTask,
  getActiveStudySession,
  completeActiveStudySession,
  getRecentStudySessions,
  getMapStudySessionInfo,
  createGroupStudySession,
  getUpcomingStudySessionsByUser,
  completeActiveStudySessionEarly
};
