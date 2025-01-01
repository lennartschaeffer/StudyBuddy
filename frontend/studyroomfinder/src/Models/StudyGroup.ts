export type StudyGroup = {
    studygroup_id: number;
    group_name: string;
    members: StudyGroupMember[];
}

export type StudyGroupMember = {
    member_id: number;
    member_name: string;
}

export type GroupStudySession = {
    session_id: number;
    session_name: string;
    group_name: string;
    start_time: string;
    end_time: string;
    studygroup_id: number;
}