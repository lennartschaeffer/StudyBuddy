const pool = require("../db");

const sendFriendRequest = async (req, res, io) => {
  try {
    const { sender_id, receiver_id } = req.body;
    //check if request already exists
    const exists = await pool.query(
      `SELECT * FROM friendrequests 
            WHERE (sender_id = $1 
            AND receiver_id = $2)
            OR (sender_id = $2
            AND receiver_id = $1)
            AND status = 'pending';`,
      [sender_id, receiver_id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Friend request already sent." });
    }

    await pool.query(
      `
            INSERT INTO friendrequests (sender_id, receiver_id) VALUES($1,$2)
            `,
      [sender_id, receiver_id]
    );

    //emit web socket event
    io.emit("friendRequest", { sender_id, receiver_id });

    res.status(201).json({ message: "Friend Request Sent!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error sending friend request, please try again later.");
  }
};

const respondToFriendRequest = async (req, res, io) => {
  try {
    const { request_id, response } = req.body;
    if (!["accepted", "rejected"].includes(response)) {
      return res.status(400).json({ error: "Invalid response." });
    }
    
    //start transaction
    await pool.query("BEGIN");

    //if the request was accepted, insert a new row into the table
    if (response === "accepted") {
      //update the request and get the sender and receiver id
      const updatedRequest = await pool.query(
        `
                    UPDATE friendrequests 
                    SET status = 'accepted' 
                    WHERE friendrequest_id = $1 
                    RETURNING *
                `,
        [request_id]
      );

      if (updatedRequest.rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(404).json({ error: "Friend request not found." });
      }

      const { sender_id, receiver_id } = updatedRequest.rows[0];
      

      //insert the friendship into the friends table
      await pool.query(
        `
                    INSERT INTO friends (user_id, friend_id) VALUES ($1,$2);
                `,
        [sender_id, receiver_id]
      );

      //emit web socket event
      io.emit("friendRequestResponse", { sender_id, receiver_id, response });

    } else {
      //if they choose to reject it, delete the row from the friendrequest table
      await pool.query(
        `UPDATE friendrequests 
         SET status = 'rejected' 
         WHERE friendrequest_id = $1;`,
        [request_id]
      );

      // Emit WebSocket event for friend request response
      const rejectedRequest = await pool.query(
        `SELECT sender_id, receiver_id FROM friendrequests WHERE friendrequest_id = $1;`,
        [request_id]
      );

      if (rejectedRequest.rows.length > 0) {
        const { sender_id, receiver_id } = rejectedRequest.rows[0];
        io.emit("friendRequestResponse", { sender_id, receiver_id, response });
      }
    }

    await pool.query("COMMIT");

    res.status(200).json({ message: `Friend request ${response}.` });

    
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res
      .status(500)
      .send("Error sending friend request, please try again later.");
  }
};

//get all pending requests
const getPendingRequests = async (req, res) => {
  try {
    const { receiver_id } = req.params;
    const pendingFriendRequests = await pool.query(
      `SELECT u.username, u.first_name, u.last_name, fr.friendrequest_id
       FROM friendrequests fr
        JOIN users u ON u.user_id = fr.sender_id
        WHERE fr.status = 'pending'
        AND fr.receiver_id = $1;`
      ,[receiver_id]
    );
    const pendingGroupInvites = await pool.query(
      `SELECT sgi.studygroup_invite_id, sg.name, sg.studygroup_id, u.username, u.first_name, u.last_name
       FROM studygroup_invites sgi
       JOIN users u ON u.user_id = sgi.sender_id
       JOIN studygroups sg ON sg.studygroup_id = sgi.studygroup_id
       WHERE sgi.status = 'pending'
       AND sgi.receiver_id = $1;`
      ,[receiver_id]
    );

    res.json({
      friendRequests: pendingFriendRequests.rows ?? "No pending friend requests",
      groupInvites: pendingGroupInvites.rows ?? "No pending group invites"
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error sending friend request, please try again later.");
  }
};

module.exports = {
  sendFriendRequest,
  respondToFriendRequest,
  getPendingRequests,
};
