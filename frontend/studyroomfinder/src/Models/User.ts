export type UserProfileToken = {
    username: string;
    token: string;
}

export type UserProfile = {
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    degree: string;
    university: string;
}

export type UserProfileInfo = {
    totalStudyTime: string;
    numberOfStudyGroups: number;
    numberOfStudySessions: number;
    averageStudyTime: string;
}