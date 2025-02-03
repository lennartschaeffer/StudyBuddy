import { SoloStudySession } from "@/Models/StudySession";
import axios from "axios";

export const getActionPlan = async (soloSession: SoloStudySession) => {
  try {
    if (!soloSession?.tasks || !soloSession.end_time) {
      throw new Error("Cannot generate action plan without tasks or end time");
    }
    const cleanedDate = new Date(soloSession.end_time).toISOString();
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
        import.meta.env.VITE_GEMINI_API_KEY
      }`,
      {
        contents: [
          {
            parts: [
              {
                text: `The current date and time is ${new Date().toISOString()}. I'm studying until ${cleanedDate}. I need you to make me
                a schedule with an action plan for each task in the following JSON format:
                {
                    "tasks": [
                        {
                            "task": "Task name",
                            "actions": {
                                [
                                    "Step 1: Action 1.",
                                    "Step 2: Action 2."
                                ]
                            },
                            "time": "Time to spend on task"
                        },
                        {
                            "task": "Task name",
                            "actions": {
                                [
                                    "Step 1: Action 1.",
                                    "Step 2: Action 2."
                                ]
                            },
                            "time": "Time to spend on task"
                        },
                    ]
                }.
                These are the tasks I need to complete:
                `,
              },
              ...soloSession.tasks.map((task) => ({
                text: task.task_name,
              })),
            ],
          },
        ],
      },
      {
        withCredentials: false,
      }
    );
    const raw_response = res.data.candidates[0].content.parts[0].text;
    const cleaned_response = raw_response
      .replace("```json", "")
      .replace("```", "")
      .trim();
    const result = JSON.parse(cleaned_response);
    return result;
  } catch (error) {
    throw error;
  }
};
