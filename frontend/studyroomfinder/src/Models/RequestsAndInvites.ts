export type FriendRequest = {
  request_id: number;
  username: string;
  first_name: string;
  last_name: string;
};

export type GroupInvite = {
  group_name: string;
  studygroup_id: number;
  invite_id: number;
  username: string;
  first_name: string;
  last_name: string;
};

export type Friend = {
  username: string;
  first_name: string;
  last_name: string;
  user_id: number;
};

export type FriendsAndInvites = {
  friendRequests: FriendRequest[];
  groupInvites: GroupInvite[];
  friends: Friend[];
};
