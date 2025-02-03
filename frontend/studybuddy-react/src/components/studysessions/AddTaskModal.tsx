import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useMutation, useQueryClient } from "react-query";
import { addTask } from "@/controllers/StudySessionsController";
import { useToast } from "@/hooks/use-toast";

interface AddTaskModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  checklist_id: number;
  session_id: number;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  show,
  setShow,
  checklist_id,
  session_id
}) => {
  const [taskName, setTaskName] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addTaskMutation = useMutation(() => addTask(taskName, checklist_id, session_id), {
    onSuccess: () => {
      queryClient.invalidateQueries("activeStudySession");
      setShow(false);
      toast({
        title: "Task added.",
        description: "Task has been added to the session.",
      });
    },
    onError: (error) => {
      console.error("Failed to add task:", error);
      toast({
        title: "Error.",
        description: "Failed to add task.",
      });
    },
  });
  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a task</DialogTitle>
          <DialogDescription>Add a task to your session.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="">
            <Label className="text-left mb-1">Task Name</Label>
            <Input
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Task Name..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => {
            addTaskMutation.mutate()}}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
