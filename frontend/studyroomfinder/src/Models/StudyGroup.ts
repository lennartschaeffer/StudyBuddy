export type StudyGroup = {
    studygroup_id: number;
    name: string;
    members: StudyGroupMember[];
}

export type StudyGroupMember = {
    member_id: number;
    member_name: string;
}