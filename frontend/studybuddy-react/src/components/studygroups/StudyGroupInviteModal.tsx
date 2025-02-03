import React from "react";
import { useAuth } from "../../Context/useAuth";
import { useGetFriendsAndInvites } from "../../Context/useGetFriendsAndInvites";
import { useMutation, useQueryClient } from "react-query";
import { inviteToStudyGroup } from "../../controllers/StudyGroupsController";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { LoadingSymbol } from "../ui/LoadingSymbol";
import { Friend } from "@/Models/RequestsAndInvites";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudyGroupInviteModalProps {
  name: string;
  studygroup_id: number;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const StudyGroupInviteModal: React.FC<StudyGroupInviteModalProps> = ({
  name,
  studygroup_id,
  show,
  setShow,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { friendsAndInvites, isLoading } = useGetFriendsAndInvites();
  const { toast } = useToast();

  const inviteToStudyGroupMutation = useMutation(
    ({
      sender_id,
      receiver_id,
      studygroup_id,
    }: {
      sender_id: number;
      receiver_id: number;
      studygroup_id: number;
    }) => inviteToStudyGroup(sender_id, receiver_id, studygroup_id),
    {
      onSuccess: () => {
        toast({
          title: "Invited to study group.",
          description: "Invited buddy to study group.",
        })
        queryClient.invalidateQueries("studyGroups");
      },
      onError: (error) => {
        toast({
          title: "Error.",
          description: "Couldnt invite buddy to study group."+error,
        })
      },
    }
  );

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite a Buddy to {name}</DialogTitle>
          <DialogDescription>
            Invite a buddy to your study group.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ScrollArea className="max-h-[100px]">
            {isLoading && <LoadingSymbol />}
            {friendsAndInvites?.friends.map((friend: Friend, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between py-4 border-b last:border-b-0"
              >
                <div>
                  <h3 className="font-semibold">{friend.username}</h3>
                </div>
                <div className="flex items-center">
                  <Button
                    onClick={() =>
                      inviteToStudyGroupMutation.mutate({
                        sender_id: user?.user_id!,
                        receiver_id: friend.user_id,
                        studygroup_id: studygroup_id,
                      })
                    }
                  >
                    <Mail />
                  </Button>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudyGroupInviteModal;
