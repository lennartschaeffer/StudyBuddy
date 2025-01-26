import { Request, Response } from "express";
import prisma from "../prismaClient";

const getPotentialFriends = async (req: Request, res: Response) => {
  const user_id = Number(req.params.user_id);

  try {
    const potentialFriends = await prisma.users.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).send("database error");
  }
};
const getProfileInfo = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const totalStudyTime = await getTotalStudyTime(user_id);
    const numberOfStudyGroups = await getNumberOfStudyGroups(user_id);
    const numberOfStudySessions = await getNumberOfStudySessions(user_id);
    const averageStudyTime = await getAvgStudySessionTime(user_id);
    res.json({
      totalStudyTime: totalStudyTime,
      numberOfStudyGroups: numberOfStudyGroups,
      numberOfStudySessions: numberOfStudySessions,
      averageStudyTime: averageStudyTime,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("database error");
  }
};

const getNumberOfStudyGroups = async (userId: string) => {
  try {
    //get the number of study groups the user is in
    const numberOfStudyGroups = await prisma.user_studygroups.count({
      where: {
        user_id: Number(userId),
      },
    });
    return numberOfStudyGroups;
  } catch (error) {
    console.error(error);
    throw new Error("Error getting number of study groups");
  }
};
const getNumberOfStudySessions = async (userId: string) => {
  try {
    //get the number of study sessions the user has completed
    const numberOfStudySessions = await prisma.solo_studysessions.count({
      where: {
        user_id: Number(userId),
      },
    });
    return numberOfStudySessions;
  } catch (error) {
    console.error(error);
    throw new Error("Error getting number of study sessions");
  }
};
const getTotalStudyTime = async (userId: string) => {
  try {
    const times = await prisma.solo_studysessions.findMany({
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
      total += time.end_time.getTime() - time.start_time.getTime();
    });
    //convert to minutes
    total = total / 60000;
    return total;
  } catch (error) {
    console.error(error);
    throw new Error("Error getting total study time");
  }
};

const getAvgStudySessionTime = async (userId: string) => {
  try {
    //get times
    const times = await prisma.solo_studysessions.findMany({
      select: {
        session_id: true,
        start_time: true,
        end_time: true,
      },
    });
    let sum = 0;
    //sum up the times
    times.forEach((time) => {
      const diff = time.end_time.getTime() - time.start_time.getTime();
      sum += diff / 60000; //parse to minutes
    });
    //console.log(sum, times.length, (sum/times.length))
    const avg = (sum / times.length);
    return avg;
  } catch (error) {
    console.error(error);
    throw new Error("Error getting average study time");
  }
};

export { getPotentialFriends, getProfileInfo };
