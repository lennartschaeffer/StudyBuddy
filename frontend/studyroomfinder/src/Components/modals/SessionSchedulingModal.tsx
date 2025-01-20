import React, { useState } from "react";
import { QueryClientProvider, useMutation, useQuery, useQueryClient } from "react-query";
import { createGroupStudySession } from "../../endpoints/StudyGroups";
import { toast } from "react-toastify";
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
import { set } from "date-fns";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DateTimePicker } from "../datetime-picker";
import { Button } from "../ui/button";

interface SessionSchedulingModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  groupId: number;
}

const SessionSchedulingModal: React.FC<SessionSchedulingModalProps> = ({
  show,
  setShow,
  name,
  groupId,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sessionName, setSessionName] = useState("");
    const queryClient = useQueryClient();
  const handleScheduleSessionMutation = useMutation(
    () => createGroupStudySession(groupId, sessionName, startDate, endDate),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("upcomingSessions");
        setShow(false);
      },
      onError: (error) => {
        toast.error("Error creating group study session " + error);
        console.error("Failed to create group study session:", error);
      },
    }
  );
  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule a Study Session for {name}</DialogTitle>
          <DialogDescription>
            Schedule a study session for your group.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="">
            <Label className="text-left mb-1">Session Name</Label>
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session Name"
            />
          <Label className="text-left mb-1">Start Time</Label>
            <DateTimePicker
              onSelectDate={(date: Date) => setStartDate(date.toISOString())}
            />
            <Label className="text-left mb-1">End Time</Label>
            <DateTimePicker
              onSelectDate={(date: Date) => setEndDate(date.toISOString())}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={() => handleScheduleSessionMutation.mutate()}
            >
              Start
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionSchedulingModal;
