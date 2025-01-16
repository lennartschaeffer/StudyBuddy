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

  return (
    <div className="Main">
      <Map studySessionMapInfo={null}/>
    </div>
  );
};

export default MapPage;
