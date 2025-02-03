import { LoadingSymbol } from "@/components/ui/LoadingSymbol";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/Context/useAuth";
import { useGetFriendsAndInvites } from "@/Context/useGetFriendsAndInvites";
import {
  removeFriend,
  respondToFriendRequest,
  respondToGroupInvite,
} from "@/controllers/FriendRequestsController";
import { useToast } from "@/hooks/use-toast";
import { FriendRequest, GroupInvite } from "@/Models/RequestsAndInvites";
import { Buddy } from "@/Models/StudyBuddy";

import { Check, Minus, Search } from "lucide-react";

import { useMutation, useQueryClient } from "react-query";

const FriendsAndInvitesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { friendsAndInvites, isLoading } = useGetFriendsAndInvites();
  const queryClient = useQueryClient();

  console.log(friendsAndInvites);

  const respondToFriendRequestMutation = useMutation(
    ({ request_id, response }: { request_id: number; response: string }) =>
      respondToFriendRequest(request_id, response),
    {
      onSuccess: () => {
        toast({
            title: "Success.",
            description: "Successfully responded to friend request.",
        })
        queryClient.invalidateQueries(["requestsAndInvites", user?.user_id]);
      },
      onError: (error) => {
        console.log("Error responding to friend request " + error);
      },
    }
  );
  const respondToGroupInviteMutation = useMutation(
    ({
      studygroup_id,
      invite_id,
      response,
      userId,
    }: {
      studygroup_id: number;
      invite_id: number;
      response: string;
      userId: number;
    }) => respondToGroupInvite(studygroup_id, invite_id, response, userId),
    {
      onSuccess: () => {
        toast({
          title: "Success.",
          description: "You have successfully responded to a group invite.",
        });
        queryClient.invalidateQueries(["requestsAndInvites", user?.user_id]);
      },
      onError: (error) => {
        toast({
          title: "Error.",
          description: "Error responding to group invite " + error,
        });
      },
    }
  );

  const removeFriendMutation = useMutation(
    ({ friend_id, userId }: { friend_id: number; userId: number }) =>
      removeFriend(friend_id, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["requestsAndInvites", user?.user_id]);
        toast({
          title: "Success.",
          description: "You have successfully removed a friend.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error.",
          description: "Error removing friend " + error,
        });
      },
    }
  );

  return (
    <div className="container mx-auto md:px-4 py-8 h-100 d-flex flex-column justify-center items-center">
      <div className="">
        <Card className="md:w-[400px] w-[300px]">
          <CardHeader className="">
            <CardTitle className="text-sm font-medium flex items-center justify-center gap-2 pb-2">
              <h2 className="text-2xl font-semibold m-0 text-center">
                Friends
              </h2>
              <Search />
            </CardTitle>
          </CardHeader>
          <CardContent className="md:overflow-hidden sm:overflow-scroll">
            <Tabs defaultValue="friends" className="d-flex flex-col justify-center items-center gap-3 sm:mt-4 mt-0">
              <TabsList className="mb-4 flex-col gap-2 md:flex-row">
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="friendrequests">
                  Friend Requests
                </TabsTrigger>
                <TabsTrigger value="groupinvites">Group Invites</TabsTrigger>
              </TabsList>
              <TabsContent value="friends">
                <ScrollArea className="max-h-[200px]">
                  {isLoading && <LoadingSymbol />}
                  {friendsAndInvites?.friends?.length === 0 && (
                    <p className="text-center">No friends yet.</p>
                  )}
                  {friendsAndInvites?.friends?.map(
                    (buddy: Buddy, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-4 border-b last:border-b-0"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {buddy.first_name} {buddy.last_name} (@
                            {buddy.username})
                          </h3>
                        </div>
                        <div>
                          <Button
                            variant={"destructive"}
                            onClick={() =>
                              removeFriendMutation.mutate({
                                friend_id: buddy.user_id,
                                userId: user?.user_id!,
                              })
                            }
                          >
                            <Minus />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="friendrequests">
                <ScrollArea className="max-h-[300px]">
                  {isLoading && <LoadingSymbol />}
                  {friendsAndInvites?.friendRequests?.length === 0 && (
                    <p className="text-center">No friend requests.</p>
                  )}
                  {friendsAndInvites?.friendRequests?.map(
                    (req: FriendRequest, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-4 border-b last:border-b-0"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {req.first_name} {req.last_name} @{req.username}
                          </h3>
                        </div>
                        <div className="flex items-center">
                          <Button
                            onClick={() =>
                              respondToFriendRequestMutation.mutate({
                                request_id: req.request_id,
                                response: "accepted",
                              })
                            }
                          >
                            <Check />
                          </Button>
                          <Button
                            onClick={() =>
                              respondToFriendRequestMutation.mutate({
                                request_id: req.request_id,
                                response: "rejected",
                              })
                            }
                          >
                            <Minus />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="groupinvites">
                <ScrollArea className="max-h-[300px]">
                  {isLoading && <LoadingSymbol />}
                  {friendsAndInvites?.groupInvites?.length === 0 && (
                    <p className="text-center">No group invites.</p>
                  )}
                  {friendsAndInvites?.groupInvites?.map(
                    (groupInvite: GroupInvite, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-4 border-b last:border-b-0"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {groupInvite.first_name} {groupInvite.last_name}
                          </h3>
                        </div>
                        <div className="flex items-center">
                            <Button
                                onClick={() =>
                                respondToGroupInviteMutation.mutate({
                                    studygroup_id: groupInvite.studygroup_id,
                                    invite_id: groupInvite.invite_id,
                                    response: "accepted",
                                    userId: user?.user_id!,
                                })
                                }
                            >
                                <Check />
                            </Button>
                            <Button
                                onClick={() =>
                                respondToGroupInviteMutation.mutate({
                                    studygroup_id: groupInvite.studygroup_id,
                                    invite_id: groupInvite.invite_id,
                                    response: "rejected",
                                    userId: user?.user_id!,
                                })
                                }
                            >
                                <Minus />
                            </Button>
                        </div>
                      </div>
                    )
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FriendsAndInvitesPage;
