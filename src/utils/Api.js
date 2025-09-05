// src/utils/Api.js
import axios from "axios";
import { data } from "react-router-dom";

// const params = {
//   headers: {
//     Authorization: "Bearer " + process.env.REACT_APP_STRAPI_TOKEN,
//   },
// };

// const params = {
//   headers: {
//     Authorization: "Bearer " + process.env.REACT_APP_STRAPI_TOKEN,
//   },
// };


export const fetchDataFromApi = async (url) => {
  try {
    const { data } = await axios.get(
      process.env.REACT_APP_STRAPI_URL + url
      // params
    );
    console.log("✅ API response:", data);
    return data; // always return clean data
  } catch (error) {
    console.error("❌ API fetch error:", error);
    return null; // prevent undefined
  }
};
