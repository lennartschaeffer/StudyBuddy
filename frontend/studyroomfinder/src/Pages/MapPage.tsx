import Map from "../Components/Map";
import "./MapPage.css";
import NavBar from "../Components/NavBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../apiRoute";
import { useAuth } from "../Context/useAuth";
import { StudySessionMapInfo } from "../Models/StudySession";
import { toast } from "react-toastify";

const MapPage = () => {

  const [isLoading, setIsLoading] = useState(true);
  const [activeSessionsInfo, setActiveSessionsInfo] =
    useState<StudySessionMapInfo | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    axios
      .get(`${API_URL}/studysessions/mapStudySessionInfo/${user?.user_id}`)
      .then((res) => {
        let friends;
        let user;
        if(res.data.friends.length > 0){
          friends = res.data.friends.map((friend: any) => {
            return {
              user_id: friend.user_id,
              username: friend.username,
              first_name: friend.first_name,
              last_name: friend.last_name,
              lat: friend.lat,
              lon: friend.lon,
              session_name: friend.session_name,
              endtime: friend.endtime,
            }
          })
        }
        if(res.data.user.session_name){
          user = {
            session_name: res.data.user.session_name,
            endtime: res.data.user.endtime
          }
        }
        setActiveSessionsInfo({user: user, friends: friends})
      }).catch((err) => {
        console.log(err)
        toast.error("Couldn't retrieve study session info")
      })
  });

  return (
    <div className="Main">
      <Map studySessionMapInfo={activeSessionsInfo}/>
    </div>
  );
};

export default MapPage;
