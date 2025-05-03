"use client"

import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import { AdminContext } from "../context/AdminContext.jsx"
import {
  ClipboardCheck,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  AlertOctagon,
  Wrench,
  Filter,
  X,
  PieChart,
  Edit,
} from "lucide-react"

const MaintenancePage = () => {
  const { logout, darkMode, adminToken } = useContext(AdminContext)
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalStats, setTotalStats] = useState({
    pastDue: 0,
    upcoming: 0,
    completed: 0,
  })

  // Location filter state
  const [showFilter, setShowFilter] = useState(false)
  const [locationFilter, setLocationFilter] = useState("")
  const [availableLocations, setAvailableLocations] = useState([])
  const [selectedLocations, setSelectedLocations] = useState([])

  // Add status filter state
  const [statusFilter, setStatusFilter] = useState("")

  // Pagination settings
  const propertiesPerPage = 8

  // Apply filters to properties
  const filteredProperties = properties.filter((property) => {
    // If no locations selected, show all properties
    const locationMatch = selectedLocations.length === 0 || selectedLocations.includes(property.location)

    // If no status filter, show all properties
    if (!statusFilter) return locationMatch

    // Filter by status
    if (statusFilter === "pastDue" && property.stats?.pastDue > 0) return locationMatch
    if (statusFilter === "upcoming" && property.stats?.upcoming > 0) return locationMatch
    if (
      statusFilter === "completed" &&
      property.stats?.completed > 0 &&
      property.stats?.pastDue === 0 &&
      property.stats?.upcoming === 0
    )
      return locationMatch

    return false
  })

  const indexOfLastProperty = currentPage * propertiesPerPage
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty)
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/property/get/maintanence/property")
        const propertiesData = response.data.properties || []
        console.log("Fetched properties:", propertiesData)
        setProperties(propertiesData)

        // Extract unique locations for filter
        const locations = [...new Set(propertiesData.map((p) => p.location).filter(Boolean))]
        setAvailableLocations(locations)

        // Calculate total stats across all properties
        const aggregatedStats = propertiesData.reduce(
          (acc, property) => {
            return {
              pastDue: acc.pastDue + (property.stats?.pastDue || 0),
              upcoming: acc.upcoming + (property.stats?.upcoming || 0),
              completed: acc.completed + (property.stats?.completed || 0),
            }
          },
          { pastDue: 0, upcoming: 0, completed: 0 },
        )

        setTotalStats(aggregatedStats)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching maintenance data:", error)
        setError("Failed to load maintenance data")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedLocations, statusFilter])

  const handleViewChecklist = (propertyId) => {
    navigate(`/maintenance/property/${propertyId}`)
  }

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(`/api/property/delete/maintanence/${propertyId}`)
        const updatedProperties = properties.filter((property) => property._id !== propertyId)
        setProperties(updatedProperties)

        // Update available locations
        const locations = [...new Set(updatedProperties.map((p) => p.location).filter(Boolean))]
        setAvailableLocations(locations)

        // Remove any selected locations that no longer exist
        setSelectedLocations((prev) => prev.filter((loc) => locations.includes(loc)))

        // Recalculate stats after deletion
        const updatedStats = updatedProperties.reduce(
          (acc, property) => {
            return {
              pastDue: acc.pastDue + (property.stats?.pastDue || 0),
              upcoming: acc.upcoming + (property.stats?.upcoming || 0),
              completed: acc.completed + (property.stats?.completed || 0),
            }
          },
          { pastDue: 0, upcoming: 0, completed: 0 },
        )

        setTotalStats(updatedStats)

        // Adjust current page if needed
        if (currentProperties.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        }
      } catch (error) {
        console.error("Error deleting property:", error)
      }
    }
  }

  const toggleLocationFilter = (location) => {
    setSelectedLocations((prev) => (prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]))
  }

  const clearAllFilters = () => {
    setSelectedLocations([])
    setLocationFilter("")
    setStatusFilter("")
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo(0, 0)
    }
  }

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo(0, 0)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  // Filter locations based on search input
  const filteredLocations = availableLocations.filter((location) =>
    location.toLowerCase().includes(locationFilter.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-slate-950 text-white">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
        <p className="text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row">
        {/* Main Content Area */}
        <div className="flex-grow p-6">
          {/* Header section */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Property Maintenance</h1>
              <p className="mt-2 text-gray-300">Manage and track maintenance tasks for all properties</p>
            </div>

            {/* Filter Toggle Button - For Mobile */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="md:hidden px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 border border-slate-700"
            >
              <Filter className="w-4 h-4" />
              Filters
              {selectedLocations.length > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedLocations.length}
                </span>
              )}
            </button>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Past Due Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setStatusFilter(statusFilter === "pastDue" ? "" : "pastDue")}
              className={`rounded-xl p-6 ${statusFilter === "pastDue" ? "bg-red-900/30" : "bg-slate-900/90"} backdrop-blur-sm border ${statusFilter === "pastDue" ? "border-red-500/40" : "border-red-500/20"} shadow-lg shadow-red-900/10 flex items-center justify-between cursor-pointer hover:bg-red-900/20 transition-colors`}
            >
              <div>
                <p className="text-sm text-gray-400">Past Due Tasks</p>
                <h3 className="text-3xl font-bold text-red-500 mt-1">
                  {selectedLocations.length > 0
                    ? filteredProperties.reduce((sum, prop) => sum + (prop.stats?.pastDue || 0), 0)
                    : totalStats.pastDue}
                </h3>
                {totalStats.pastDue > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Across {properties.filter((p) => p.stats?.pastDue > 0).length} properties
                  </p>
                )}
              </div>
              <div className="bg-red-900/30 p-4 rounded-full border border-red-500/30">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </motion.div>

            {/* Upcoming Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              onClick={() => setStatusFilter(statusFilter === "upcoming" ? "" : "upcoming")}
              className={`rounded-xl p-6 ${statusFilter === "upcoming" ? "bg-amber-900/30" : "bg-slate-900/90"} backdrop-blur-sm border ${statusFilter === "upcoming" ? "border-amber-500/40" : "border-amber-500/20"} shadow-lg shadow-amber-900/10 flex items-center justify-between cursor-pointer hover:bg-amber-900/20 transition-colors`}
            >
              <div>
                <p className="text-sm text-gray-400">Upcoming Tasks</p>
                <h3 className="text-3xl font-bold text-amber-500 mt-1">
                  {selectedLocations.length > 0
                    ? filteredProperties.reduce((sum, prop) => sum + (prop.stats?.upcoming || 0), 0)
                    : totalStats.upcoming}
                </h3>
                {totalStats.upcoming > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Across {properties.filter((p) => p.stats?.upcoming > 0).length} properties
                  </p>
                )}
              </div>
              <div className="bg-amber-900/30 p-4 rounded-full border border-amber-500/30">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </motion.div>

            {/* Completed Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onClick={() => setStatusFilter(statusFilter === "completed" ? "" : "completed")}
              className={`rounded-xl p-6 ${statusFilter === "completed" ? "bg-emerald-900/30" : "bg-slate-900/90"} backdrop-blur-sm border ${statusFilter === "completed" ? "border-emerald-500/40" : "border-emerald-500/20"} shadow-lg shadow-emerald-900/10 flex items-center justify-between cursor-pointer hover:bg-emerald-900/20 transition-colors`}
            >
              <div>
                <p className="text-sm text-gray-400">Completed Tasks</p>
                <h3 className="text-3xl font-bold text-emerald-500 mt-1">
                  {selectedLocations.length > 0
                    ? filteredProperties.reduce((sum, prop) => sum + (prop.stats?.completed || 0), 0)
                    : totalStats.completed}
                </h3>
                {totalStats.completed > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Across{" "}
                    {
                      properties.filter(
                        (p) => p.stats?.completed > 0 && p.stats?.pastDue === 0 && p.stats?.upcoming === 0,
                      ).length
                    }{" "}
                    properties
                  </p>
                )}
              </div>
              <div className="bg-emerald-900/30 p-4 rounded-full border border-emerald-500/30">
                <CheckSquare className="w-6 h-6 text-emerald-500" />
              </div>
            </motion.div>
          </div>

          {/* Active Filters Display */}
          {(selectedLocations.length > 0 || statusFilter) && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400">Filtered by:</span>

                {/* Status filter tags */}
                {statusFilter === "pastDue" && (
                  <span className="px-3 py-1 bg-red-600/20 border border-red-500/30 rounded-full text-xs text-red-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Past Due
                    <button onClick={() => setStatusFilter("")} className="ml-1 p-0.5 hover:bg-red-700/50 rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {statusFilter === "upcoming" && (
                  <span className="px-3 py-1 bg-amber-600/20 border border-amber-500/30 rounded-full text-xs text-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Upcoming
                    <button
                      onClick={() => setStatusFilter("")}
                      className="ml-1 p-0.5 hover:bg-amber-700/50 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {statusFilter === "completed" && (
                  <span className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 rounded-full text-xs text-emerald-300 flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />
                    Completed
                    <button
                      onClick={() => setStatusFilter("")}
                      className="ml-1 p-0.5 hover:bg-emerald-700/50 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Location filter tags */}
                {selectedLocations.map((location) => (
                  <span
                    key={location}
                    className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-xs text-indigo-300 flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    {location}
                    <button
                      onClick={() => toggleLocationFilter(location)}
                      className="ml-1 p-0.5 hover:bg-indigo-700/50 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <button
                  onClick={() => {
                    clearAllFilters()
                    setStatusFilter("")
                  }}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Properties Grid with Pagination */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {currentProperties.map((property, index) => (
              <PropertyCard
                key={property._id || index}
                property={property}
                index={index}
                darkMode={darkMode}
                onViewChecklist={() => handleViewChecklist(property._id)}
                onDelete={() => handleDeleteProperty(property._id)}
              />
            ))}
          </div>

          {filteredProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-900/50 rounded-xl backdrop-blur-sm border border-slate-800">
              {selectedLocations.length > 0 ? (
                <>
                  <MapPin className="w-16 h-16 mb-4 text-gray-600" />
                  <h3 className="text-xl font-medium mb-2 text-white">No Properties Match Your Filters</h3>
                  <p className="max-w-md text-gray-400">Try adjusting your location filters to see more properties.</p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-16 h-16 mb-4 text-gray-600" />
                  <h3 className="text-xl font-medium mb-2 text-white">No Properties Found</h3>
                  <p className="max-w-md text-gray-400">
                    No properties requiring maintenance are currently in the system.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md flex items-center justify-center ${
                    currentPage === 1
                      ? "bg-slate-900 text-gray-500 cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page numbers */}
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNumber = idx + 1
                  // Show first page, current page, last page, and one page before and after current
                  const showPageNumber =
                    pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - currentPage) <= 1

                  // Show ellipsis for skipped pages
                  if (!showPageNumber) {
                    // Show ellipsis before and after skipped ranges
                    if (pageNumber === 2 || pageNumber === totalPages - 1) {
                      return (
                        <span key={`ellipsis-${pageNumber}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      )
                    }
                    return null
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`w-10 h-10 rounded-md flex items-center justify-center ${
                        currentPage === pageNumber
                          ? "bg-indigo-600 text-white border border-indigo-500"
                          : "bg-slate-900 text-white hover:bg-slate-800 border border-slate-800"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md flex items-center justify-center ${
                    currentPage === totalPages
                      ? "bg-slate-900 text-gray-500 cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Location Filter Sidebar - Right Side */}
        <div
          className={`
          md:w-72 bg-slate-900/90 backdrop-blur-sm border-l border-slate-800 p-5
          transition-all duration-300 overflow-y-auto
          ${showFilter ? "fixed inset-0 z-50 w-full" : "hidden md:block"}
        `}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>
            <button
              onClick={() => setShowFilter(false)}
              className="md:hidden p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>


            {adminToken && (<button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
            >
            Logout

            </button>)}
          </div>

          {/* Location Filter Section */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Filter by Location</label>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search locations..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {locationFilter && (
                <button
                  onClick={() => setLocationFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto pr-2 space-y-1.5">
              {filteredLocations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No locations found</p>
              ) : (
                filteredLocations.map((location) => (
                  <div
                    key={location}
                    onClick={() => toggleLocationFilter(location)}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                      ${
                        selectedLocations.includes(location)
                          ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-300"
                          : "bg-slate-950 border border-slate-800 text-gray-300 hover:bg-slate-800"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-sm">{location}</span>
                    </div>
                    {selectedLocations.includes(location) && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Filter Stats */}
          <div className="mt-auto pt-4 border-t border-slate-800">
            <div className="text-sm text-gray-400">
              <p>
                Showing {filteredProperties.length} of {properties.length} properties
              </p>
              {(selectedLocations.length > 0 || statusFilter) && (
                <p className="mt-1">Filters applied: {selectedLocations.length + (statusFilter ? 1 : 0)}</p>
              )}
            </div>

            {(selectedLocations.length > 0 || statusFilter) && (
              <button
                onClick={() => {
                  clearAllFilters()
                  setStatusFilter("")
                }}
                className="mt-3 w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center gap-2 border border-slate-700"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const PropertyCard = ({ property, index, darkMode, onViewChecklist, onDelete }) => {
  const {adminToken} = useContext(AdminContext);
  // console.log("Admin Token:", adminToken); // Log the token to check if it's available
  const statusDisplay = getStatusInfo(property)
  const [showPendingTasks, setShowPendingTasks] = useState(false)
  const navigate = useNavigate();

  function getStatusInfo(property) {
    const { stats } = property

    if (stats.pastDue > 0) {
      return {
        text: `${stats.pastDue} Past Due`,
        icon: <AlertTriangle className="w-3 h-3" />,
        bgColor: "bg-red-500",
        borderColor: "border-red-600",
      }
    } else if (stats.upcoming > 0) {
      return {
        text: `${stats.upcoming} Upcoming`,
        icon: <Calendar className="w-3 h-3" />,
        bgColor: "bg-amber-500",
        borderColor: "border-amber-600",
      }
    } else {
      return {
        text: "All Complete",
        icon: <CheckCircle className="w-3 h-3" />,
        bgColor: "bg-emerald-500",
        borderColor: "border-emerald-600",
      }
    }
  }

  const totalTasks = (property.stats?.pastDue || 0) + (property.stats?.upcoming || 0) + (property.stats?.completed || 0)

  // Extract past due tasks to display
  const pastDueTasks = property.stats?.pastDue || 0

  // Get pending maintenance items
  const getPendingMaintenanceItems = () => {
    if (!property.maintenanceData) return []

    const pendingItems = []

    property.maintenanceData.forEach((category) => {
      if (category.records) {
        category.records.forEach((record) => {
          // Consider a task pending if it's scheduled but not completed (no actualDate)
          if (record.scheduledDate && !record.actualDate) {
            const scheduledDate = new Date(record.scheduledDate)
            const now = new Date()

            // Check if it's past due
            const isPastDue = scheduledDate < now

            if (isPastDue) {
              pendingItems.push({
                instruction: record.instruction,
                scheduledDate,
                isPastDue,
              })
            }
          }
        })
      }
    })

    // Sort by date (most overdue first)
    return pendingItems.sort((a, b) => a.scheduledDate - b.scheduledDate).slice(0, 3)
  }

  const pendingItems = getPendingMaintenanceItems()

  // Handler for viewing checklist with stopPropagation to prevent event bubbling
  const handleViewClick = (e) => {
    e.stopPropagation() // Prevent event bubbling
    onViewChecklist()
  }

  // Handler for delete with stopPropagation
  const handleDeleteClick = (e) => {
    e.stopPropagation() // Prevent event bubbling
    onDelete()
  }


  const handleEditClick = (id) => {
    console.log("Edit property with ID:", id)
    navigate('/maintenance/property/edit/' + id);

   

    

  }

  // Toggle pending tasks visibility
  const togglePendingTasks = (e) => {
    e.stopPropagation()
    setShowPendingTasks(!showPendingTasks)
  }

  // Generate a gradient for card based on status
  const getCardGradient = () => {
    if (property.stats?.pastDue > 0) {
      return "from-slate-950 to-slate-900 border-red-900/40"
    } else if (property.stats?.upcoming > 0) {
      return "from-slate-950 to-slate-900 border-amber-900/40"
    }
    return "from-slate-950 to-slate-900 border-emerald-900/40"
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`rounded-xl overflow-hidden bg-gradient-to-br ${getCardGradient()} 
        shadow-lg shadow-slate-950/50 border border-slate-800/80
        transition-all duration-300 h-full flex flex-col`}
    >
      <div className="relative">
        <img
          src={property.imageUrl || "/api/placeholder/400/200"}
          alt={property.propertyName || "Property Image"}
          className="w-full h-48 object-cover"
          style={{ filter: "brightness(0.6)" }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-90"
          style={{ pointerEvents: "none" }}
        ></div>

        {/* Status tag */}
        <div className="absolute top-3 right-3" style={{ zIndex: 10 }}>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${statusDisplay.bgColor} border ${statusDisplay.borderColor} shadow-lg`}
          >
            {statusDisplay.icon}
            <span>{statusDisplay.text}</span>
          </span>
        </div>

        <div className="absolute bottom-3 left-3 text-white" style={{ pointerEvents: "none" }}>
          <div className="flex items-center gap-1.5 mb-1.5 text-sm opacity-90">
            <MapPin className="w-3 h-3" />
            <span>{property.location || "Location"}</span>
          </div>
          <h3 className="text-xl font-bold">{property.propertyName || "Property Name"}</h3>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        {/* Past Due Tasks Alert - Only shown if there are past due tasks */}
        {pastDueTasks > 0 && (
          <button
            onClick={togglePendingTasks}
            className="mb-3 p-2.5 rounded-lg bg-red-900/20 border border-red-900/40 flex items-center justify-between hover:bg-red-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-red-400">{pastDueTasks} Tasks Past Due</span>
            </div>
            <div className="text-red-400">
              {showPendingTasks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
        )}

        {/* Pending Tasks List - Only visible when expanded */}
        {showPendingTasks && pendingItems.length > 0 && (
          <div className="mb-3 p-2.5 rounded-lg bg-slate-950/80 border border-red-900/20">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Pending Tasks:</h4>
            <ul className="space-y-2">
              {pendingItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Wrench className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-300">{item.instruction.replace(" Servicing Houses", "")}</p>
                    <p className="text-xs text-red-400 mt-0.5">Due: {formatDate(item.scheduledDate)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Maintenance Stats */}
        {/* <div className="flex items-center justify-between mb-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-gray-300">
              Tasks
            </span>
          </div>
          <span className="text-xs font-bold text-white">
            {totalTasks}
          </span>
        </div> */}

        {/* Services */}
        {/* <div className="mb-3 flex-grow">
          <p className="text-xs font-medium mb-2 text-gray-300">Services:</p>
          <div className="flex flex-wrap gap-1.5">
            {property.instructions &&
              property.instructions.slice(0, 3).map((item, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800/80"
                >
                  {item.replace(" Servicing Houses", "")}
                </span>
              ))}
            {property.instructions && property.instructions.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800/80">
                +{property.instructions.length - 3} more
              </span>
            )}
          </div>
        </div> */}

        <div className="mt-3 flex items-center justify-between">
          {/* View Details Button with improved touch target */}
          <button
            onClick={handleViewClick}
            className="px-4 py-2.5 rounded-lg flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200 text-xs font-medium cursor-pointer touch-manipulation z-10 border border-indigo-500/50 shadow-md"
            style={{ WebkitTapHighlightColor: "transparent" }}
            type="button"
            role="button"
            aria-label="View details"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            View Details
          </button>

        {/* EDIT BUTTON */}

        {
          adminToken && (
            <button
            onClick={()=>handleEditClick(property._id)}
            className="p-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer touch-manipulation z-10 border border-slate-800/80"
            style={{ WebkitTapHighlightColor: "transparent" }}
            type="button"
            role="button"
            aria-label="Edit">
            <Edit className="w-4 h-4" />
            </button>
          )
        }


          {/* Delete Button with improved touch target */}
          { adminToken &&(
          <button
            onClick={handleDeleteClick}
            className="p-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer touch-manipulation z-10 border border-slate-800/80"
            style={{ WebkitTapHighlightColor: "transparent" }}
            type="button"
            role="button"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>)

          }
        </div>
      </div>
    </motion.div>
  )
}

// Add missing ChevronDown and ChevronUp components import
const ChevronDown = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )
}

const ChevronUp = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  )
}

export default MaintenancePage
