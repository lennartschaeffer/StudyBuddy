import { useState } from "react";
import { Buddy } from "../Models/StudyBuddy";
import { useAuth } from "../Context/useAuth";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getAllUsers } from "../controllers/UsersController";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { sendFriendRequest } from "@/controllers/FriendRequestsController";
import { useToast } from "@/hooks/use-toast";

const FindBuddiesPage = () => {
  const { user } = useAuth();
  const {toast} = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBuddies, setFilteredBuddies] = useState<Buddy[]>([]);
  const queryClient = useQueryClient();
  const sendFriendRequestMutation = useMutation(
    ({ receiver_id }: { receiver_id: number }) =>
      sendFriendRequest(user?.user_id!, receiver_id),
    {
      onSuccess: () => {
        toast({
          title: "Success.",
          description: "Friend request sent.",
        })
        queryClient.invalidateQueries("requestsAndInvites");
      },
      onError: (error) => {
        toast({
          title: "Error.",
          description: "Failed to send friend request."+error,
        })
      },
    }
  );

  const { data: studyBuddies } = useQuery(
    "studyBuddies",
    () => getAllUsers(user?.user_id!),
    {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const handleSearch = () => {
    if (studyBuddies) {
      const filtered = studyBuddies.filter((buddy: Buddy) => {
        return buddy.username.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredBuddies(filtered);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 h-100 d-flex flex-column justify-content-center align-items-center">
      <div className="">
        <Card className="w-[350px]">
          <CardHeader className="">
            <CardTitle className="text-sm font-medium flex items-center justify-center gap-2 pb-2">
              <h2 className="text-2xl font-semibold m-0 text-center">
                Search Buddies
              </h2>
              <Search />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              id="search"
              type="text"
              placeholder="Search for a buddy..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredBuddies.length > 0 && (
              <ScrollArea className="max-h-[300px]">
                {filteredBuddies.map((buddy: Buddy, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-4 border-b last:border-b-0"
                  >
                    <div className="flex gap-2">
                      <h3 className="font-semibold">
                        {buddy.first_name} {buddy.last_name}
                      </h3>
                      <h3 className="text-muted-foreground">
                        @{buddy.username}
                      </h3>
                    </div>
                    <div className="flex items-center">
                      <Button
                        onClick={() =>
                          sendFriendRequestMutation.mutate({
                            receiver_id: buddy.user_id,
                          })
                        }
                      >
                        <UserPlus />
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
            <Button className="w-full mt-3" onClick={handleSearch}>
              Search
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FindBuddiesPage;
