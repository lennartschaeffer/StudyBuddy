import axios from "axios";
import { Request, Response } from "express";

interface StudySpot {
  lat: number;
  lon: number;
  city: string;
  houseNumber: number | string;
  street: string;
  amenity: string;
  name: string;
}

const getStudySpotLocations = async (lat: Number, lon: Number) => {
  const OSM_API_URL = "https://overpass-api.de/api/interpreter";
  if (!lat || !lon) {
    throw new Error("Error. Geolocation not provided");
  }
  const query = `
    [out:json];
    (
      node["amenity"="library"](around:1500, ${lat}, ${lon});
      node["amenity"="cafe"]["cuisine"="coffee_shop"](around:1500, ${lat}, ${lon});
      way["amenity"="library"](around:1500, ${lat}, ${lon});
      way["name"~"Library",i](around:1500, ${lat}, ${lon});
    );
    out body;
    `;
  try {
    const res = await axios.get(OSM_API_URL, {
      params: { data: query },
    });
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
        //query for nodes based on node IDs
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
        //get ways
        try {
          const nodeRes = await axios.get(OSM_API_URL, {
            params: { data: nodeQuery },
          });
          //since the nodes that this returns is an array of nodes that are EXTREMELY close to each other, we can just take the first node
          const node = nodeRes.data.elements[0];
          wayRes.lat = node.lat;
          wayRes.lon = node.lon;
          wayRes.city = element.tags["addr:city"];
          wayRes.houseNumber = element.tags["addr:housenumber"];
          wayRes.street = element.tags["addr:street"];
          wayRes.amenity = element.tags["amenity"];
          wayRes.name = element.tags["name"];
        } catch (error) {
          console.log("Error fetching node data for way", element.id, error);
          return null;
        }
        return wayRes;
      }
    });
    //wait for all the promises to resolve
    const results = await Promise.all(studySpots);
    //filter out null results in case of any error
    const locations = results.filter((spot: StudySpot) => spot !== null);
    return locations;
  } catch (error) {
    console.error(error);
  }
};

export const getStudySpots = async(req: Request, res: Response) => {
    try {
        const {lat,lon} = req.params;
        if(!lat || !lon){
            res.status(400).send("Error. Undefined lat or lon.")
            return
        }
        const spots = await getStudySpotLocations(Number(lat),Number(lon));
        console.log(spots)
        res.status(200).send({studySpots: spots})
    } catch (error) {
        console.error(error)
        res.status(500).send("Server Error.")
    }
}


