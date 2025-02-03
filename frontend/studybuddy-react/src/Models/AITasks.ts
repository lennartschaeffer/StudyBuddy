export type AITaskList = {
    tasks: AITask[];
}

export type AITask = {
    actions: string[];
    task: string;
    time: string;
}