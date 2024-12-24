const pool = require("../db");

const getFriendsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      `SELECT u.username, u.first_name, u.last_name, f.created_at, u.user_id
       FROM friends f
       JOIN users u ON (u.user_id = f.friend_id OR u.user_id = f.user_id)
       WHERE (f.user_id = $1 OR f.friend_id = $1)
       AND u.user_id != $1;;
            ;`,
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const removeFriend = async (req, res) => {
  try {
    const { user_id, friend_id } = req.params;
    await pool.query("BEGIN");
    const result = await pool.query(
      `DELETE FROM friends 
            WHERE (user_id = $1 AND friend_id = $2)
            OR (user_id = $2 AND friend_id = $1)
            ;`,
      [user_id, friend_id]
    );
    //delete the friendship request as well
    await pool.query(
      `DELETE FROM friendrequests
            WHERE (sender_id = $1 AND receiver_id = $2)
            OR (sender_id = $2 AND receiver_id = $1)
            ;`,
      [user_id, friend_id]
    );
    await pool.query("COMMIT");
    res.json({ message: "Friend removed" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getAllFriendsInSession = async (req, res) => {
  try {
    const { user_id } = req.params;
    const res = await pool.query(
      `
        SELECT u.username, u.first_name, u.last_name, u.user_id, s.endtime, s.session_name
        FROM friends f
        JOIN users u ON (u.user_id = f.friend_id OR u.user_id = f.user_id)
	      JOIN studysessions s ON u.user_id = s.user_id
        WHERE (f.user_id = $1 OR f.friend_id = $1)
	      AND s.session_completed = false
        AND u.user_id != $1;
        `,
      [user_id]
    );
    res.json(res.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

module.exports = { getFriendsByUser, removeFriend, getAllFriendsInSession };
