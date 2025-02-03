import { useState } from "react";
import {
  useMutation,
  useQueryClient,
} from "react-query";
import { createGroupStudySession } from "../../controllers/StudyGroupsController";
import { useGetStudyGroups } from "../../Context/useGetStudyGroups";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "@radix-ui/react-dropdown-menu";
import {
  Users,
} from "lucide-react";
import { DateTimePicker } from "../ui/datetime-picker";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { StudyGroup } from "@/Models/StudyGroup";
import { useToast } from "@/hooks/use-toast";


const CreateGroupStudySessionModal = () => {
  const [endTime, setEndTime] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [studyGroup, setStudyGroup] = useState<number>();
  const queryClient = useQueryClient();
  const { studyGroups } = useGetStudyGroups();

  const { toast } = useToast();

  const handleStartGroupStudySessionMutation = useMutation(
    () =>
      createGroupStudySession(
        studyGroup!,
        sessionName ?? "Study Session",
        "",
        endTime
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("activeStudySession");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Error creating group study session"+error,
        });
      },
    }
  );
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-24 text-lg">
          <Users />
          Start Group Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start Group Session</DialogTitle>
          <DialogDescription>
            Create a new group study session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="">
            <Select
              onValueChange={(value) => {
                const selectedGroup = studyGroups?.find(
                  (group) => group.group_name === value
                );
                if (selectedGroup) {
                  console.log(selectedGroup.studygroup_id); // Logs the ID
                  setStudyGroup(selectedGroup.studygroup_id); // Updates state
                }
              }}
            >
              <SelectTrigger className="mb-4">
                <SelectValue placeholder="Study Group" />
              </SelectTrigger>
              <SelectContent>
                {studyGroups?.map((group: StudyGroup, id: number) => (
                  <SelectItem
                    key={id}
                    value={group.group_name}
                  >
                    {group.group_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label className="text-left mb-1">Session Name</Label>
            <Input
              id="name"
              placeholder="Enter Session Name..."
              className="col-span-3 mb-3"
              onChange={(e) => setSessionName(e.target.value)}
            />
            <Label className="text-left mb-1">End Time</Label>
            <DateTimePicker
              onSelectDate={(date: Date) => setEndTime(date.toISOString())}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={() => handleStartGroupStudySessionMutation.mutate()}
            >
              Start
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupStudySessionModal;
