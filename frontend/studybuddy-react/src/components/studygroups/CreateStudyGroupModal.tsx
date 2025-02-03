import React, { useState } from "react";
import {
  useMutation,
  useQueryClient,
} from "react-query";
import { createStudyGroup } from "../../controllers/StudyGroupsController";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/Context/useAuth";

interface CreateStudyGroupModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateStudyGroupModal: React.FC<CreateStudyGroupModalProps> = ({
  show,
  setShow,
}) => {
  const [groupName, setGroupName] = useState<string>("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {toast }= useToast();
  const createStudyGroupMutation = useMutation(
    () =>
   createStudyGroup(groupName ?? 'Study Group', user?.user_id!),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("studyGroups");
        //toast.success("Created Study Group");
        toast({
          title: "Success.",
          description: "You have successfully created a study group.",
        })
        setShow(false);
      },
      onError: (error) => {
        toast({
          title: "Error.",
          description: "Failed to create study group."+error,
        })
      },
    }
  );

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a Study Group</DialogTitle>
          <DialogDescription>
            Studying alone is boring. Create a study group and invite your friends!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="">
            <Label className="text-left mb-1">Group Name</Label>
            <Input
              id="name"
              placeholder="Enter Group Name..."
              className="col-span-3 mb-3"
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={() => createStudyGroupMutation.mutate()}
            >
              Start
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudyGroupModal;
