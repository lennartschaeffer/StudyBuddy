import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useState } from "react";
import { Icon } from "leaflet";
import { useAuth } from "../Context/useAuth";
import { StudySpot, Location } from "../Models/Map";
import { StudySessionMapInfo } from "../Models/StudySession";
import { LoadingSymbol } from "./ui/LoadingSymbol";
import { getStudySpots } from "@/endpoints/StudySpots";
import { useQuery } from "react-query";

interface MapProps {
  studySessionMapInfo: StudySessionMapInfo | null;
}

const Map: React.FC<MapProps> = ({ studySessionMapInfo }) => {
  const [location, setLocation] = useState<Location>();
  const { user } = useAuth();

  const libraryIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/5833/5833290.png",
    iconSize: [38, 38],
  });

  const personIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/7710/7710521.png",
    iconSize: [38, 38],
  });

  const personStudyingIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/566/566944.png",
    iconSize: [38, 38],
  });

  const cafeIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2954/2954816.png",
    iconSize: [38, 38],
  });

  const { data: studySpots, isLoading } = useQuery("studySpots",
     () =>
    getStudySpots(location?.lat!, location?.lon!),
     {
      enabled: !!location,
      onSuccess: () => {
        console.log("Fetched study spots.");
      },
      onError: (error) => {
        console.error(error);
     }
  }
  );

  //get user geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position.coords.latitude, position.coords.longitude);
      setLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
    });
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <LoadingSymbol />
        </div>
      ) : (
        <MapContainer
          key={location ? `${location.lat}-${location.lon}` : "initial"}
          center={[location?.lat ?? 0, location?.lon ?? 0]}
          zoom={14}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {location && (
            <Marker
              position={[location.lat, location.lon]}
              icon={studySessionMapInfo ? personStudyingIcon : personIcon}
            >
              <Popup>
                {/* {studySessionMapInfo?.user ? (
                    <div style={{ display: "flex-column" }}>
                      <h6>{user?.first_name} is currently in session</h6>
                      <li style={{ listStyleType: "none" }}>
                        <ul>
                          Studying: {studySessionMapInfo?.user?.session_name}
                        </ul>
                        <ul>
                          Session ends at: {studySessionMapInfo?.user?.endtime}
                        </ul>
                      </li>
                    </div>
                  ) : (
                    <div>
                      {user?.first_name} is not currently in a study session.
                    </div>
                  )} */}
                {user?.first_name} is here.
              </Popup>
            </Marker>
          )}
          {studySessionMapInfo?.friends?.map((friend, id) => (
            <Marker
              key={id}
              position={[friend.lat, friend.lon]}
              icon={personIcon}
            >
              <Popup>
                <div>
                  <h6>{friend.first_name} is currently in session</h6>
                  <li style={{ listStyleType: "none" }}>
                    <ul>Studying: {friend.session_name}</ul>
                    <ul>Session ends at: {friend.endtime}</ul>
                  </li>
                </div>
              </Popup>
            </Marker>
          ))}
          {studySpots?.map((studySpot: StudySpot, id: any) => (
            <Marker
              key={id}
              position={[studySpot?.lat, studySpot?.lon]}
              icon={studySpot.amenity === "library" ? libraryIcon : cafeIcon}
            >
              <Popup>
                <div>
                  <h4>{studySpot.name}</h4>
                  <h6>Type: {studySpot.amenity}</h6>
                  {studySpot.houseNumber &&
                  studySpot.street &&
                  studySpot.city ? (
                    <div>
                      <h6>
                        {studySpot?.houseNumber} {studySpot?.street}
                      </h6>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </>
  );
};

export default Map;
