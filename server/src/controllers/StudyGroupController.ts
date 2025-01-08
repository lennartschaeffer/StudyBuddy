import { Request, Response } from "express";
import { supabase } from "../supabaseClient";

type StudyGroup = {
  studygroup_id: number;
  group_name: string;
};

export const getStudyGroupsByUserHelper = async (user_id: string) => {
  const { data: userStudyGroups, error } = await supabase
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

  const studyGroups = userStudyGroups.map((userStudyGroup: any) => userStudyGroup.studygroups);
  return studyGroups;
}

const createStudyGroup = async (req: Request, res: Response) => {
  try {
    const { user_id, group_name } = req.body;
    const { data: newGroup, error } = await supabase.from("studygroups").insert({
      group_name: group_name
    }).select();

    if (error) {
      res.status(500).send("Database error");
      console.error('create study group error' + error);
      return;
    }
    console.log(newGroup);
    
    const studyGroup: StudyGroup = newGroup[0];
    const { error: userGroupError } = await supabase.from("user_studygroups").insert({
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
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const joinStudyGroup = async (req: Request, res: Response) => {
  try {
    const { user_id, studygroup_id } = req.body;
    const { error } = await supabase.from("user_studygroups").insert({
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
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getStudyGroupsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const studyGroups = await getStudyGroupsByUserHelper(user_id);
    res.send(studyGroups);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const inviteToStudyGroup = async (req: Request, res: Response) => {
  try {
    const { sender_id, receiver_id, studygroup_id } = req.body;
    const { data: existingUser, error: checkError } = await supabase
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

    const { error } = await supabase.from("studygroup_invites").insert({
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
      const { error: insertError } = await supabase.from("user_studygroups").insert({
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

      const { error: updateError } = await supabase.from("studygroup_invites")
        .update({ status: 'accepted' })
        .eq("studygroup_invite_id", studygroup_invite_id);

      if (updateError) {
        res.status(500).send("Database error");
        console.error('respond to study group invite update error' + updateError);
        return;
      }
    } else {
      const { error: updateError } = await supabase.from("studygroup_invites")
        .update({ status: 'rejected' })
        .eq("studygroup_invite_id", studygroup_invite_id);

      if (updateError) {
        res.status(500).send("Database error");
        console.error('respond to study group invite update error' + updateError);
        return;
      }
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
