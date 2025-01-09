import { relations } from "drizzle-orm/relations";
import { studygroups, userStudygroups, users, studygroupInvites, groupStudysessions, studysessionChecklists, soloStudysessions, friends, friendrequests, studysessionTasks } from "./schema";

export const userStudygroupsRelations = relations(userStudygroups, ({one}) => ({
	studygroup: one(studygroups, {
		fields: [userStudygroups.studygroupId],
		references: [studygroups.studygroupId]
	}),
	user: one(users, {
		fields: [userStudygroups.userId],
		references: [users.userId]
	}),
}));

export const studygroupsRelations = relations(studygroups, ({many}) => ({
	userStudygroups: many(userStudygroups),
	studygroupInvites: many(studygroupInvites),
	groupStudysessions: many(groupStudysessions),
}));

export const usersRelations = relations(users, ({many}) => ({
	userStudygroups: many(userStudygroups),
	studygroupInvites_receiverId: many(studygroupInvites, {
		relationName: "studygroupInvites_receiverId_users_userId"
	}),
	studygroupInvites_senderId: many(studygroupInvites, {
		relationName: "studygroupInvites_senderId_users_userId"
	}),
	soloStudysessions: many(soloStudysessions),
	friends_friendId: many(friends, {
		relationName: "friends_friendId_users_userId"
	}),
	friends_userId: many(friends, {
		relationName: "friends_userId_users_userId"
	}),
	friendrequests_receiverId: many(friendrequests, {
		relationName: "friendrequests_receiverId_users_userId"
	}),
	friendrequests_senderId: many(friendrequests, {
		relationName: "friendrequests_senderId_users_userId"
	}),
}));

export const studygroupInvitesRelations = relations(studygroupInvites, ({one}) => ({
	user_receiverId: one(users, {
		fields: [studygroupInvites.receiverId],
		references: [users.userId],
		relationName: "studygroupInvites_receiverId_users_userId"
	}),
	user_senderId: one(users, {
		fields: [studygroupInvites.senderId],
		references: [users.userId],
		relationName: "studygroupInvites_senderId_users_userId"
	}),
	studygroup: one(studygroups, {
		fields: [studygroupInvites.studygroupId],
		references: [studygroups.studygroupId]
	}),
}));

export const groupStudysessionsRelations = relations(groupStudysessions, ({one}) => ({
	studygroup: one(studygroups, {
		fields: [groupStudysessions.studygroupId],
		references: [studygroups.studygroupId]
	}),
}));

export const soloStudysessionsRelations = relations(soloStudysessions, ({one, many}) => ({
	studysessionChecklist: one(studysessionChecklists, {
		fields: [soloStudysessions.checklistId],
		references: [studysessionChecklists.checklistId],
		relationName: "soloStudysessions_checklistId_studysessionChecklists_checklistId"
	}),
	user: one(users, {
		fields: [soloStudysessions.userId],
		references: [users.userId]
	}),
	studysessionChecklists: many(studysessionChecklists, {
		relationName: "studysessionChecklists_sessionId_soloStudysessions_sessionId"
	}),
}));

export const studysessionChecklistsRelations = relations(studysessionChecklists, ({one, many}) => ({
	soloStudysessions: many(soloStudysessions, {
		relationName: "soloStudysessions_checklistId_studysessionChecklists_checklistId"
	}),
	soloStudysession: one(soloStudysessions, {
		fields: [studysessionChecklists.sessionId],
		references: [soloStudysessions.sessionId],
		relationName: "studysessionChecklists_sessionId_soloStudysessions_sessionId"
	}),
	studysessionTasks: many(studysessionTasks),
}));

export const friendsRelations = relations(friends, ({one}) => ({
	user_friendId: one(users, {
		fields: [friends.friendId],
		references: [users.userId],
		relationName: "friends_friendId_users_userId"
	}),
	user_userId: one(users, {
		fields: [friends.userId],
		references: [users.userId],
		relationName: "friends_userId_users_userId"
	}),
}));

export const friendrequestsRelations = relations(friendrequests, ({one}) => ({
	user_receiverId: one(users, {
		fields: [friendrequests.receiverId],
		references: [users.userId],
		relationName: "friendrequests_receiverId_users_userId"
	}),
	user_senderId: one(users, {
		fields: [friendrequests.senderId],
		references: [users.userId],
		relationName: "friendrequests_senderId_users_userId"
	}),
}));

export const studysessionTasksRelations = relations(studysessionTasks, ({one}) => ({
	studysessionChecklist: one(studysessionChecklists, {
		fields: [studysessionTasks.checklistId],
		references: [studysessionChecklists.checklistId]
	}),
}));