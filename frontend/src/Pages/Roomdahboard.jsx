import { useState, useEffect } from "react"
import { useLocation, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"

import {
  Home,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  Menu,
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  BarChart3,
  Calendar,
  PieChart,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Volume2,
  Trash2,
} from "lucide-react"
import axios from "axios"


const Modal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="mt-4 flex justify-end gap-4">
          <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={onCancel}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const RoomDashboard = () => {
  const location = useLocation()
  const { id } = useParams();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [filteredRooms, setFilteredRooms] = useState(rooms)
  const [activeFilter, setActiveFilter] = useState('all')
  const [showMenu, setShowMenu] = useState(null);
  const [deleteRoomId, setDeleteRoomId] = useState(null); // Track room to delete
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Show delete confirmation modal
  const navigate = useNavigate()

  useEffect(() => {
    try {
      axios
        .get(`/api/property/building/${id}`)
        .then((res) => {
          console.log("Fetched rooms:", res.data.rooms);
          setRooms(res.data.rooms);
        })
        .catch((err) => {
          console.error("❌ Error fetching rooms:", err);
        });
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Handle opening the delete confirmation modal
  const handleDeleteClick = (roomId) => {
    setDeleteRoomId(roomId);
    setShowDeleteModal(true);
  };

  // Handle the actual deletion after confirmation
  const confirmDelete = async () => {
    if (!deleteRoomId) return;
    console.log(`🗑 Deleting room ${deleteRoomId}... from property ${id}`);
    try {
      await axios.delete(`/api/property/room/delete/${deleteRoomId}/${id}`); // Backend delete call
      setRooms(rooms.filter(room => room._id !== deleteRoomId)); // Update frontend state
      console.log(`✅ Successfully deleted room ${deleteRoomId}`);
    } catch (error) {
      console.error("❌ Error deleting room:", error);
    } finally {
      // Always reset state whether successful or not
      setShowDeleteModal(false);
      setDeleteRoomId(null);
    }
  };

  // Handle canceling the deletion
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteRoomId(null);
  };

  // Count rooms by status only (not using active property anymore)
  const readyRooms = rooms.filter((room) => room.status === "Ready").length
  const notReadyRooms = rooms.filter((room) => room.status === "Not Ready").length
  const attentionRooms = rooms.filter((room) => room.status === "Attention Required").length

  // Update filtered rooms when rooms data changes
  useEffect(() => {
    setFilteredRooms(rooms)
  }, [rooms])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Apply filter and update filteredRooms
  const filterRooms = (status) => {
    setActiveFilter(status)
    if (status === 'all') {
      setFilteredRooms(rooms)
    } else if (status === 'ready') {
      setFilteredRooms(rooms.filter(room => room.status === "Ready"))
    } else if (status === 'notReady') {
      setFilteredRooms(rooms.filter(room => room.status === "Not Ready"))
    } else if (status === 'attention') {
      setFilteredRooms(rooms.filter(room => room.status === "Attention Required"))
    }
  }

  const handleClick = (e, id) => {
    e.preventDefault()
    navigate(`/room/checklist/${id}`)
  }

  // Helper function to determine status display based only on status property
  const getRoomStatusDisplay = (room) => {
    switch (room.status) {
      case "Attention Required":
        return {
          icon: <AlertTriangle className="w-3 h-3" />,
          text: "Attention",
          bgColor: "bg-amber-500 text-white"
        };
      case "Ready":
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          text: "Ready",
          bgColor: "bg-emerald-500 text-white"
        };
      case "Not Ready":
        return {
          icon: <XCircle className="w-3 h-3" />,
          text: "Not Ready",
          bgColor: "bg-rose-500 text-white"
        };
      default:
        // Fallback for any other status
        return {
          icon: <XCircle className="w-3 h-3" />,
          text: room.status || "Unknown",
          bgColor: "bg-gray-500 text-white"
        };
    }
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? "dark" : ""}`}>
      <div className={`flex-1 transition-all duration-300 px-10 py-6 overflow-y-auto justify-center align-center`}>
        <main className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Room Status Dashboard</h1>
                <p className={darkMode ? "text-slate-400" : "text-slate-500"}>Overview of all property statuses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Properties */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`p-6 rounded-xl ${darkMode ? "bg-slate-800" : "bg-white border border-slate-200"} shadow-sm cursor-pointer`}
                onClick={() => filterRooms('all')}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total Properties</p>
                    {isLoading ? (
                      <div className={`h-8 w-16 mt-2 rounded animate-pulse ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}></div>
                    ) : (
                      <h3 className="text-2xl font-bold mt-1">{rooms.length}</h3>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-indigo-50"}`}>
                    <Home className={`w-5 h-5 ${darkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                  </div>
                </div>
              </motion.div>

              {/* Ready Rooms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={`p-6 rounded-xl ${darkMode ? "bg-slate-800" : "bg-white border border-slate-200"} shadow-sm cursor-pointer ${activeFilter === 'ready' ? 'ring-2 ring-emerald-500' : ''}`}
                onClick={() => filterRooms('ready')}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Ready Rooms</p>
                    {isLoading ? (
                      <div className={`h-8 w-16 mt-2 rounded animate-pulse ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}></div>
                    ) : (
                      <h3 className="text-2xl font-bold mt-1">{readyRooms}</h3>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-emerald-50"}`}>
                    <CheckCircle className={`w-5 h-5 ${darkMode ? "text-emerald-400" : "text-emerald-500"}`} />
                  </div>
                </div>
              </motion.div>

              {/* Not Ready Rooms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className={`p-6 rounded-xl ${darkMode ? "bg-slate-800" : "bg-white border border-slate-200"} shadow-sm cursor-pointer ${activeFilter === 'notReady' ? 'ring-2 ring-rose-500' : ''}`}
                onClick={() => filterRooms('notReady')}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Not Ready</p>
                    {isLoading ? (
                      <div className={`h-8 w-16 mt-2 rounded animate-pulse ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}></div>
                    ) : (
                      <h3 className="text-2xl font-bold mt-1">{notReadyRooms}</h3>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-rose-50"}`}>
                    <XCircle className={`w-5 h-5 ${darkMode ? "text-rose-400" : "text-rose-500"}`} />
                  </div>
                </div>
              </motion.div>

              {/* Attention Required */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className={`p-6 rounded-xl ${darkMode ? "bg-slate-800" : "bg-white border border-slate-200"} shadow-sm cursor-pointer ${activeFilter === 'attention' ? 'ring-2 ring-amber-500' : ''}`}
                onClick={() => filterRooms('attention')}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Attention Required</p>
                    {isLoading ? (
                      <div className={`h-8 w-16 mt-2 rounded animate-pulse ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}></div>
                    ) : (
                      <h3 className="text-2xl font-bold mt-1">{attentionRooms}</h3>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-amber-50"}`}>
                    <AlertTriangle className={`w-5 h-5 ${darkMode ? "text-amber-400" : "text-amber-500"}`} />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Property Overview</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Showing: {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Rooms
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, index) => (
                      <motion.div
                        key={`skeleton-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`rounded-xl shadow-sm ${darkMode ? "bg-slate-800" : "bg-white border border-slate-200"
                          }`}
                      >
                        <div
                          className={`w-full h-48 ${darkMode ? "bg-slate-700" : "bg-slate-200"
                            } rounded-t-xl animate-pulse`}
                        ></div>
                        <div className="p-5">
                          <div
                            className={`h-5 ${darkMode ? "bg-slate-700" : "bg-slate-200"
                              } rounded w-3/4 animate-pulse`}
                          ></div>
                          <div
                            className={`h-4 ${darkMode ? "bg-slate-700" : "bg-slate-200"
                              } rounded mt-3 w-1/2 animate-pulse`}
                          ></div>
                          <div
                            className={`h-10 ${darkMode ? "bg-slate-700" : "bg-slate-200"
                              } rounded-lg mt-4 w-full animate-pulse`}
                          ></div>
                        </div>
                      </motion.div>
                    ))
                    : filteredRooms.map((room, index) => {
                      // Get status display data
                      const statusDisplay = getRoomStatusDisplay(room);

                      return (
                        <motion.div
                          key={room._id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          whileHover={{ y: -5, transition: { duration: 0.2 } }}
                          className={`rounded-xl shadow-sm overflow-hidden relative ${darkMode
                            ? "bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20"
                            : "bg-white hover:shadow-lg hover:shadow-slate-200/50 border border-slate-200"
                            } transition-all duration-300`}
                        >
                          <div className="relative">
                            <img
                              src={room.roomImage || "/placeholder.svg?height=200&width=400"}
                              alt={room.roomName || "Room Image"}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                            {/* Status tag - using only status property now */}
                            <div className="absolute top-3 right-3">
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusDisplay.bgColor}`}>
                                {statusDisplay.icon}
                                <span>{statusDisplay.text}</span>
                              </span>
                            </div>

                            <div className="absolute bottom-3 left-3 text-white">
                              <p className="text-sm font-medium">Room {room.roomNum || "Number"}</p>
                            </div>
                          </div>

                          <div className="p-5">
                            <h3 className="text-lg font-bold mb-2">{room.roomName || "Room Name"}</h3>

                            {/* Staff Information */}
                            {room.staffWhoUpdated && room.staffWhoUpdated !== "undefined" && (
                              <div className="flex items-center gap-2 mb-3">
                                <img
                                  src={room.staffWhoUpdated.includes(" - ") ? room.staffWhoUpdated.split(" - ")[1] : "/placeholder.svg?height=24&width=24"}
                                  alt="Staff"
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  Updated by: {room.staffWhoUpdated.includes(" - ") ? room.staffWhoUpdated.split(" - ")[0] : room.staffWhoUpdated}
                                </span>
                              </div>
                            )}

                            {/* Missing Items */}
                            {room.missingItems && room.missingItems.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-rose-500">Missing Items:</p>
                                <ul className={`list-disc list-inside text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  {room.missingItems.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Checklist Items */}
                            {room.checklist && room.checklist.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-emerald-500">Completed Tasks:</p>
                                <ul className={`list-disc list-inside text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  {room.checklist.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Voice Note */}
                            {room.voiceNote && (
                              <div className="mb-4">
                                <audio controls className="w-full h-8">
                                  <source src={room.voiceNote} type="audio/wav" />
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode
                                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                  } transition-colors duration-200 text-sm font-medium`}
                                onClick={(e) => handleClick(e, room._id)}
                              >
                                <ClipboardCheck className="w-4 h-4" />
                                View Checklist
                              </motion.button>

                              {/* Delete Button with Trash Icon */}
                              <button
                                onClick={() => handleDeleteClick(room._id)}
                                className="p-2 rounded-lg text-red-500 hover:text-red-700 transition-all duration-200"
                              >
                                <Trash2 className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Global Delete Confirmation Modal */}
      {showDeleteModal && deleteRoomId && (
        <Modal
          title="Delete Room"
          message="Are you sure you want to delete this room? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  )
}

export default RoomDashboard