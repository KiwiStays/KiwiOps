"use client"

import { useParams } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AdminContext } from "../Context/AdminContext.jsx"

// Main component that combines all functionality
export default function PropertyMaintenanceForm() {
  const { propertyId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [activeInstruction, setActiveInstruction] = useState(null)
  const [formInputs, setFormInputs] = useState({
    Cost: "",
    notes: "",
    Date: "",
    imageFile: null,
    imagePreview: null,
  })

  // Main property state
  const [property, setProperty] = useState({
    stats: { pastDue: 0, upcoming: 0, completed: 0 },
    _id: "",
    propertyName: "",
    location: "",
    imageUrl: "",
    imagePublicId: "",
    instructions: [],
    maintenanceData: [],
    schedule_date: null,
    createdAt: "",
    updatedAt: "",
  })

  // Function to extract the scheduling days from instruction
  const extractSchedulingDays = (instruction) => {
    const parts = instruction.split("_")
    if (parts.length > 1) {
      const daysValue = Number.parseInt(parts[parts.length - 1], 10)
      return isNaN(daysValue) ? 60 : daysValue // Default to 60 if parsing fails
    }
    return 60 // Default value if no underscore or value found
  }

  // Fetch property data on component mount
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/property/maintain/${propertyId}`)
        console.log("Fetched property data:", response.data.property)
        // console.log("Fetched property date:", response.data.property.schedule_date)

        // Format the data properly
        const formattedData = {
          ...response.data.property,
          // Format the top-level schedule_date for display
          schedule_date: response.data.property.schedule_date
            ? new Date(response.data.property.schedule_date).toISOString().split("T")[0]
            : null,
          maintenanceData: response.data.property.maintenanceData.map((item) => {
            return {
              ...item,
              records: item.records.map((record) => ({
                ...record,
                // Format dates for display if they exist
                scheduledDate: record.scheduledDate ? new Date(record.scheduledDate).toISOString().split("T")[0] : null,
                actualDate: record.actualDate ? new Date(record.actualDate).toISOString().split("T")[0] : null,
                nextScheduledDate: record.nextScheduledDate
                  ? new Date(record.nextScheduledDate).toISOString().split("T")[0]
                  : null,
              })),
            }
          }),
        }

        setProperty(formattedData)
        // console.log("Formatted property data:", formattedData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching property data:", err)
        setError("Failed to load property data")
        setLoading(false)
      }
    }

    fetchPropertyData()
  }, [propertyId])

  // Initialize maintenance data with scheduled dates if empty
  useEffect(() => {
    if (property.maintenanceData.length > 0) {
      const today = new Date()
      let pastDue = 0
      let upcoming = 0
      let completed = 0

      // var temp_len = property.instructions.length;
      // console.log("Property instructions length:", temp_len)
      // while(temp_len){

      today.setHours(0, 0, 0, 0); // Ensure today's date is normalized
      const curr = new Date(today); // Copy the normalized date
      const scheduledDate = new Date(property.schedule_date);
      scheduledDate.setHours(0, 0, 0, 0); // Normalize scheduled date

      console.log("Current date:", curr);
      console.log("Scheduled date:", scheduledDate);

      console.log("Property instructions:", property.instructions.length);
      console.log("Property maintenance data length:", property?.maintenanceData?.length);
      if(property?.maintenanceData?.length !== property.instructions.length){
        console.log("Property maintenance data length does not match instructions length.");
      if (curr > scheduledDate) {
        console.log("Current date is greater than scheduled date.");  

        pastDue += property.instructions.length - property?.maintenanceData?.length;
        console.log("Past due count:", pastDue);
      } else if (curr <= scheduledDate) {
        console.log("Current date is less than or equal to scheduled date.");
        upcoming += property.instructions.length - property?.maintenanceData?.length;
        console.log("Upcoming count:", upcoming);
      }
    }




      // }
    

      property.maintenanceData.forEach((item) => {
        // 1. First count how many records are completed
        item.records.forEach((record) => {
          if (record.actualDate) {
            completed++
          }
        })



        // 2. Then only check the LAST record for upcoming/past due
        let latestRecord = null

        if (item.records.length === 1) {
          latestRecord = item.records[0]
        } else if (item.records.length > 1) {
          latestRecord = item.records[item.records.length - 1]
        }

        if (latestRecord) {
          console.log("Latest record:", latestRecord)
          const scheduledDate = new Date(latestRecord.scheduledDate)

          if (!latestRecord.actualDate) {
            if (scheduledDate < today) {
              pastDue++
              console.log("Past due count incremented:", pastDue)
            } else {
              const sevenDaysLater = new Date(today)
              sevenDaysLater.setDate(today.getDate() + 7)
              sevenDaysLater.setHours(23, 59, 59, 999) // End of day 7 days later

              if (scheduledDate <= sevenDaysLater) {
                upcoming++
                console.log("Upcoming count incremented:", upcoming)
              }
            }
          }
        }
      })

      setProperty((prev) => ({
        ...prev,
        stats: { pastDue, upcoming, completed },
      }))
    }
  }, [property.maintenanceData])

  const handleInputChange = (e) => {
    const { name, value, files } = e.target

    if (name === "imageFile" && files && files[0]) {
      const file = files[0]
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file)

      setFormInputs((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: previewUrl,
      }))
    } else {
      setFormInputs((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleInstructionClick = (index) => {
    if (activeInstruction === index) {
      setActiveInstruction(null)
      resetFormInputs()
    } else {
      setActiveInstruction(index)
      resetFormInputs()
    }
  }

  const resetFormInputs = () => {
    setFormInputs({
      Date: "",
      Cost: "",
      notes: "",
      imageFile: null,
      imagePreview: null,
    })
  }

  const handleUpdateScheduledDate = (instructionIndex, recordIndex, newDate) => {
    const updatedMaintenanceData = [...property.maintenanceData]

    // Find the maintenance item for this instruction
    const maintenanceItemIndex = updatedMaintenanceData.findIndex((item) =>
      item.records.some((record) => record.instruction === property.instructions[instructionIndex]),
    )

    if (maintenanceItemIndex !== -1) {
      // Find the record
      const recordIndex = updatedMaintenanceData[maintenanceItemIndex].records.findIndex(
        (record) => record.instruction === property.instructions[instructionIndex] && !record.actualDate,
      )

      if (recordIndex !== -1) {
        updatedMaintenanceData[maintenanceItemIndex].records[recordIndex].scheduledDate = newDate
        updatedMaintenanceData[maintenanceItemIndex].records[recordIndex].lastUpdated = new Date().toISOString()

        setProperty((prev) => ({
          ...prev,
          maintenanceData: updatedMaintenanceData,
        }))
      }
    }
  }

  // Add handler for updating property schedule date
  const handleUpdatePropertyScheduleDate = (newDate) => {
    setProperty((prev) => ({
      ...prev,
      schedule_date: newDate,
    }))
  }

  const handleUpdateIndividualPropertyScheduleDate = (instructionIndex, recordIndex, newDate) => {
    const updatedMaintenanceData = [...property.maintenanceData]

    // Find the maintenance item for this instruction
    const maintenanceItemIndex = updatedMaintenanceData.findIndex((item) =>
      item.records.some((record) => record.instruction === property.instructions[instructionIndex]),
    )

    if (maintenanceItemIndex !== -1) {
      // Find the record
      const recordIdx = updatedMaintenanceData[maintenanceItemIndex].records.findIndex(
        (record) => record.instruction === property.instructions[instructionIndex] && !record.actualDate,
      )

      if (recordIdx !== -1) {
        // Add propertyScheduleDate to the record
        updatedMaintenanceData[maintenanceItemIndex].records[recordIdx].propertyScheduleDate = newDate
        updatedMaintenanceData[maintenanceItemIndex].records[recordIdx].lastUpdated = new Date().toISOString()

        setProperty((prev) => ({
          ...prev,
          maintenanceData: updatedMaintenanceData,
        }))
      }
    }
  }

  // 5. Now, let's modify the PropertyMaintenanceForm component to add the new handleUpdateInstruction function
  // and remove the InstructionListComponent from the main render

  // First, add this new function to the PropertyMaintenanceForm component:
  // const handleUpdateInstruction = (instructionIndex, formInputs) => {
  const handleUpdateInstruction = (instructionIndex, formInputs) => {
    if (instructionIndex === null) return;

    const updatedMaintenanceData = [...property.maintenanceData];
    const today = new Date().toISOString().split("T")[0];
    const instructionText = property.instructions[instructionIndex];

    // Get the scheduling days from the instruction
    const schedulingDays = extractSchedulingDays(instructionText);

    // Find the maintenance item for this instruction
    const maintenanceItemIndex = updatedMaintenanceData.findIndex((item) =>
      item.records.some((record) => record.instruction === instructionText && !record.actualDate)
    );

    console.log("Active instruction:", instructionText);
    console.log("Found maintenanceItemIndex:", maintenanceItemIndex);
    console.log("Scheduling days for this instruction:", schedulingDays);
    console.log("Form inputs:", formInputs); // Log the form inputs to check Cost value

    if (maintenanceItemIndex !== -1) {
      // Find the most recent pending record for this instruction
      const recordIndex = updatedMaintenanceData[maintenanceItemIndex].records.findIndex(
        (record) => record.instruction === instructionText && !record.actualDate
      );

      console.log("Found recordIndex:", recordIndex);

      if (recordIndex !== -1) {
        // Update the actual date for the current scheduled maintenance
        // FIXED: Ensure cost is stored in the expected field name consistently
        updatedMaintenanceData[maintenanceItemIndex].records[recordIndex] = {
          ...updatedMaintenanceData[maintenanceItemIndex].records[recordIndex],

          Cost: formInputs.Cost, // Also store as "Cost" (uppercase) for backward compatibility
          actualDate: formInputs.Date || today,
          notes: formInputs.notes,
          imageFile: formInputs.imageFile, // Store the file object for upload
          // Keep imageUrl empty - will be set by backend
          imagePublicId: "", // Will be set by backend
          lastUpdated: new Date().toISOString(),
        };

        // Calculate next scheduled date using the extracted days value
        // const nextScheduledDate = formInputs.Date;
        // const nextScheduledDate = new Date(updatedMaintenanceData[maintenanceItemIndex].records[recordIndex].scheduledDate);
        // nextScheduledDate.setDate(nextScheduledDate.getDate() + schedulingDays);
        // console.log("Next scheduled date:", nextScheduledDate);
        const formattedNextDate = formInputs.nextScheduleDate;
        console.log("Formatted next scheduled date:", formattedNextDate);
        


        // Add a new scheduled maintenance using the extracted days
        updatedMaintenanceData[maintenanceItemIndex].records.push({
          instruction: instructionText,
          scheduledDate: formattedNextDate,
          actualDate: null,
          notes: "",
          imageUrl: "",
          imagePublicId: "",
          lastUpdated: new Date().toISOString(),
        })

        // Update the state
        setProperty((prev) => ({
          ...prev,
          maintenanceData: updatedMaintenanceData,
        }))

        // Set success message
        setSuccessMessage("Maintenance record updated successfully!")
      } else {
        setError("Could not find a pending record for this instruction.")
        console.error("No pending record found for instruction:", instructionText)
      }
    } else {
      // If no maintenance item exists for this instruction, create one
      console.log("No maintenance item found, creating a new one")

      const newMaintenanceItem = {
        instruction: instructionText,
        records: [
          {
            instruction: instructionText,
            scheduledDate: property.schedule_date || today,
            Cost: formInputs.Cost,
            actualDate: formInputs.Date || today,
            notes: formInputs.notes,
            imageFile: formInputs.imageFile,
            imageUrl: "",
            imagePublicId: "",
            lastUpdated: new Date().toISOString(),
          },
          {
            // Add next scheduled maintenance with dynamic scheduling days
            instruction: instructionText,
            scheduledDate: (() => {
              // const nextDate = formInputs.Date
              // const temp_next_date = nextDate+schedulingDays;
              // nextDate.setDate(temp_next_date);
              // return nextDate.toISOString().split("T")[0]
              return formInputs.nextScheduleDate

            })(),
            actualDate: null,
            notes: "",
            imageUrl: "",
            imagePublicId: "",
            lastUpdated: new Date().toISOString(),
          },
        ],
      }

      updatedMaintenanceData.push(newMaintenanceItem)

      setProperty((prev) => ({
        ...prev,
        maintenanceData: updatedMaintenanceData,
      }))

      setSuccessMessage("New maintenance record created successfully!")
    }
  }

  const handleSaveChanges = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)
      console.log("Saving property maintenance data...", property)

      const formData = new FormData()

      // First, add the simple data
      formData.append("stats", JSON.stringify(property.stats))
      formData.append("schedule_date", property.schedule_date)

      // Add each file with a unique key
      let filesCount = 0
      const cleanedMaintenanceData = property.maintenanceData.map((item) => {
        return {
          ...item,
          records: item.records.map((record) => {
            if (record.imageFile instanceof File) {
              const fileKey = `file-${filesCount++}`
              formData.append(fileKey, record.imageFile)

              const { imageFile, ...rest } = record
              return { ...rest, fileKey }
            }
            const { imageFile, ...rest } = record
            return rest
          }),
        }
      })

      // Add the cleaned data
      formData.append("maintenanceData", JSON.stringify(cleanedMaintenanceData))

      // Log what's being sent
      console.log("Sending maintenanceData:", JSON.stringify(cleanedMaintenanceData))

      // Make the request
      const response = await axios.put(`/api/property/maintain/${propertyId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Property maintenance data saved:", response.data)
      setSuccessMessage("Property maintenance data saved successfully!")
      setLoading(false)
    } catch (err) {
      console.error("Error saving property maintenance data:", err)
      setError("Failed to save property maintenance data. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
      <div className="container mx-auto p-4 max-w-full">
        {loading && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-gray-700">Loading property data...</p>
            </div>
          </div>
        )}

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="rounded-lg shadow-lg p-6 mb-8">
          <div className="lg:flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">{property.propertyName}</h1>
              <p className="text-gray-200">{property.location}</p>
            </div>
            <div className="lg:flex gap-4">
              <div className="bg-red-100 p-3 m-2 rounded-lg">
                <p className="text-sm text-gray-600">Past Dues</p>
                <p className="text-xl font-bold text-red-600">{property.stats.pastDue}</p>
              </div>
              <div className="bg-yellow-100 p-3 m-2 rounded-lg">
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-xl font-bold text-yellow-600">{property.stats.upcoming}</p>
              </div>
              {/* <div className="bg-green-100 p-3 m-2 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">{property.stats.completed}</p>
              </div> */}
            </div>
          </div>

          {/* Property Schedule Date Section */}
          <div className="mb-6 lg:flex items-center gap-4">
            <div className="flex-1">
              <img
                src={property.imageUrl || "/placeholder.svg"}
                alt={property.propertyName}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Property Schedule Date</h3>
              <input
                type="date"
                value={property.schedule_date || ""}
                onChange={(e) => handleUpdatePropertyScheduleDate(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-600 mt-2">
                This is the main schedule date for all property maintenance tasks.
              </p>
            </div>
          </div>

          {property.maintenanceData.length > 0 && (
            <MaintenanceHistoryChartComponent maintenanceData={property.maintenanceData} instruction={property.instructions} />
          )}

          {/* Now, modify the render section to remove the InstructionListComponent */}
          {/* Find the grid div in the return statement and replace it with: */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <MaintenanceTableComponent
              maintenanceData={property.maintenanceData}
              instructions={property.instructions}
              onUpdateScheduledDate={handleUpdateScheduledDate}
              onUpdatePropertyScheduleDate={handleUpdateIndividualPropertyScheduleDate}
              propertyScheduleDate={property.schedule_date}
              extractSchedulingDays={extractSchedulingDays}
              handleUpdateInstruction={handleUpdateInstruction}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveChanges}
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


// Updated MaintenanceHistoryChartComponent with improved scheduled task detection
function MaintenanceHistoryChartComponent({ maintenanceData = [], instructions = [] }) {
  // Ensure maintenanceData is defined with a default empty array
  const safeMaintenanceData = maintenanceData || []
  const { adminToken } = useContext(AdminContext)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (adminToken) {
      setIsAdmin(true)
      // console.log("Admin token is present, user is admin.");
    }
  }, [adminToken])

  // Calculate total cost properly handling both cost and Cost fields
  const totalCost = safeMaintenanceData.reduce((total, item) => {
    if (!item || !item.records) return total

    return (
      total +
      item.records.reduce((itemTotal, record) => {
        if (!record) return itemTotal
        // Check both cost and Cost fields and handle all possible formats
        const costValue = record.cost || record.Cost
        return itemTotal + (costValue ? Number.parseFloat(costValue) || 0 : 0)
      }, 0)
    )
  }, 0)

  // Get all records
  const allRecords = []

  // Extract all records from the maintenance data for processing
  safeMaintenanceData.forEach((item) => {
    if (item && item.records) {
      item.records.forEach((record) => {
        if (record) allRecords.push(record)
      })
    }
  })

  // Skip if no records or instructions
  if (allRecords.length === 0 && (!instructions || instructions.length === 0)) {
    return (
      <div className="bg-gradient-to-b from-blue-950 to-slate-900 overflow-hidden p-6 rounded-lg shadow-lg mb-8">
        <p className="text-gray-300 text-center">No maintenance data available.</p>
      </div>
    )
  }

  // Use the provided instructions array rather than extracting from records
  // This ensures we show all instruction types even if some don't have records yet
  const uniqueInstructions =
    instructions.length > 0
      ? instructions
      : [...new Set(allRecords.map((record) => record?.instruction).filter(Boolean))]

  // Find the earliest schedule date to use as a starting point
  const findEarliestScheduleDate = () => {
    let earliestDate = new Date() // Default to today

    // If there are no scheduled dates, start from current month
    if (allRecords.length === 0) {
      return new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1)
    }

    // Check all records for the earliest date (check both actualDate and scheduledDate)
    safeMaintenanceData.forEach((item) => {
      if (item && item.records) {
        item.records.forEach((record) => {
          if (!record) return

          if (record.scheduledDate) {
            const recordDate = new Date(record.scheduledDate)
            if (!isNaN(recordDate) && recordDate < earliestDate) {
              earliestDate = recordDate
            }
          }
          if (record.actualDate) {
            const recordDate = new Date(record.actualDate)
            if (!isNaN(recordDate) && recordDate < earliestDate) {
              earliestDate = recordDate
            }
          }
        })
      }
    })

    // Set to the first day of the month
    return new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1)
  }

  // Get future months from the earliest schedule date
  const getFutureMonths = () => {
    const startDate = findEarliestScheduleDate()
    const months = []

    // Add 12 months from the earliest date
    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate)
      d.setMonth(startDate.getMonth() + i)
      months.push({
        month: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        date: new Date(d.getFullYear(), d.getMonth(), 1),
      })
    }
    return months
  }

  const months = getFutureMonths()

  // Check if a date falls within a specific month
  const dateInMonth = (dateStr, monthDate) => {
    if (!dateStr) return false

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return false

    return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear()
  }

  // IMPROVED: Get the status for each instruction and month
  const getMonthStatus = (instruction, monthDate) => {
    // Find all records for this instruction
    const instructionRecords = allRecords.filter((record) => record && record.instruction === instruction)

    // Check if any maintenance was COMPLETED in this month
    const completedInMonth = instructionRecords.some(
      (record) => record && record.actualDate && dateInMonth(record.actualDate, monthDate),
    )

    // If completed, return completed status
    if (completedInMonth) {
      return "completed"
    }

    // Check if any maintenance is SCHEDULED in this month (but not completed)
    const scheduledInMonth = instructionRecords.some(
      (record) => record && record.scheduledDate && dateInMonth(record.scheduledDate, monthDate) && !record.actualDate, // Must not be completed yet
    )

    // Check if any maintenance was SCHEDULED for this month but COMPLETED in a later month
    const delayedFromThisMonth = instructionRecords.some(
      (record) =>
        record &&
        record.scheduledDate &&
        record.actualDate &&
        dateInMonth(record.scheduledDate, monthDate) &&
        new Date(record.actualDate) > new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0),
    )

    // Return appropriate status
    if (delayedFromThisMonth) {
      return "delayed"
    }

    if (scheduledInMonth) {
      return "scheduled"
    }

    return "none"
  }

  // Count completed records per month for each instruction
  const getCompletedCountForMonth = (instruction, monthDate) => {
    return allRecords.filter(
      (record) =>
        record && record.instruction === instruction && record.actualDate && dateInMonth(record.actualDate, monthDate),
    ).length
  }

  return (
    <div className="bg-gradient-to-b from-blue-950 to-slate-900 overflow-hidden p-6 rounded-lg shadow-lg mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-100">Maintenance History</h2>
        <div className="bg-green-900/30 px-4 py-2 rounded-lg border border-green-500/50">
          <span className="text-green-300 font-medium">{isAdmin ? "Total Cost:" : null}</span>
          <span className="text-white font-bold">{isAdmin ? totalCost.toFixed(2) : null}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month headers */}
          <div className="flex border-b pb-2">
            <div className="w-48 font-medium text-gray-200">Instruction</div>
            {months.map((month, idx) => (
              <div key={idx} className="w-16 text-center text-xs font-medium text-gray-200">
                {month.month}
                <br />
                {month.year}
              </div>
            ))}
          </div>

          {/* Data rows */}
          <div className="space-y-4 mt-4">
            {uniqueInstructions.map((instruction, index) => (
              <div key={index} className="flex items-center">
                <div className="w-48 text-sm truncate text-gray-200" title={instruction}>
                  {instruction}
                </div>

                {months.map((month, monthIdx) => {
                  const status = getMonthStatus(instruction, month.date)
                  const completedCount = getCompletedCountForMonth(instruction, month.date)

                  return (
                    <div key={monthIdx} className="w-16 flex justify-center">
                      {status === "completed" ? (
                        <div
                          className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center"
                          title={`${completedCount} maintenance(s) performed`}
                        >
                          {completedCount > 1 && (
                            <span className="text-white text-[8px] font-bold">{completedCount}</span>
                          )}
                        </div>
                      ) : status === "scheduled" ? (
                        <div
                          className="h-4 w-4 rounded-full bg-yellow-500 animate-pulse"
                          title="Scheduled maintenance"
                        ></div>
                      ) : status === "delayed" ? (
                        <div className="h-4 w-4 rounded-full bg-red-500" title="Delayed maintenance"></div>
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-gray-700/50" title="No maintenance"></div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end mt-4 text-sm text-gray-300 gap-4">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse mr-2"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
          <span>Delayed</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-gray-700/50 mr-2"></div>
          <span>No maintenance</span>
        </div>
      </div>
    </div>
  )
}

// Updated MaintenanceTableComponent with improved cost handling
// MaintenanceTableComponent with improved scheduling logic and status flags
function MaintenanceTableComponent({
  maintenanceData,
  instructions,
  onUpdateScheduledDate,
  onUpdatePropertyScheduleDate,
  propertyScheduleDate,
  extractSchedulingDays,
  handleUpdateInstruction,
}) {
  const { adminToken } = useContext(AdminContext);
  const [isAdmin, setIsAdmin] = useState(false);
  // Add local state to manage dates
  const [localDates, setLocalDates] = useState({});

  useEffect(() => {
    if (adminToken) {
      setIsAdmin(true);
      // console.log("Admin token is present, user is admin.");
    }
  }, [adminToken]);

  // Initialize local dates from maintenanceData when component mounts or data changes
  useEffect(() => {
    const initialDates = {};
    maintenanceData.forEach((item) => {
      item.records.forEach((record, recordIdx) => {
        if (record.instruction) {
          const key = `${record.instruction}_${recordIdx}`;
          initialDates[key] = record.scheduledDate || record.propertyScheduleDate || "";
        }
      });
    });
    setLocalDates(initialDates);
  }, [maintenanceData]);

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [activeInstructionForm, setActiveInstructionForm] = useState(null);
  const [formInputs, setFormInputs] = useState({
    Cost: "",
    notes: "",
    Date: "",
    imageFile: null,
    imagePreview: null,
  });

  // Calculate next schedule date based on actual completion date and maintenance cycle
  const calculateNextScheduleDate = (instruction, actualDate) => {
    // Extract the cycle days from the instruction
    const daysMatch = instruction.match(/Every (\d+) days/);
    const cycleDays = daysMatch ? parseInt(daysMatch[1]) : extractSchedulingDays(instruction);

    if (!cycleDays || isNaN(cycleDays)) {
      console.error("Could not determine cycle days for instruction:", instruction);
      return null;
    }

    // Parse the actual date
    const completionDate = new Date(actualDate);
    if (isNaN(completionDate.getTime())) {
      console.error("Invalid actual date:", actualDate);
      return null;
    }

    // Calculate next schedule date by adding cycle days to actual completion date
    const nextDate = new Date(completionDate);
    nextDate.setDate(nextDate.getDate() + cycleDays);

    // Format to YYYY-MM-DD
    return nextDate.toISOString().split('T')[0];
  };

  const handleFormInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imageFile" && files && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);

      setFormInputs((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: previewUrl,
      }));
    } else {
      setFormInputs((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetFormInputs = () => {
    setFormInputs({
      Date: "",
      Cost: "",
      notes: "",
      imageFile: null,
      imagePreview: null,
    });
  };

  const handleFormSubmit = (instructionIndex) => {
    // Make sure cost is properly passed to the update function
    const completedFormData = { ...formInputs };

    // Once a task is marked as completed, calculate the next schedule date
    if (completedFormData.Date) {
      const instruction = instructions[instructionIndex];
      const nextScheduleDate = calculateNextScheduleDate(instruction, completedFormData.Date);

      // Add the next schedule date to the form data
      completedFormData.nextScheduleDate = nextScheduleDate;

      // Find if we already have a pending record for the next maintenance cycle
      const instructionData = processedData.find(item => item.instructionIndex === instructionIndex);
      const pendingRecords = instructionData?.records.filter(r => !r.actualDate) || [];

      if (pendingRecords.length === 0) {
        // If no pending record exists, we need to indicate that one should be created
        completedFormData.createNextSchedule = true;
        completedFormData.nextScheduleDate = nextScheduleDate;
      } else {
        // If a pending record already exists, update its date based on this completion
        const nextPendingRecordId = pendingRecords[0]._id;
        completedFormData.updateNextScheduleId = nextPendingRecordId;
        completedFormData.nextScheduleDate = nextScheduleDate;
      }

      console.log(`Task completed on ${completedFormData.Date}. Next schedule set for: ${nextScheduleDate}`);
    }

    handleUpdateInstruction(instructionIndex, completedFormData);
    setActiveInstructionForm(null);
    resetFormInputs();
  };

  const closeInstructionForm = () => {
    setActiveInstructionForm(null);
    resetFormInputs();
  };

  // Modified to update local state first, then call parent function
  const handleScheduledDateChange = (instructionIndex, recordIndex, e) => {
    if (isAdmin) {
      const newDate = e.target.value;
      const key = `${instructions[instructionIndex]}_${recordIndex}`;
      
      // Update local state immediately for responsive UI
      setLocalDates(prev => ({
        ...prev,
        [key]: newDate
      }));
      
      // Call parent function to update backend
      onUpdateScheduledDate(instructionIndex, recordIndex, newDate);
    }
  };

  // Modified to update local state first, then call parent function
  const handlePropertyScheduleDateChange = (instructionIndex, recordIndex, e) => {
    if (isAdmin) {
      const newDate = e.target.value;
      const key = `${instructions[instructionIndex]}_${recordIndex}`;
      
      // Update local state immediately for responsive UI
      setLocalDates(prev => ({
        ...prev,
        [key]: newDate
      }));
      
      // Call parent function to update backend
      onUpdatePropertyScheduleDate(instructionIndex, recordIndex, newDate);
    }
  };

  // Fixed to properly capture the cost field
  const handleActualDateClick = (instruction, record) => {
    if (record.actualDate) {
      setSelectedDetail({
        instruction,
        ScheduledDate: new Date(record.scheduledDate),
        date: record.actualDate,
        notes: record.notes,
        imageUrl: record.imageUrl,
        Cost: record.cost || record.Cost, // Check both possible field names
      });
    }
  };

  const closePopup = () => {
    setSelectedDetail(null);
  };

  // Build processedData with proper sorting to ensure chronological order
  const processedData = instructions.map((instruction, index) => {
    const allRecords = [];

    maintenanceData.forEach((item) => {
      item.records.forEach((record) => {
        if (record.instruction === instruction) {
          // Make sure to convert dates to consistent format
          const processedRecord = {
            ...record,
            // Ensure scheduledDate is in YYYY-MM-DD format for consistent comparison
            scheduledDate: record.scheduledDate ? new Date(record.scheduledDate).toISOString().split('T')[0] : "",
            // Ensure actualDate is in YYYY-MM-DD format if it exists
            actualDate: record.actualDate ? new Date(record.actualDate).toISOString().split('T')[0] : null,
          };
          allRecords.push(processedRecord);
        }
      });
    });

   
    // Add an empty record if no records exist for this instruction
    // This ensures the schedule_date appears for all instructions
    if (allRecords.length === 0) {
      allRecords.push({
        instruction,
        scheduledDate: propertyScheduleDate || "",
        actualDate: null,
        notes: "",
        imageUrl: "",
        imagePublicId: "",
        lastUpdated: new Date().toISOString(),
        isDefault: true, // Flag to identify default records
      });
    }

    return {
      instruction,
      instructionIndex: index,
      records: allRecords,
    };
  });

  const maxRecords = Math.max(...processedData.map((item) => item.records.length), 1);
  const columnHeaders = Array.from({ length: maxRecords }, (_, i) => `Schedule ${i + 1}`);

  // Function to extract cycle days from instruction text
  const getCycleDaysFromInstruction = (instruction) => {
    // Formats like "AC Dry Servicing Houses_30" or "Every 30 days"
    const daysPattern = /(\d+)(?:\_|\s*days)/i;
    const match = instruction.match(daysPattern);
    return match ? parseInt(match[1]) : extractSchedulingDays(instruction); // Fallback to provided function
  };

  // Function to display the next scheduled date based on the maintenance cycle
  const getNextScheduleDate = (instruction, actualDate) => {
    if (!actualDate) return "-";

    const days = getCycleDaysFromInstruction(instruction);
    if (!days) return "-";

    // Calculate next date from actual completion date
    const completionDate = new Date(actualDate);
    const nextDate = new Date(completionDate);
    nextDate.setDate(nextDate.getDate() + days);

    return nextDate.toISOString().split('T')[0];
  };

  // Process maintenance history to determine the correct next schedule date
  const processMaintenanceHistory = (records, instruction) => {
    // Find the last completed record
    const completedRecords = records.filter(record => record.actualDate).sort((a, b) => {
      return new Date(b.actualDate) - new Date(a.actualDate);  // Most recent first
    });

    if (completedRecords.length === 0) {
      return null; // No completed records
    }

    const lastCompletedRecord = completedRecords[0];
    const cycleDays = getCycleDaysFromInstruction(instruction);

    if (!cycleDays) return null;

    // Calculate the next due date based on the most recent actual completion date
    const lastCompletionDate = new Date(lastCompletedRecord.actualDate);
    const nextDueDate = new Date(lastCompletionDate);
    nextDueDate.setDate(nextDueDate.getDate() + cycleDays);

    return nextDueDate.toISOString().split('T')[0];
  };
  
  // Function to check if a task is upcoming or past due
  const getTaskStatus = (item) => {
    // Find the earliest pending task
    const pendingRecords = item.records.filter(record => !record.actualDate);
    if (pendingRecords.length === 0) return null;
    
    // Find the scheduled date to check
    let dateToCheck = null;
    const nextDueDate = processMaintenanceHistory(item.records, item.instruction);
    
    // Get the first pending record's date
    const firstPendingRecord = pendingRecords[0];
    if (nextDueDate) {
      dateToCheck = nextDueDate;
    } else {
      dateToCheck = firstPendingRecord.propertyScheduleDate || 
                   firstPendingRecord.scheduledDate || 
                   propertyScheduleDate;
    }
    
    // If no valid date, can't determine status
    if (!dateToCheck || dateToCheck === "-") return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const scheduledDate = new Date(dateToCheck);
    scheduledDate.setHours(0, 0, 0, 0);
    
    const timeDiff = scheduledDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Past due: date is before today
    if (daysDiff < 0) return "past-due";
    
    // Upcoming: within the next 7 days
    if (daysDiff <= 7) return "upcoming";
    
    return null;
  };

  return (
    <div className="overflow-x-auto bg-gradient-to-b from-slate-900 to-blue-950 p-4 rounded-lg shadow-xl">
      <table
        className="min-w-full bg-transparent border-collapse rounded-lg shadow-lg"
        style={{ borderCollapse: "separate", borderSpacing: 0 }}
      >
        <thead>
          <tr>
            <th className="py-4 px-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider sticky left-0 bg-slate-900 z-10 border-b border-blue-800 rounded-tl-lg">
              Instruction
            </th>
            {columnHeaders.map((header, idx) => (
              <th
                key={idx}
                className={`py-4 px-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider min-w-[180px] bg-slate-900 border-b border-blue-800 ${idx === columnHeaders.length - 1 ? "rounded-tr-lg" : ""
                  }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-900">
          {processedData.map((item) => {
            const taskStatus = getTaskStatus(item);
            
            return (
              <tr key={item.instructionIndex} className="hover:bg-blue-900/30 transition-colors duration-150">
                <td className="py-4 px-5 text-sm font-medium sticky left-0 z-10 bg-slate-900 text-gray-100 border-r border-blue-800">
                  <div className="flex items-center gap-2">
                    {taskStatus === "upcoming" && (
                      <div className="w-5 h-5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                          <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" 
                            fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 15.75h.007v.008H12v-.008z" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    {taskStatus === "past-due" && (
                      <div className="w-5 h-5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                          <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" 
                            fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 15.75h.007v.008H12v-.008z" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <span>{item.instruction}</span>
                  </div>
                </td>

                {Array.from({ length: maxRecords }, (_, recordIdx) => {
                  const record = item.records[recordIdx];

                  if (!record) {
                    return (
                      <td
                        key={recordIdx}
                        className="py-4 px-5 text-sm bg-slate-900/80 text-gray-500 border-r border-blue-900"
                      >
                        -
                      </td>
                    );
                  }

                  const isPending = !record.actualDate;
                  const recordKey = `${item.instruction}_${recordIdx}`;

                  // Calculate the next schedule date based on the most recent completed record
                  const nextDueDate = processMaintenanceHistory(item.records, item.instruction);

                  // Calculate displayDate - with proper handling for next schedule date
                  let displayDate;
                  if (isPending) {
                    // First check our local state for the most up-to-date value
                    if (localDates[recordKey]) {
                      displayDate = localDates[recordKey];
                    } else if (recordIdx > 0 && item.records.some(r => r.actualDate)) {
                      // If we have a next due date from a previous completion, use that
                      displayDate = nextDueDate || record.scheduledDate || "-";
                    } else {
                      // Otherwise use the standard scheduled date
                      displayDate = record.propertyScheduleDate || propertyScheduleDate || record.scheduledDate || "-";
                    }
                  } else {
                    displayDate = record.actualDate;
                  }

                  // Determine if this is a "next schedule" based on the presence of a completed record 
                  // AND if this record should be the next in sequence
                  const isNextSchedule = isPending && nextDueDate &&
                    // This record's date should match the calculated next due date
                    (record.scheduledDate === nextDueDate || !record.scheduledDate);

                  // Determine if this is the active next schedule record
                  const hasNextSchedule = isPending && isNextSchedule &&
                    // Only ONE record should be marked as the "next schedule" - the first pending one
                    !item.records.slice(0, recordIdx).some(r => !r.actualDate);

                  return (
                    <td
                      key={recordIdx}
                      className={`py-4 px-5 text-sm border-r ${isPending ? "bg-slate-800/90" : "bg-blue-950/90"
                        } text-gray-200 ${hasNextSchedule ? "border-l-2 border-l-emerald-700" : ""}`}
                    >
                      <div className="flex flex-col gap-2">
                        {isPending ? (
                          <>
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => setActiveInstructionForm(item.instructionIndex)}
                                className="text-xs bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded-md text-white font-medium shadow-sm transition-all duration-300 transform hover:scale-105 flex items-center gap-1 animate-pulse"
                              >
                                <span>Pending</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              {hasNextSchedule && (
                                <span className="text-xs bg-emerald-800/80 px-2 py-0.5 rounded-md text-emerald-100 font-medium shadow-sm">
                                  Next Schedule
                                </span>
                              )}
                            </div>
                            {isAdmin ? (
                              <input
                                type="date"
                                value={displayDate !== "-" ? displayDate : ""}
                                onChange={(e) =>
                                  recordIdx === 0
                                    ? handlePropertyScheduleDateChange(item.instructionIndex, recordIdx, e)
                                    : handleScheduledDateChange(item.instructionIndex, recordIdx, e)
                                }
                                className={`border border-blue-700 bg-blue-900/50 rounded-md p-1.5 cursor-pointer w-full text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${hasNextSchedule ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}`}
                              />
                            ) : (
                              <span className={`py-1 ${hasNextSchedule ? 'text-emerald-400 font-medium' : ''}`}>{displayDate}</span>
                            )}
                            {hasNextSchedule && (
                              <div className="text-xs text-emerald-400 mt-1">
                                Auto-calculated from last completion
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <h1 className="text-sm text-blue-300 font-medium">Scheduled: {record.scheduledDate}</h1>
                            <span className="text-xs bg-emerald-800/80 px-2 py-0.5 rounded-md text-emerald-100 font-medium shadow-sm inline-block w-fit">
                              Completed
                            </span>
                            <button
                              onClick={() => handleActualDateClick(item.instruction, record)}
                              className="text-blue-300 hover:text-blue-200 underline focus:outline-none text-left transition-colors duration-150 mt-1"
                            >
                              {displayDate}
                            </button>
                            {isAdmin ? ( (record.cost || record.Cost) && (
                              <span className="text-xs bg-green-800/80 px-2 py-0.5 rounded-md text-green-100 font-medium">
                                Cost: ₹{record.cost || record.Cost}
                              </span>
                            )) : (null)}
                            {/* Display next due date based on actual completion */}
                            <span className="text-xs bg-blue-800/80 px-2 py-0.5 rounded-md text-blue-100 font-medium mt-1">
                              Next Due: {getNextScheduleDate(item.instruction, displayDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {activeInstructionForm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-slate-800 to-blue-900 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{instructions[activeInstructionForm]}</h3>
              <button onClick={closeInstructionForm} className="text-gray-400 hover:text-white transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formInputs.notes}
                  onChange={handleFormInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-700 text-white"
                  rows="3"
                  placeholder="Add maintenance notes here..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Date</label>
                <input
                  name="Date"
                  value={formInputs.Date}
                  onChange={handleFormInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-700 text-white"
                  type="date"
                  placeholder="Add Date here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Cost</label>
                <input
                  name="Cost"
                  value={formInputs.Cost}
                  onChange={handleFormInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-700 text-white"
                  type="text"
                  placeholder="Add maintenance cost here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Upload Image</label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleFormInputChange}
                  className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />

                {formInputs.imagePreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-300 mb-1">Image Preview:</p>
                    <img
                      src={formInputs.imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full max-h-48 object-contain rounded-md border border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => handleFormSubmit(activeInstructionForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDetail && <DetailPopup detail={selectedDetail} onClose={closePopup} />}
    </div>
  );
}
function DetailPopup({ detail, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-slate-800 to-blue-900 rounded-lg max-w-lg w-full p-6 shadow-2xl border border-blue-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{detail.instruction}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <span className="block text-sm font-medium text-gray-200 mb-1">Scheduled Date</span>
            <p className="text-gray-100">{new Date(detail.ScheduledDate).toLocaleDateString()}</p>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-200 mb-1">Actual Date</span>
            <p className="text-gray-100">{detail.date}</p>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-200 mb-1">Cost</span>
            <p className="text-gray-100">₹{detail.Cost || "Not specified"}</p>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-200 mb-1">Notes</span>
            <p className="text-gray-100">{detail.notes}</p>
          </div>

          {detail.imageUrl && (
            <div>
              <span className="block text-sm font-medium text-gray-200 mb-1">Image</span>
              <img
                src={detail.imageUrl || "/placeholder.svg"}
                alt="Maintenance"
                className="w-full rounded-md border border-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}