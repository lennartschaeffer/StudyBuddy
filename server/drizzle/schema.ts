import { pgTable, foreignKey, bigint, text, timestamp, unique, varchar, uuid, type AnyPgColumn, doublePrecision, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userStudygroups = pgTable("user_studygroups", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userStudygroupId: bigint("user_studygroup_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "user_studygroups_user_studygroup_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	userRole: text("user_role").default('member').notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	studygroupId: bigint("studygroup_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.studygroupId],
			foreignColumns: [studygroups.studygroupId],
			name: "user_studygroups_studygroup_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_studygroups_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const studygroupInvites = pgTable("studygroup_invites", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	studygroupInviteId: bigint("studygroup_invite_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "studygroup_invites_studygroup_invite_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	studygroupId: bigint("studygroup_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	senderId: bigint("sender_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	receiverId: bigint("receiver_id", { mode: "number" }).notNull(),
	status: text().default('pending').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [users.userId],
			name: "studygroup_invites_receiver_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.userId],
			name: "studygroup_invites_sender_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.studygroupId],
			foreignColumns: [studygroups.studygroupId],
			name: "studygroup_invites_studygroup_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const users = pgTable("users", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "users_user_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	username: varchar().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	university: text().default('Not Enrolled'),
	degree: text().default('None'),
	email: text().notNull(),
	authId: uuid("auth_id").notNull(),
}, (table) => [
	unique("users_username_key").on(table.username),
	unique("users_auth_id_key").on(table.authId),
]);

export const groupStudysessions = pgTable("group_studysessions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	groupStudysessionsId: bigint("group_studysessions_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "group_studysessions_group_studysessions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	startTime: timestamp("start_time", { withTimezone: true, mode: 'string' }).defaultNow(),
	endTime: timestamp("end_time", { withTimezone: true, mode: 'string' }),
	sessionName: text("session_name").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	studygroupId: bigint("studygroup_id", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.studygroupId],
			foreignColumns: [studygroups.studygroupId],
			name: "group_studysessions_studygroup_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const soloStudysessions = pgTable("solo_studysessions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sessionId: bigint("session_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "solo_studysessions_session_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	startTime: timestamp("start_time", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	endTime: timestamp("end_time", { withTimezone: true, mode: 'string' }).notNull(),
	sessionName: text("session_name").default('Study Session'),
	lat: doublePrecision(),
	lon: doublePrecision(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	checklistId: bigint("checklist_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.checklistId],
			foreignColumns: [studysessionChecklists.checklistId],
			name: "solo_studysessions_checklist_id_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "solo_studysessions_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const friends = pgTable("friends", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	friendshipId: bigint("friendship_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "friends_friendship_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	friendId: bigint("friend_id", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.friendId],
			foreignColumns: [users.userId],
			name: "friends_friend_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "friends_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const studysessionChecklists: any = pgTable("studysession_checklists", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	checklistId: bigint("checklist_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "studysession_checklists_checklist_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sessionId: bigint("session_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [soloStudysessions.sessionId],
			name: "studysession_checklists_session_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const friendrequests = pgTable("friendrequests", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	friendrequestId: bigint("friendrequest_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "friendrequests_friendrequest_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	senderId: bigint("sender_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	receiverId: bigint("receiver_id", { mode: "number" }).notNull(),
	status: text().default('pending'),
}, (table) => [
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [users.userId],
			name: "friendrequests_receiver_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.userId],
			name: "friendrequests_sender_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const studysessionTasks = pgTable("studysession_tasks", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	taskId: bigint("task_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "studysession_tasks_task_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	taskName: text("task_name").notNull(),
	taskCompleted: boolean("task_completed").default(false),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	checklistId: bigint("checklist_id", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.checklistId],
			foreignColumns: [studysessionChecklists.checklistId],
			name: "studysession_tasks_checklist_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const studygroups = pgTable("studygroups", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	studygroupId: bigint("studygroup_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "studygroups_studygroup_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	groupName: text("group_name").default("Study Group").notNull(),
});
