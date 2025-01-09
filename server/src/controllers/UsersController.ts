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

export { getPotentialFriends };
