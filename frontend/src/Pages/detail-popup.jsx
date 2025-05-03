export default function DetailPopup({ detail, onClose }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">{detail.instruction}</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
          </div>
  
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500">Date Completed</p>
              <p>{detail.date}</p>
            </div>
  
            {detail.notes && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="whitespace-pre-wrap">{detail.notes}</p>
              </div>
            )}
  
            {detail.imageUrl && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Image</p>
                <img src={detail.imageUrl || "/placeholder.svg"} alt="Maintenance record" className="w-full rounded-lg" />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  