export type StudyGroup = {
    studygroup_id: number;
    group_name: string;
    members: StudyGroupMember[];
}

export type StudyGroupMember = {
    member_id: number;
    member_name: string;
}

