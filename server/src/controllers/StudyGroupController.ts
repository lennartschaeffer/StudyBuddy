import { Request, Response } from "express";
import { supabase } from "../supabaseClient";
import prisma from "../prismaClient";

type StudyGroup = {
  studygroup_id: number;
  group_name: string;
};


const createStudyGroup = async (req: Request, res: Response) => {
  try {
    const { user_id, group_name } = req.body;

    await prisma.$transaction(async (prisma) => {
      // Step 1: Create the study group
      const studygroup = await prisma.studygroups.create({
        data: {
          group_name: group_name,
        },
      });
  
      // Step 2: Use the studygroup_id from the previous query for user_studygroups
      await prisma.user_studygroups.create({
        data: {
          user_id: user_id,
          user_role: 'admin',
          studygroup_id: studygroup.studygroup_id, // Reference the returned studygroup_id
        },
      });
    });
    
    res.send("Study group created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const joinStudyGroup = async (req: Request, res: Response) => {
  try {
    const { user_id, studygroup_id } = req.body;
    await prisma.user_studygroups.create({
      data: {
        studygroup_id: studygroup_id,
        user_id: user_id,
        user_role: 'member',
        joined_at: new Date().toISOString()
      }
    });
    res.send("User joined study group successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getStudyGroupsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const studyGroups = await prisma.user_studygroups.findMany({
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
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const inviteToStudyGroup = async (req: Request, res: Response) => {
  try {
    const { sender_id, receiver_id, studygroup_id } = req.body;
    //check if user already exists in the studygroup
    const check = await prisma.user_studygroups.findFirst({
      where: {
        user_id: receiver_id,
        studygroup_id: studygroup_id
      }
    })
    if (check) {
      res.send("User is already in the study group");
      return;
    }
    //check if the invite already exists
    const existingInvite = await prisma.studygroup_invites.findFirst({
      where: {
        receiver_id: receiver_id,
        studygroup_id: studygroup_id
      }
    });

    if(existingInvite) {
      res.send("User has already been invited to the study group");
      return;
    }
    //insert the invite
    await prisma.studygroup_invites.create({
      data: {
        sender_id: sender_id,
        receiver_id: receiver_id,
        studygroup_id: studygroup_id,
        created_at: new Date().toISOString()
      }
    });

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

    if (response === "accepted") {
      await prisma.user_studygroups.create({
        data: {
          user_id: user_id,
          studygroup_id: studygroup_id,
          user_role: 'member',
          joined_at: new Date().toISOString()
        }
      });

      await prisma.studygroup_invites.update({
        where: {
          studygroup_invite_id: studygroup_invite_id
        },
        data: {
          status: 'accepted'
        }
      });
    } else {
     await prisma.studygroup_invites.update({
        where: {
          studygroup_invite_id: studygroup_invite_id
        },
        data: {
          status: 'rejected'
        }
      });
    }
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
