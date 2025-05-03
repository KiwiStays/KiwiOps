import { useState } from "react"

export default function InstructionList({ instructions, onUpdate }) {
  const [activeInstruction, setActiveInstruction] = useState(null)
  const [notes, setNotes] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  const handleInstructionClick = (index) => {
    setActiveInstruction(index === activeInstruction ? null : index)
    setNotes("")
    setImageFile(null)
    setImagePreview("")
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdate = () => {
    if (activeInstruction !== null) {
      // In a real app, you would upload the image to a server here
      // For this example, we'll just use the image preview URL
      onUpdate(activeInstruction, notes, imagePreview)
      setNotes("")
      setImageFile(null)
      setImagePreview("")
      setActiveInstruction(null)
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Maintenance Instructions</h2>
      <div className="space-y-3">
        {instructions.map((instruction, index) => (
          <div key={index} className="border rounded-lg overflow-hidden bg-white">
            <div
              className={`p-3 cursor-pointer flex justify-between items-center ${
                activeInstruction === index ? "bg-blue-50 border-b" : ""
              }`}
              onClick={() => handleInstructionClick(index)}
            >
              <span className="font-medium">{instruction}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform ${activeInstruction === index ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {activeInstruction === index && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Add maintenance notes here..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
