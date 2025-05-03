import { useState, useRef, useEffect } from "react"
import { ImageIcon, Loader2, Plus, Trash2, MapPin, Home, AlertCircle, CheckCircle2, Calendar, Clock } from "lucide-react"
import axios from "axios"
import { useParams } from "react-router-dom"

const EditMaintenancePage = () => {
  const { propertyId } = useParams();

  // Default instructions list
  const defaultInstructions = [
    "AC Dry Servicing Houses_30",
    "AC Wet Servicing Houses_90",
    "Inverter Servicing Houses_180",
    "Washing Machine Servicing Houses_120",
    "Water Purifier Servicing Houses_90",
    "Geyser Servicing Houses_120",
    "Fridge Servicing Houses_120",
    "Gas Refill Servicing Houses_30",
    "Curtains Servicing Houses_30",
    "Wall paints/Wall Cracks/Seepage Servicing Houses_90",
    "Table Chair Sofa Servicing Houses_120",
    "Carpets Servicing Houses_60",
    "Polishing & Touch ups Servicing Houses_120",
    "Full House Deep clean Servicing Houses_90",
    "Pest Control Servicing Houses_120",
  ]

  // Form state
  const [formData, setFormData] = useState({
    propertyName: "",
    location: "",
    image: null,
    schedule_date: "",
    instructions: [...defaultInstructions],
  })

  // UI state
  const [imagePreview, setImagePreview] = useState(null)
  const [newInstruction, setNewInstruction] = useState("")
  const [instructionTime, setInstructionTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState({ type: null, message: "" })
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef(null)

  // Fetch property data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/property/maintain/${propertyId}`);
        const property = response.data.property;
        console.log("Property data fetched:", property);
        
        // Parse instructions if they're stored as a string
        let instructions = property.instructions;
        if (typeof instructions === 'string') {
          try {
            instructions = JSON.parse(instructions);
          } catch (e) {
            console.error("Error parsing instructions:", e);
            instructions = defaultInstructions;
          }
        }
        
        // Update form data with fetched property data
        setFormData({
          propertyName: property.propertyName || "",
          location: property.location || "",
          image: null, // We can't set the file object directly
          schedule_date: property.schedule_date ? new Date(property.schedule_date).toISOString().split('T')[0] : "",
          instructions: instructions || [...defaultInstructions],
        });
        
        // Set image preview if available
        if (property.imageUrl) {
          setImagePreview(property.imageUrl);
        }
      } catch (error) {
        console.error("Error fetching property data:", error.response?.data || error.message);
        setFormStatus({
          type: "error",
          message: "Failed to load property data. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    if (propertyId) {
      fetchData();
    }
  }, [propertyId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({
        ...formData,
        image: file,
      })

      // Create image preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle instruction changes
  const handleInstructionChange = (index, value) => {
    const updatedInstructions = [...formData.instructions]
    updatedInstructions[index] = value
    setFormData({
      ...formData,
      instructions: updatedInstructions,
    })
  }

  // Add new instruction with time
  const addInstruction = () => {
    if (newInstruction.trim()) {
      // Append the time value to the instruction with underscore
      const timeValue = instructionTime.trim() ? instructionTime : "0"
      const fullInstruction = `${newInstruction}_${timeValue}`
      
      setFormData({
        ...formData,
        instructions: [...formData.instructions, fullInstruction],
      })
      setNewInstruction("")
      setInstructionTime("")
    }
  }

  // Remove instruction
  const removeInstruction = (index) => {
    const updatedInstructions = formData.instructions.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      instructions: updatedInstructions,
    })
  }

  // Parse instruction string to extract name and time
  const parseInstruction = (instruction) => {
    const parts = instruction.split('_')
    // console.log("Parsed instruction:", parts)
    // console.log("Parsed instruction length:", parts.length)
    if (parts.length >= 2) {
      return {
        name: parts[0],
        time: parts[1]
      }
    }
    return {
      name: instruction,
      time: ""
    }
  }

  // Update instruction with new time
  const updateInstructionTime = (index, newTime) => {
    const updatedInstructions = [...formData.instructions]
    const instruction = updatedInstructions[index]
    const { name } = parseInstruction(instruction)
    updatedInstructions[index] = `${name}_${newTime}`
    
    setFormData({
      ...formData,
      instructions: updatedInstructions,
    })
  }

  // Handle form submission - now as a PUT request
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormStatus({ type: null, message: "" })
  
    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData()
  
      // Append text fields
      formDataToSend.append("propertyName", formData.propertyName)
      formDataToSend.append("location", formData.location)
      formDataToSend.append("schedule_date", formData.schedule_date)
  
      // Append file if it exists
      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }
  
      // Convert instructions array to JSON string
      formDataToSend.append("instructions", JSON.stringify(formData.instructions))
      console.log("Form data to send:", formData)
      console.log("Instructions data:", formData.instructions)

  
      // Log what's being sent (for debugging)
      console.log("Updating property data:", {
        propertyId,
        propertyName: formData.propertyName,
        location: formData.location,
        schedule_date: formData.schedule_date,
        imageExists: !!formData.image,
        instructionsCount: formData.instructions.length,
      })
  
      // Make PUT API call using Axios
      const response = await axios.put(
        `/api/property/update/maintanence/${propertyId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
  
      // Success message
      setFormStatus({
        type: "success",
        message: "Property updated successfully!",
      })
    } catch (error) {
      console.error("Error updating property:", error.response?.data || error.message)
      setFormStatus({
        type: "error",
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to update property. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form to the original fetched data
  const resetForm = async () => {
    if (confirm("Are you sure you want to reset the form?")) {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/property/maintain/${propertyId}`);
        const property = response.data.property;
        
        // Parse instructions if they're stored as a string
        let instructions = property.instructions;
        if (typeof instructions === 'string') {
          try {
            instructions = JSON.parse(instructions);
          } catch (e) {
            instructions = defaultInstructions;
          }
        }
        
        setFormData({
          propertyName: property.propertyName || "",
          location: property.location || "",
          image: null,
          schedule_date: property.schedule_date ? new Date(property.schedule_date).toISOString().split('T')[0] : "",
          instructions: instructions || [...defaultInstructions],
        });
        
        if (property.imageUrl) {
          setImagePreview(property.imageUrl);
        } else {
          setImagePreview(null);
        }
        
        setFormStatus({ type: null, message: "" });
      } catch (error) {
        console.error("Error resetting form:", error);
        setFormStatus({
          type: "error",
          message: "Failed to reset the form. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-slate-500 animate-spin mb-4" />
          <p className="text-slate-600">Loading property data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Home className="h-6 w-6" />
            Edit Property
          </div>
          <p className="text-slate-200 mt-1">Update property details and service instructions</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Status alerts */}
            {formStatus.type && (
              <div
                className={`p-4 rounded-md flex items-start gap-3 ${
                  formStatus.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {formStatus.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h4 className="font-medium">{formStatus.type === "success" ? "Success" : "Error"}</h4>
                  <p className="text-sm">{formStatus.message}</p>
                </div>
              </div>
            )}

            {/* Property details section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700">
                  Property Name
                </label>
                <input
                  id="propertyName"
                  name="propertyName"
                  value={formData.propertyName}
                  onChange={handleInputChange}
                  placeholder="Enter property name"
                  className="w-full h-12 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter property location"
                    className="w-full h-12 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="schedule_date" className="block text-sm font-medium text-gray-700">
                  Schedule a Date for this Property
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    id="schedule_date" 
                    name="schedule_date"
                    type="date"
                    value={formData.schedule_date}
                    onChange={handleInputChange}
                    className="w-full h-12 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Image upload section */}
            <div className="space-y-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Property Image
              </label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  id="image"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Property preview"
                      className="mx-auto max-h-64 rounded-md object-contain"
                    />
                    <p className="text-sm text-slate-500">Click to change image</p>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center">
                    <ImageIcon className="h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-slate-500">Click to upload property image</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG or GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Service Instructions</label>
                <span className="text-sm text-slate-500">{formData.instructions.length} items</span>
              </div>

              <div className="h-64 rounded-md border border-gray-300 p-4 overflow-y-auto">
                <div className="space-y-3">
                  {formData.instructions.map((instruction, index) => {
                    const { name, time } = parseInstruction(instruction)
                    {/* console.log("Parsed instruction:", name, time) */}
                    {/* console.log("Parsed instruction length:", name.length, time.length) */}
                    return (
                      <div key={index} className="flex gap-2">
                        <input
                          value={name}
                          onChange={(e) => handleInstructionChange(index, `${e.target.value}_${time}`)}
                          className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          placeholder="Service instruction"
                        />
                        <div className="relative sm:w-24">
                          <input
                            value={time}
                            onChange={(e) => updateInstructionTime(index, e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            placeholder="Time"
                            type="number"
                            min="0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInstruction(index)}
                          className="p-2 rounded-md border border-gray-300 hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  placeholder="Add new instruction"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  className="flex-1 px-3 py-2 h-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
                <div className="relative w-24">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    placeholder="Time"
                    value={instructionTime}
                    onChange={(e) => setInstructionTime(e.target.value)}
                    className="w-full px-3 pl-9 py-2 h-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    type="number"
                    min="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="flex items-center px-4 py-2 rounded-md border border-gray-300 hover:bg-slate-50 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md bg-slate-800 text-white min-w-[120px] ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-slate-700"
              } transition-colors`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update Property"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditMaintenancePage