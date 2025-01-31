import axios from "axios";

export const getStudySpots = async (lat: Number, lon: Number) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/map/studyspots/${lat}/${lon}`
    );
    console.log(res)
    return res.data.studySpots;
  } catch (error) {
    throw error;
  }
};
