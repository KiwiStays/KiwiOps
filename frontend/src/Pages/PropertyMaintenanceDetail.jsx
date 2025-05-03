"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Clock,
  CheckSquare,
  ImageIcon,
  Save,
  X,
  Info,
  Camera,
  RefreshCw,
  Upload,
} from "lucide-react"
import axios from "axios"

const PropertyMaintenanceDetail = () => {
  const { propertyId } = useParams()
  //   const { darkMode } = useContext(AdminContext);
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState(null)
  const [error, setError] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [imagePreview, setImagePreview] = useState({})
  const [selectedImage, setSelectedImage] = useState({})
  const [comment, setComment] = useState({})
  const [taskStatus, setTaskStatus] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImage, setModalImage] = useState(null)
  const [modalComment, setModalComment] = useState("")
  const [modalDate, setModalDate] = useState("")
  const [hoverPreviewIndex, setHoverPreviewIndex] = useState(null)

  // Fetch property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true)
        // Comment out the actual API call
        const response = await axios.get(`/api/property/maintain/${propertyId}`);
        setProperty(response.data.property);

        // Add console.log instead
        // console.log("Fetching property data for ID:", propertyId)

        // // Mock data for testing
        // const mockProperty = {
        //   propertyName: "Sample Property",
        //   location: "123 Main St",
        //   instructions: [
        //     "Check HVAC filters",
        //     "Inspect roof for damage",
        //     "Test smoke detectors",
        //     "Clean gutters",
        //     "Check plumbing for leaks",
        //   ],
        //   maintenanceData: [],
        // }

        setProperty(response.data.property)

        // Initialize task statuses
        const initialStatus = {}
        const initialComments = {}
        const initialImages = {}
        if (response.data.property?.instructions && response.data.property?.instructions.length > 0) {
          response.data.property?.instructions.forEach((_, index) => {
            initialStatus[index] = false
            initialComments[index] = ""
            initialImages[index] = null
          })
        }
        setTaskStatus(initialStatus)
        setComment(initialComments)
        setImagePreview(initialImages)

        setLoading(false)
      } catch (err) {
        console.error("Error fetching property:", err)
        setError("Failed to load property data")
        setLoading(false)
      }
    }

    fetchPropertyData()
  }, [propertyId])

  const handleTaskSelect = (index) => {
    if (!property.instructions || property.instructions.length === 0) return
    setSelectedTask(index)
  }

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage((prev) => ({
        ...prev,
        [index]: file,
      }))

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview((prev) => ({
          ...prev,
          [index]: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCommentChange = (index, value) => {
    setComment((prev) => ({
      ...prev,
      [index]: value,
    }))
  }

  const handleTaskStatusToggle = (index) => {
    setTaskStatus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const calculateNextScheduleDate = () => {
    // Set next schedule date to 60 days from now
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + 60)
    return nextDate
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Prepare maintenance data entries for all modified tasks
      const updatedMaintenanceData = [...(property.maintenanceData || [])]

      // Get all tasks that have been modified (have status, comment, or image)
      const modifiedTasks = Object.keys(taskStatus)
        .filter((index) => taskStatus[index] || (comment[index] && comment[index].trim() !== "") || imagePreview[index])
        .map((index) => Number.parseInt(index))

      // Create or update entries for each modified task
      modifiedTasks.forEach((index) => {
        // Find if there's an existing entry for this task
        const existingEntryIndex = updatedMaintenanceData.findIndex((entry) => entry.taskIndex === index)

        if (existingEntryIndex >= 0) {
          // Update existing entry
          updatedMaintenanceData[existingEntryIndex] = {
            ...updatedMaintenanceData[existingEntryIndex],
            actualDate: new Date(),
            nextScheduledDate: calculateNextScheduleDate(),
            image: imagePreview[index] || updatedMaintenanceData[existingEntryIndex].image,
            comment: comment[index] || updatedMaintenanceData[existingEntryIndex].comment,
            lastUpdated: new Date(),
          }
        } else {
          // Add new entry
          const newEntry = {
            taskIndex: index,
            actualDate: new Date(),
            scheduledDate: new Date(),
            nextScheduledDate: calculateNextScheduleDate(),
            image: imagePreview[index],
            comment: comment[index] || "",
            lastUpdated: new Date(),
          }
          updatedMaintenanceData.push(newEntry)
        }
      })

      // Add console.log instead of API call
      console.log("Saving all maintenance updates:", {
        propertyId,
        maintenanceData: updatedMaintenanceData,
        modifiedTasks,
        taskStatus,
        comments: comment,
        images: Object.keys(imagePreview).filter((k) => imagePreview[k] !== null).length,
      })

      // Update local state with mock response
      const updatedProperty = {
        ...property,
        maintenanceData: updatedMaintenanceData,
      }
      setProperty(updatedProperty)

      // Reset form
      setSelectedTask(null)
      setImagePreview({})
      setSelectedImage({})
      setComment({})

      // Reset task statuses
      const resetStatus = {}
      if (property.instructions && property.instructions.length > 0) {
        property.instructions.forEach((_, index) => {
          resetStatus[index] = false
        })
      }
      setTaskStatus(resetStatus)

      setIsSubmitting(false)

      // Show success message
      alert("All maintenance tasks updated successfully!")
    } catch (err) {
      console.error("Error updating maintenance data:", err)
      alert("Failed to update maintenance data")
      setIsSubmitting(false)
    }
  }

  const showImageDetails = (entry) => {
    setModalImage(entry.image)
    setModalComment(entry.comment)
    setModalDate(new Date(entry.actualDate).toLocaleDateString())
    setShowImageModal(true)
  }

  // Function to calculate task status counts
  const calculateTaskStats = () => {
    if (!property || !property.instructions || property.instructions.length === 0)
      return { pastDue: 0, upcoming: 0, completed: 0 }

    const now = new Date()
    let pastDue = 0
    let upcoming = 0
    let completed = 0

    property.instructions.forEach((_, index) => {
      // Find the latest entry for this task
      const entry =
        property.maintenanceData && property.maintenanceData.length > 0
          ? property.maintenanceData
              .filter((item) => item.taskIndex === index)
              .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))[0]
          : null

      if (!entry) {
        // No entry means it's past due
        pastDue++
      } else if (entry.actualDate && !entry.nextScheduledDate) {
        // Has actual date but no next scheduled date - completed
        completed++
      } else if (entry.nextScheduledDate) {
        const nextDate = new Date(entry.nextScheduledDate)
        if (nextDate < now) {
          pastDue++
        } else {
          upcoming++
        }
      }
    })

    return { pastDue, upcoming, completed }
  }

  const stats = calculateTaskStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
        <p className="text-gray-600">{error || "Property not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  const darkMode = false // Default value since commented out in context

  return (
    <section className={`p-4 md:p-6 ${darkMode ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Back button and header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{property.propertyName}</h1>
            <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {property.location}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <img
              src={property.imageUrl || "/api/placeholder/60/60"}
              alt={property.propertyName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Past Due Stats */}
        <div
          className={`rounded-xl p-5 ${darkMode ? "bg-slate-800" : "bg-white"} shadow-lg flex items-center justify-between`}
        >
          <div>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Past Due Tasks</p>
            <h3 className="text-2xl font-bold text-red-500 mt-1">{stats.pastDue}</h3>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        </div>

        {/* Upcoming Stats */}
        <div
          className={`rounded-xl p-5 ${darkMode ? "bg-slate-800" : "bg-white"} shadow-lg flex items-center justify-between`}
        >
          <div>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Due Soon</p>
            <h3 className="text-2xl font-bold text-amber-500 mt-1">{stats.upcoming}</h3>
          </div>
          <div className="bg-amber-100 p-3 rounded-full">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        {/* Completed Stats */}
        <div
          className={`rounded-xl p-5 ${darkMode ? "bg-slate-800" : "bg-white"} shadow-lg flex items-center justify-between`}
        >
          <div>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Completed Tasks</p>
            <h3 className="text-2xl font-bold text-emerald-500 mt-1">{stats.completed}</h3>
          </div>
          <div className="bg-emerald-100 p-3 rounded-full">
            <CheckSquare className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Maintenance Form */}
        <div
          id="maintenance-form"
          className={`${darkMode ? "bg-slate-800" : "bg-white"} rounded-xl shadow-lg overflow-hidden`}
        >
          <div className={`px-6 py-4 border-b ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
            <h2 className="text-xl font-bold">Maintenance Checklist</h2>
            <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Select tasks, add notes, upload images, and update all at once
            </p>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Select Task to Complete
              </label>
              {property.instructions && property.instructions.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {property.instructions.map((instruction, index) => {
                    // Find maintenance data for this task
                    const taskData =
                      property.maintenanceData && property.maintenanceData.length > 0
                        ? property.maintenanceData
                            .filter((item) => item.taskIndex === index)
                            .sort((a, b) => new Date(b.actualDate || 0) - new Date(a.actualDate || 0))[0]
                        : null

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          selectedTask === index
                            ? `${darkMode ? "bg-indigo-900/30 border-indigo-500" : "bg-indigo-50 border-indigo-500"}`
                            : `${darkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600" : "bg-white border-gray-200 hover:bg-gray-50"}`
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={taskStatus[index] || false}
                            onChange={() => handleTaskStatusToggle(index)}
                            className="w-5 h-5 rounded-md cursor-pointer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              selectedTask === index
                                ? `${darkMode ? "text-indigo-300" : "text-indigo-700"}`
                                : `${darkMode ? "text-gray-200" : "text-gray-700"}`
                            }`}
                          >
                            {instruction}
                          </p>

                          {/* Show last maintenance date if exists */}
                          {property.maintenanceData &&
                            property.maintenanceData.some((item) => item.taskIndex === index) && (
                              <p className="text-xs text-gray-500 mt-1">
                                Last updated:{" "}
                                {new Date(
                                  property.maintenanceData
                                    .filter((item) => item.taskIndex === index)
                                    .sort((a, b) => new Date(b.actualDate || 0) - new Date(a.actualDate || 0))[0]
                                    ?.actualDate,
                                ).toLocaleDateString()}
                              </p>
                            )}
                        </div>

                        {/* Inline notes input */}
                        <input
                          type="text"
                          placeholder="Add notes..."
                          value={comment[index] || ""}
                          onChange={(e) => handleCommentChange(index, e.target.value)}
                          className={`flex-1 px-3 py-1 text-sm rounded-lg border ${
                            darkMode
                              ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                        />

                        {/* Image upload button with hover preview */}
                        <div className="relative">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, index)}
                              className="hidden"
                            />
                            <div
                              className={`p-2 rounded-lg ${
                                imagePreview[index] ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                              } hover:bg-gray-200`}
                              onMouseEnter={() => imagePreview[index] && setHoverPreviewIndex(index)}
                              onMouseLeave={() => setHoverPreviewIndex(null)}
                            >
                              {imagePreview[index] ? <Camera className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                            </div>
                          </label>

                          {/* Hover preview */}
                          {hoverPreviewIndex === index && imagePreview[index] && (
                            <div className="absolute z-10 bottom-full mb-2 right-0">
                              <img
                                src={imagePreview[index] || "/placeholder.svg"}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border-2 border-white shadow-lg"
                              />
                            </div>
                          )}
                        </div>

                        {/* Update button */}
                        <button
                          onClick={() => handleTaskSelect(index)}
                          className={`px-3 py-1 rounded-lg flex items-center gap-1 text-xs font-medium ${
                            darkMode ? "bg-amber-700 text-amber-100" : "bg-amber-100 text-amber-700"
                          } hover:bg-amber-200`}
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Update</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className={`p-6 text-center ${darkMode ? "bg-slate-700" : "bg-gray-100"} rounded-lg`}>
                  <Info className={`w-10 h-10 mx-auto mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    No maintenance instructions have been added for this property.
                  </p>
                </div>
              )}
            </div>

            {/* Save All Changes Button */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance History Table */}
        <div className={`${darkMode ? "bg-slate-800" : "bg-white"} rounded-xl shadow-lg overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
            <h2 className="text-xl font-bold">Maintenance Summary</h2>
            <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              History of completed and scheduled maintenance
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              <thead
                className={`text-xs uppercase ${darkMode ? "bg-slate-700 text-gray-400" : "bg-gray-50 text-gray-500"}`}
              >
                <tr>
                  <th className="px-6 py-3 text-left">Task</th>
                  <th className="px-6 py-3 text-center">Scheduled Date</th>
                  <th className="px-6 py-3 text-center">Actual Date</th>
                  <th className="px-6 py-3 text-center">Next Scheduled</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {property.instructions && property.instructions.length > 0 ? (
                  property.instructions.map((instruction, idx) => {
                    // Find maintenance data for this task
                    const taskData =
                      property.maintenanceData && property.maintenanceData.length > 0
                        ? property.maintenanceData
                            .filter((item) => item.taskIndex === idx)
                            .sort((a, b) => new Date(b.actualDate || 0) - new Date(a.actualDate || 0))[0]
                        : null

                    return (
                      <tr key={idx} className={`${darkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"}`}>
                        <td className="px-6 py-4 text-sm font-medium">{instruction}</td>
                        <td className="px-6 py-4 text-sm text-center">
                          {taskData?.scheduledDate
                            ? new Date(taskData.scheduledDate).toLocaleDateString()
                            : "Not scheduled"}
                        </td>
                        <td className={`px-6 py-4 text-sm text-center`}>
                          {taskData?.actualDate ? (
                            <button
                              onClick={() => showImageDetails(taskData)}
                              className={`flex items-center justify-center mx-auto gap-1 px-2 py-1 rounded ${
                                darkMode
                                  ? "bg-indigo-900/30 hover:bg-indigo-800/40"
                                  : "bg-indigo-50 hover:bg-indigo-100"
                              } ${taskData.image ? "text-indigo-500" : ""}`}
                            >
                              {new Date(taskData.actualDate).toLocaleDateString()}
                              {taskData.image && <ImageIcon className="w-3 h-3 ml-1" />}
                            </button>
                          ) : (
                            "Not completed"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          {taskData?.nextScheduledDate
                            ? new Date(taskData.nextScheduledDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <button
                            onClick={() => handleTaskSelect(idx)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              darkMode ? "bg-amber-700 text-amber-100" : "bg-amber-100 text-amber-700"
                            } hover:bg-amber-200`}
                          >
                            <span>Update</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        No maintenance instructions available for this property.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {(!property.maintenanceData ||
            property.maintenanceData.length === 0 ||
            !property.instructions ||
            property.instructions.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className={`w-12 h-12 mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`} />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {!property.instructions || property.instructions.length === 0
                  ? "No Maintenance Instructions"
                  : "No Maintenance Records"}
              </h3>
              <p className={`text-sm max-w-md ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {!property.instructions || property.instructions.length === 0
                  ? "No maintenance instructions have been added to this property yet."
                  : "No tasks have been completed yet. Start by completing tasks from the maintenance checklist."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`max-w-lg w-full rounded-xl overflow-hidden ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <div
              className={`px-6 py-4 flex items-center justify-between border-b ${darkMode ? "border-slate-700" : "border-gray-200"}`}
            >
              <h3 className="text-lg font-bold">Maintenance Image</h3>
              <button onClick={() => setShowImageModal(false)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {modalImage ? (
                <img
                  src={modalImage || "/placeholder.svg"}
                  alt="Maintenance verification"
                  className="w-full rounded-lg"
                />
              ) : (
                <div
                  className={`w-full h-64 flex items-center justify-center ${darkMode ? "bg-slate-700" : "bg-gray-100"} rounded-lg`}
                >
                  <ImageIcon className={`w-12 h-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                </div>
              )}

              <div className="mt-4">
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <span className="font-medium">Date:</span> {modalDate}
                </p>
                {modalComment && (
                  <div className="mt-2">
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Notes:</p>
                    <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{modalComment}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={`px-6 py-4 border-t ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
              <button
                onClick={() => setShowImageModal(false)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default PropertyMaintenanceDetail
