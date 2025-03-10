import { useState } from "react";
import { useAuth } from "../../Context/useAuth";
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
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { DateTimePicker } from "../ui/datetime-picker";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Trash } from "lucide-react";
import { useMutation, useQueryClient } from "react-query";
import { startSoloStudySession } from "@/controllers/StudySessionsController";


const StudySessionModal = () => {
  const [time, setTime] = useState<string>("");
  const [sessionName, setSessionName] = useState<string>("");
  const [task, setTask] = useState<string>("");
  const [checklist, setChecklist] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStartSession = () => {
    if(!sessionName || !time) {
      toast({
        title: "Error.",
        description: "Please fill in a time and a name.",
      });
      return;
    }
    startSoloSessionMutation.mutate();
  }
  const startSoloSessionMutation = useMutation(
    () => startSoloStudySession(sessionName, time, user?.user_id!, checklist),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("activeStudySession");
        toast({
          title: "Started Session.",
          description: "Enjoy your study session.",
        });
        setSessionName("");
        setTime("");
        setChecklist([]);
      },
      onError: (error) => {
        toast({
          title: "Error.",
          description: "Failed to start session."+error,
        });
      },
      
    }
  )

  // //get user geolocation
  // useEffect(() => {
  //   navigator.geolocation.getCurrentPosition((position) => {
  //     console.log(position.coords.latitude, position.coords.longitude);
  //     setLocation({
  //       lat: position.coords.latitude,
  //       lon: position.coords.longitude,
  //     });
  //   });
  // }, []);

  const addCheckListItem = () => {
    // add checklist item to state
    if (task) {
      setChecklist([...checklist, task]);
      setTask("");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-24 text-lg">
        <BookOpen/>
          Start Solo Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start Solo Session</DialogTitle>
          <DialogDescription>
            Start a solo study session and track your progress.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="">
            <Label className="text-left mb-1">Session Name</Label>
            <Input
              id="name"
              placeholder="Enter Session Name..."
              className="col-span-3 mb-3"
              onChange={(e) => setSessionName(e.target.value)}
            />
            <Label className="text-left mb-1">End Time</Label>
            <DateTimePicker
              onSelectDate={(date: Date) => setTime(date.toISOString())}
            />
            <Label className="text-left mt-3">Add Task</Label>
            <div className="flex items-center gap-1 mt-1">
            <Input
              id="name"
              placeholder="Enter Your Task..."
              className="col-span-3 "
              onChange={(e) => setTask(e.target.value)} 
            />
            <Button onClick={addCheckListItem}>+</Button>
            
            </div>
            {
              checklist.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label className="text-left mt-3"><strong>To-Do</strong></Label>
                  <ul>
                    {checklist.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item}</span>
                        <Button variant="destructive" onClick={() => setChecklist(checklist.filter((_, i) => i !== index))} className="h-5 w-4">
                          <Trash/>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            }
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={handleStartSession}>
              Start
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudySessionModal;
