import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Icon } from "leaflet";
import { useAuth } from "../Context/useAuth";
import { StudySpot, Location } from "../Models/Map";
import { StudySessionMapInfo } from "../Models/StudySession";

  
interface MapProps {
  studySessionMapInfo: StudySessionMapInfo | null;
}

const Map: React.FC<MapProps> = ({ studySessionMapInfo }) => {
  const [location, setLocation] = useState<Location>();
  const [studySpots, setStudySpots] = useState<StudySpot[]>([]);
  const [loading, setLoading] = useState(true);
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


  const getStudySpots = () => {
    const OSM_API_URL = "https://overpass-api.de/api/interpreter";

    const query = `
    [out:json];
    (
      node["amenity"="library"](around:1500, ${location?.lat}, ${location?.lon});
      node["amenity"="cafe"]["cuisine"="coffee_shop"](around:1500, ${location?.lat}, ${location?.lon});
      way["amenity"="library"](around:1500, ${location?.lat}, ${location?.lon});
      way["name"~"Library",i](around:1500, ${location?.lat}, ${location?.lon});
    );
    out body;
    `;

    axios
      .get(OSM_API_URL, {
        params: { data: query },
        withCredentials: false,
      })
      .then((res) => {
        // console.log(res.data.elements);
        const studySpots = res.data.elements.map(async (element: any) => {
          if (element.type === "node") {
            return {
              lat: element.lat,
              lon: element.lon,
              city: element.tags["addr:city"],
              houseNumber: element.tags["addr:housenumber"],
              street: element.tags["addr:street"],
              amenity: element.tags["amenity"],
              name: element.tags["name"],
            };
          } else if (element.type === "way") {
            const nodeId = element.nodes[0];
            // Query for nodes based on node IDs
            const nodeQuery = `
                [out:json];
                node(id:${nodeId});
                out body;
              `;
            let wayRes: StudySpot = {
              lat: 0,
              lon: 0,
              city: "",
              houseNumber: 0,
              street: "",
              amenity: "",
              name: "",
            };

            try {
              const nodeRes = await axios
                .get(OSM_API_URL, { params: { data: nodeQuery } })
                .then((nodeRes) => {
                  //since the nodes that this returns is an array of nodes that are EXTREMELY close to each other, we can just take the first node
                  const node = nodeRes.data.elements[0];
                  wayRes.lat = node.lat;
                  wayRes.lon = node.lon;
                  wayRes.city = element.tags["addr:city"];
                  wayRes.houseNumber = element.tags["addr:housenumber"];
                  wayRes.street = element.tags["addr:street"];
                  wayRes.amenity = element.tags["amenity"];
                  wayRes.name = element.tags["name"];
                });
            } catch (error) {
              console.log(
                "Error fetching node data for way",
                element.id,
                error
              );
              return null;
            }

            return wayRes;
          }
        });
        // Wait for all the promises to resolve
        Promise.all(studySpots).then((results) => {
          console.log(results);
          // Filter out null results in case of any error
          setStudySpots(results.filter((spot) => spot !== null));
          setLoading(false);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

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

  useEffect(() => {
    if (location) {
      getStudySpots();
    }
  }, [location]);


  return (
    <>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          {/* <Spinner animation="grow" variant="light" /> */}
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
                  {studySessionMapInfo?.user ? (
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
                  )}
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
            {studySpots.map((studySpot, id) => (
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
