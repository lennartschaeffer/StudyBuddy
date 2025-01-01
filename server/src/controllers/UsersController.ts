import { Request, Response } from "express";

import pool from "../db";

const getPotentialFriends = async(req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
        const users = await pool.query(
            `SELECT u.first_name, u.last_name, u.username, u.user_id
             FROM users u
             LEFT JOIN friends f1 ON u.user_id = f1.friend_id AND f1.user_id = $1
             LEFT JOIN friends f2 ON u.user_id = f2.user_id AND f2.friend_id = $1
             WHERE u.user_id != $1 AND f1.friend_id IS NULL AND f2.user_id IS NULL;`,
            [user_id]
          );
        res.json(users.rows)
    } catch (error) {
        console.error(error)
        res.status(500).send("database error")
    }
}

export { getPotentialFriends}