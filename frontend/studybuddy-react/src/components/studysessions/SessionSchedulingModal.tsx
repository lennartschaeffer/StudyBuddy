import React, { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { createGroupStudySession } from "../../endpoints/StudyGroups";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DateTimePicker } from "../ui/datetime-picker";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const handleScheduleSessionMutation = useMutation(
    () => createGroupStudySession(groupId, sessionName, startDate, endDate),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("upcomingSessions");
        toast({
          title: "Session scheduled.",
          description: "Study session has been scheduled.",
        });
        setShow(false);
      },
      onError: (error) => {
        toast({
          title: "Error.",
          description: "Failed to create group study session.",
        });
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
            <Button onClick={() => handleScheduleSessionMutation.mutate()}>
              Start
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionSchedulingModal;
