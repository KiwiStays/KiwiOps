import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2 ,Pencil} from "lucide-react";
import { useNavigate } from "react-router-dom";


const Homepage = () => {
  const [prop, setProp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [rooms , setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/property/getproperty")
      .then((res) => {
        console.log(res.data.properties);
        setProp(res.data.properties);
      })
      .catch((err) => {
        console.error(err);
        alert("Error in fetching property data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Group buildings by placeName
  const groupedPlaces = prop.reduce((acc, curr) => {
    if (!acc[curr.placeName]) {
      acc[curr.placeName] = {
        _id: curr._id,  // Store _id at the place level
        buildings: []   // Store the buildings array
      };
    }
    acc[curr.placeName].buildings.push(curr);
    return acc;
  }, {});
  

  const toggleExpand = (placeName) => {
    setExpanded((prev) => ({
      ...prev,
      [placeName]: !prev[placeName],
    }));
  };

  const handleBuildingClick = (building, event) => {
    if (event) event.preventDefault(); // Prevent default link behavior
  
    try {
      axios
        .get(`/api/property/building/${building._id}`)
        .then((res) => {
          // ✅ Navigate to "/rooms" with the fetched rooms data
          navigate(`/room/${building._id}`, { state: { rooms: res.data.rooms } });
        })
        .catch((err) => {
          console.error("❌ Error fetching rooms:", err);
        });
    } catch (err) {
      console.error(err);
    }
  };
  const handleEdit = (e,id) => {

    e.stopPropagation();
    console.log(id);
    navigate(`/propertyform/${id}`);
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : prop.length >= 1 ? (
        Object.entries(groupedPlaces).map(([placeName, { _id, buildings }]) => (
          <div key={placeName} className="w-80 my-4">
            {/* Place Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white shadow-md rounded-full p-4 flex justify-between items-center cursor-pointer hover:bg-blue-500 hover:text-white"
              onClick={() => toggleExpand(placeName)}
              
            >
              <h2 className="text-lg font-semibold">{placeName}</h2>
              <h2 className="text-lg font-semibold absolute top-0 right-0 text-red-950 border-black rounded-full" onClick={(e)=>handleEdit(e,_id)}><Pencil className=""/></h2>
              {expanded[placeName] ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </motion.div>

            {/* Buildings Dropdown */}
            {expanded[placeName] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 bg-white shadow-lg rounded-lg p-3"
              >
                {buildings.map((building) => (
                  <motion.div
                    key={building._id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer"
                    onClick={(event) => handleBuildingClick(building,event)}
                  >
                    <img
                      src={building.buildingPic}
                      alt={building.placeName}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <p className="text-sm font-medium">{building.buildingName}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        ))
      ) : (
        <h1 className="text-gray-600 text-lg">No property data to display</h1>
      )}
    </div>
  );
};

export default Homepage;
