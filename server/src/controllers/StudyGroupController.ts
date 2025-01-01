import { Request, Response } from "express";

import pool from "../db";

const createStudyGroup = async (req: Request, res: Response) => {
  try {
    const { user_id, group_name } = req.body;
    await pool.query("BEGIN");
    const newGroup = await pool.query(
      `
                INSERT INTO studygroups (group_name, created_at) 
                VALUES ($1, NOW()) 
                RETURNING *;
            `,
      [group_name]
    );

    if (newGroup.rows.length == 0) {
      await pool.query("ROLLBACK");
      res.status(500).send("Database error");
      return;
    }
    await pool.query(
      `
                INSERT INTO user_studygroups (studygroup_id, user_id, user_role, joined_at) 
                VALUES ($1, $2, 'admin', NOW());
            `,
      [newGroup.rows[0].studygroup_id, user_id]
    );

    await pool.query("COMMIT");
    res.send("Study group created successfully");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).send("Database error");
  }
};

const joinStudyGroup = async (req: Request, res: Response) => {
  try {
    const { user_id, studygroup_id } = req.body;
    await pool.query(
      `
            INSERT INTO user_studygroups (studygroup_id, user_id, user_role, joined_at)
            VALUES ($1, $2, 'member', NOW());
            `,
      [studygroup_id, user_id]
    );
    res.send("User joined study group successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getStudyGroupsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    //get all study groups that the user is in as well as the other members
    const studyGroups = await pool.query(
      `
            WITH user_groups AS (
                SELECT 
                    sg.studygroup_id,
                    sg.group_name
                FROM 
                    studygroups sg
                JOIN 
                    user_studygroups usg USING(studygroup_id)
                WHERE 
                    usg.user_id = $1
            )
            SELECT 
                ug.studygroup_id,
                ug.group_name,
                u.user_id AS member_id,
                u.first_name AS member_name
            FROM 
                user_groups ug
            INNER JOIN 
                user_studygroups USING (studygroup_id)
            INNER JOIN 
                users u USING(user_id)
            ORDER BY 
                ug.studygroup_id, ug.group_name;
            `,
      [user_id]
    );
    if (studyGroups.rows.length > 0) {
      interface StudyGroup {
        studygroup_id: number;
        group_name: string;
        members: Member[];
      }

      interface Member {
        member_id: number;
        member_name: string;
      }
      const studyGroupsById: { [key: number]: StudyGroup } =
        studyGroups.rows.reduce(
          (acc: { [key: number]: StudyGroup }, group: any) => {
            if (!acc[group.studygroup_id]) {
              acc[group.studygroup_id] = {
                studygroup_id: group.studygroup_id,
                group_name: group.group_name,
                members: [],
              };
            }
            acc[group.studygroup_id].members.push({
              member_id: group.member_id,
              member_name: group.member_name,
            });
            return acc;
          },
          {}
        );
      res.json(Object.values(studyGroupsById));
    } else {
      res.send("User is not in any study groups");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const inviteToStudyGroup = async (req: Request, res: Response) => {
  try {
    const { sender_id, receiver_id, studygroup_id } = req.body;
    //check is the receiver is already in the group
    const check = await pool.query(
      `
            SELECT * FROM user_studygroups
            WHERE user_id = $1
            AND studygroup_id = $2;
            `,
      [receiver_id, studygroup_id]
    );
    if (check.rows.length > 0) {
      res.send("User is already in the study group");
      return;
    }
    await pool.query(
      `
            INSERT INTO studygroup_invites (sender_id, receiver_id, studygroup_id, created_at)
            VALUES ($1, $2, $3, NOW());
            `,
      [sender_id, receiver_id, studygroup_id]
    );
    res.send("Invite sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const respondToStudyGroupInvite = async (req: Request, res: Response) => {
  try {
    const { studygroup_id, studygroup_invite_id, response, user_id } = req.body;
    if (!["accepted", "rejected"].includes(response)) {
      res.status(400).send("Invalid response");
      return;
    }
    await pool.query("BEGIN");
    if (response === "accepted") {
      await pool.query(
        `
                INSERT INTO user_studygroups (studygroup_id, user_id, user_role, joined_at)
                VALUES ($1, $2, 'member', NOW())
                `,
        [studygroup_id, user_id]
      );
      //update invites table
      await pool.query(
        `
                UPDATE studygroup_invites
                SET status = 'accepted'
                WHERE studygroup_invite_id = $1
                `,
        [studygroup_invite_id]
      );
    } else {
      await pool.query(
        `
                UPDATE studygroup_invites
                SET status = 'rejected'
                WHERE studygroup_invite_id = $1
                `,
        [studygroup_invite_id]
      );
    }
    await pool.query("COMMIT");
    res.send("Response recorded successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};
export {
  createStudyGroup,
  joinStudyGroup,
  getStudyGroupsByUser,
  inviteToStudyGroup,
  respondToStudyGroupInvite,
};
