"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Loader2, Pencil, MapPin, Building2, Home } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Link } from "react-router-dom"

const Homepage = () => {
  const [prop, setProp] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .get("/api/property/getproperty")
      .then((res) => {
        console.log(res.data.properties)
        setProp(res.data.properties)
      })
      .catch((err) => {
        console.error(err)
        alert("Error in fetching property data")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Group buildings by placeName
  const groupedPlaces = prop.reduce((acc, curr) => {
    if (!acc[curr.placeName]) {
      acc[curr.placeName] = {
        _id: curr._id, // Store _id at the place level
        buildings: [], // Store the buildings array
      }
    }
    acc[curr.placeName].buildings.push(curr)
    return acc
  }, {})

  const toggleExpand = (placeName) => {
    setExpanded((prev) => ({
      ...prev,
      [placeName]: !prev[placeName],
    }))
  }

  const handleBuildingClick = (building, event) => {
    if (event) event.preventDefault() // Prevent default link behavior

    try {
      axios
        .get(`/api/property/building/${building._id}`)
        .then((res) => {
          navigate(`/room/${building._id}`, { state: { rooms: res.data.rooms } })
        })
        .catch((err) => {
          console.error("❌ Error fetching rooms:", err)
        })
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (e, id) => {
    e.stopPropagation()
    console.log(id)
    navigate(`/propertyform/${id}`)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  const buildingVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Property Portfolio
          </h1>
          <p className="text-slate-600 mt-2">Explore your properties and buildings</p>
        </motion.div>
        <div className="flex justify-center mb-6 border-blue-900 bg-blue-700 shadow-lg text-white p-3 rounded-lg text-center">
          <Link to="/propertyform">Create a property</Link>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600 animate-pulse">Loading your properties...</p>
          </div>
        ) : prop.length >= 1 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {Object.entries(groupedPlaces).map(([placeName, { _id, buildings }]) => (
              <motion.div key={placeName} variants={itemVariants} className="w-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden"
                >
                  <div
                    className="p-5 flex justify-between items-center cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    onClick={() => toggleExpand(placeName)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">{placeName}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        onClick={(e) => handleEdit(e, _id)}
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.div animate={{ rotate: expanded[placeName] ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expanded[placeName] && (
                      <motion.div
                        variants={buildingVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <div className="p-3 grid gap-3">
                          {buildings.map((building) => (
                            <motion.div
                              key={building._id}
                              whileHover={{ scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                              className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 border border-slate-200 dark:border-slate-700"
                              onClick={(event) => handleBuildingClick(building, event)}
                            >
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md">
                                <img
                                  src={building.buildingPic || "/placeholder.svg"}
                                  alt={building.placeName}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                              </div>
                              <div className="flex-1">
                                <p className="text-base font-medium text-slate-800 dark:text-white">
                                  {building.buildingName}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  <Building2 className="w-3 h-3" />
                                  <span>View rooms</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl p-10 shadow-lg text-center"
          >
            <Home className="w-16 h-16 text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No properties yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">
              You haven't added any properties to your portfolio
            </p>
            <button
              onClick={() => navigate("/propertyform")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Your First Property
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Homepage

