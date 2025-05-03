import { useState, useEffect } from 'react'
import { format, addMonths, isPast, parseISO, addDays, isWithinInterval } from 'date-fns'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

// List of maintenance tasks
const maintenanceTasks = [
  'AC Dry Servicing Houses',
  'AC Wet Servicing Houses',
  'Inverter Servicing Houses',
  'Washing Machine Servicing Houses',
  'Water Purifier Servicing Houses',
  'Geyser Servicing Houses',
  'Fridge Servicing Houses',
  'Gas Refill Servicing Houses',
  'Curtains Servicing Houses',
  'Wall paints/Wall Cracks/Seepage Servicing Houses',
  'Table Chair Sofa Servicing Houses',
  'Carpets Servicing Houses',
  'Polishing & Touch ups Servicing Houses',
  'Full House Deep clean Servicing Houses',
  'Pest Control Servicing Houses'
]

function App() {
  // Initialize state for checklist data
  const [checklistData, setChecklistData] = useState(
    maintenanceTasks.map(task => ({
      task,
      image: null,
      description: '',
      timestamp: null,
      scheduledDate: '2025-06-01',
      actualDate: '',
      nextScheduledDate: '',
      isUpdated: false,
      isEditing: false // New state for date editing
    }))
  )

  // State management for various UI components
  const [tableData, setTableData] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState({
    pastDue: 0,
    completed: 0,
    upcoming: 0
  })

  // Calculate task statistics based on dates
  useEffect(() => {
    const today = new Date()
    const thirtyDaysFromNow = addDays(today, 30)
    const newStats = {
      pastDue: 0,
      completed: 0,
      upcoming: 0
    }

    checklistData.forEach(item => {
      if (item.actualDate) {
        newStats.completed++
      } else if (isPast(parseISO(item.scheduledDate))) {
        newStats.pastDue++
      } else if (isWithinInterval(parseISO(item.scheduledDate), { start: today, end: thirtyDaysFromNow })) {
        newStats.upcoming++
      }
    })

    setStats(newStats)
  }, [checklistData])

  // Handle image upload and update dates
  const handleImageUpload = (index, event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newData = [...checklistData]
        const today = new Date()
        const nextDate = addMonths(today, 6)

        newData[index] = {
          ...newData[index],
          image: reader.result,
          actualDate: format(today, 'yyyy-MM-dd'),
          nextScheduledDate: format(nextDate, 'yyyy-MM-dd'),
          isUpdated: false
        }
        setChecklistData(newData)
        console.log('Image Upload:', {
          task: newData[index].task,
          actualDate: newData[index].actualDate,
          nextScheduledDate: newData[index].nextScheduledDate,
          hasImage: true
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle description updates
  const handleDescriptionChange = (index, value) => {
    const newData = [...checklistData]
    newData[index] = {
      ...newData[index],
      description: value,
      isUpdated: false
    }
    setChecklistData(newData)
  }

  // Handle scheduled date updates
  const handleDateChange = (index, date) => {
    const newData = [...checklistData]
    newData[index] = {
      ...newData[index],
      scheduledDate: format(date, 'yyyy-MM-dd'),
      isEditing: false
    }
    setChecklistData(newData)
  }

  // Toggle date editing mode
  const toggleDateEdit = (index) => {
    const newData = [...checklistData]
    newData[index] = {
      ...newData[index],
      isEditing: !newData[index].isEditing
    }
    setChecklistData(newData)
  }

  // Handle item updates
  const handleItemUpdate = (index) => {
    const newData = [...checklistData]
    newData[index] = {
      ...newData[index],
      isUpdated: true
    }
    setChecklistData(newData)
    setTableData(prev => [...prev, newData[index]])
    console.log('Item Updated:', {
      task: newData[index].task,
      actualDate: newData[index].actualDate,
      nextScheduledDate: newData[index].nextScheduledDate,
      description: newData[index].description
    })
  }

  // Handle saving all changes
  const handleSaveAll = async () => {
    setIsSaving(true)
    console.log('Starting to save all changes...')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('Successfully saved:', {
        totalItems: checklistData.length,
        updatedItems: checklistData.filter(item => item.isUpdated).length,
        timestamp: new Date().toISOString(),
        data: checklistData
      })
    } catch (error) {
      console.error('Error saving data:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cell click for modal
  const handleCellClick = (item, field) => {
    setSelectedCell({ item, field })
  }

  // Get row color based on task status
  const getRowColor = (item) => {
    if (item.actualDate) return 'bg-green-50 hover:bg-green-100'
    if (isPast(parseISO(item.scheduledDate))) return 'bg-red-50 hover:bg-red-100'
    if (isWithinInterval(parseISO(item.scheduledDate), {
      start: new Date(),
      end: addDays(new Date(), 30)
    })) return 'bg-yellow-50 hover:bg-yellow-100'
    return 'hover:bg-gray-50'
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 text-sm font-medium">Past Due</h3>
            <p className="mt-2 text-red-900 text-3xl font-semibold">{stats.pastDue}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 text-sm font-medium">Completed</h3>
            <p className="mt-2 text-green-900 text-3xl font-semibold">{stats.completed}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-yellow-800 text-sm font-medium">Due Soon</h3>
            <p className="mt-2 text-yellow-900 text-3xl font-semibold">{stats.upcoming}</p>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Room A202
          </h1>
          
          <div className="space-y-4">
            {checklistData.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-[#f0fdf4] rounded-lg border border-[#86efac]">
                <div className="w-1/4">
                  <h3 className="text-sm font-medium text-gray-700">{item.task}</h3>
                </div>
                
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e)}
                      className="hidden"
                      id={`file-${index}`}
                    />
                    <label 
                      htmlFor={`file-${index}`}
                      className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-[#86efac] hover:bg-[#6ee7b7] transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </label>
                    {item.image && (
                      <div className="absolute top-0 -right-2 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                  </div>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    placeholder="Add notes..."
                    className="flex-1 text-sm border-0 bg-transparent focus:ring-0 placeholder-gray-400"
                  />

                  <button
                    onClick={() => handleItemUpdate(index)}
                    disabled={item.isUpdated}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      item.isUpdated 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#86efac] text-gray-700 hover:bg-[#6ee7b7]'
                    }`}
                  >
                    {item.isUpdated ? 'Updated' : 'Update'}
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save All Changes'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance Summary Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Maintenance Summary</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Scheduled Date</th>
                  {/* Show these columns only if there's at least one item with actual date */}
                  {checklistData.some(item => item.actualDate) && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actual Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Next Schedule</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {checklistData.map((item, index) => (
                  <tr key={index} className={getRowColor(item)}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.task}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.isEditing ? (
                        <DatePicker
                          selected={parseISO(item.scheduledDate)}
                          onChange={(date) => handleDateChange(index, date)}
                          dateFormat="yyyy-MM-dd"
                          className="w-32 px-2 py-1 border rounded"
                        />
                      ) : (
                        <button
                          onClick={() => toggleDateEdit(index)}
                          className="hover:text-blue-600"
                        >
                          {item.scheduledDate}
                        </button>
                      )}
                    </td>
                    {/* Show these columns only if there's at least one item with actual date */}
                    {checklistData.some(item => item.actualDate) && (
                      <>
                        <td 
                          className="px-4 py-3 text-sm text-gray-600 cursor-pointer"
                          onClick={() => handleCellClick(item, 'actual')}
                        >
                          {item.actualDate}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.nextScheduledDate}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for viewing details */}
        {selectedCell && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCell.item.task}
                </h3>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedCell.item.image && selectedCell.field === 'actual' && (
                  <img 
                    src={selectedCell.item.image} 
                    alt="Task" 
                    className="w-full h-64 object-cover rounded-lg" 
                  />
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Scheduled Date</p>
                    <p className="mt-1">{selectedCell.item.scheduledDate}</p>
                  </div>
                  {selectedCell.item.actualDate && (
                    <div>
                      <p className="font-medium text-gray-500">Actual Date</p>
                      <p className="mt-1">{selectedCell.item.actualDate}</p>
                    </div>
                  )}
                  {selectedCell.item.nextScheduledDate && (
                    <div>
                      <p className="font-medium text-gray-500">Next Scheduled Date</p>
                      <p className="mt-1">{selectedCell.item.nextScheduledDate}</p>
                    </div>
                  )}
                </div>

                {selectedCell.item.description && (
                  <div>
                    <p className="font-medium text-gray-500">Notes</p>
                    <p className="mt-1 text-gray-600">{selectedCell.item.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App