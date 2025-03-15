
import axios from "axios"

import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useState, useRef } from "react"
import { Mic, Clock, Save, Loader2 } from "lucide-react"
import AudioPlayer from "react-h5-audio-player"
import "react-h5-audio-player/lib/styles.css"

const checklistItems = [
  {
    id: 1,
    name: "Mopping & Floor Cleaning",
    image: "https://koparoclean.com/cdn/shop/articles/disinfecting-home_1200x1200.jpg?v=1719811412",
  },
  {
    id: 2,
    name: "Fresh Bedding Setup",
    image: "https://tii.imgix.net/production/articles/3466/abf5c4bd-cab8-415b-a4c5-40bb4ec2fdaf.jpg?auto=compress&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Extra Bedding Arranged",
    image: "https://images.squarespace-cdn.com/content/v1/534bbd08e4b0b891fcd7f20a/1422249973785-3VWAJB7D32XC8XZX12P0/small-linen-cupboard.jpg",
  },
  {
    id: 4,
    name: "Towels Placed",
    image: "https://raencomills.com/wp-content/uploads/2020/07/33aa.jpg",
  },
  {
    id: 5,
    name: "Bathroom Cleaning Completed",
    image: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI2MDkxNTQ1ODMwMjk1OTkzOA%3D%3D/original/876fd3b0-80b5-4fdb-a5c5-ed467e3551fd.jpeg?im_w=1440",
  },
  {
    id: 6,
    name: "Shampoo & Body Wash Refilled",
    image: "https://image.made-in-china.com/202f0j00ZeBbmaltERqs/Non-Disposable-Bath-Set-Custom-Shampoo-and-Conditioner-Hotel-Toiletries-Packaging-Hotel-Room-Amenities.webp",
  },
  {
    id: 7,
    name: "Hand Wash Refilled",
    image: "https://5.imimg.com/data5/TL/AX/IK/SELLER-91740757/liquid-hand-wash-500x500.jpg",
  },
  {
    id: 8,
    name: "TV & AC Remote Placed and Working",
    image: "https://img.freepik.com/premium-photo/two-remotes-from-tv-tv-tuner-yellow_164357-5167.jpg",
  },
  {
    id: 9,
    name: "Hair Dryer Available",
    image: "https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/1/2/1200x1200_havels_day10655_copy.jpg",
  },
  {
    id: 10,
    name: "Iron Available",
    image: "https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/g/h/ghgdicsg100.jpg",
  },
  {
    id: 11,
    name: "4 Water Glasses Provided",
    image: "https://assets.ajio.com/medias/sys_master/root/20231017/l8CY/652e7e54afa4cf41f54a239b/-473Wx593H-469546784-transparent-MODEL.jpg",
  },
  {
    id: 12,
    name: "4 Wine Glasses Provided",
    image: "https://www.mikasa.com/cdn/shop/products/napoli-set-of-4-wine-glasses_5136540_1.jpg?v=1607435208",
  },
  {
    id: 13,
    name: "4 Beer Glasses Provided",
    image: "https://rukminim2.flixcart.com/image/850/1000/kdakakw0/glass/n/w/w/beer-400-ml-beer-juice-clear-set-of-4-glass-mug-400-ml-pack-of-original-imafu7hckmxuznj9.jpeg?q=90&crop=false",
  },
  {
    id: 14,
    name: "Water Purifier Switched On & Filled",
    image: "https://havells.com/media/catalog/product/cache/844a913d283fe95e56e39582c5f2767b/g/h/ghwuaus030.jpg",
  },
  {
    id: 15,
    name: "Washing Machine Empty & Clean",
    image: "https://t3.ftcdn.net/jpg/03/07/20/90/360_F_307209015_NBNPCNEyB7VNLSMCUNzYhR9YIhoneY6r.jpg",
  },
  {
    id: 16,
    name: "Sugar, Tea, and Coffee Stocked",
    image: "https://www.nestroots.com/cdn/shop/products/Woodenjarsforkeepingspicesmasalaforkitchenwithlidcanisterforhomekitchenwithlidmouthfreshnerjarsboxfordiningtable_d9ff1de6-703c-4433-aa25-40928dd6a141.jpg?v=1733900104",
  },
];

const RoomChecklist = () => {
  const { id } = useParams()
  const [roomData, setRoomData] = useState({
    active: true,
    buildingId: "67c9e80392862aada562affc",
    checklist: [],
    createdAt: "2025-03-06T18:22:59.363Z",
    roomImage:
      "https://res.cloudinary.com/dghy5vp6u/image/upload/v1741285375/property_images/e958b4ad-bbe1-4351-b8c0-ef6027c1c095-ecdfe6d7-72e2-4bdd-b3d7-3bf72be92ff2.jpg",
    roomName: "Candy Shop",
    roomNum: "101",
    updatedAt: "2025-03-06T18:22:59.363Z",
    staff: [],
    staffwhoupdated: "",
  })
  useEffect(() => {
    try {
      axios
        .get(`/api/property/roominfo/${id}`)
        .then((response) => {
          console.log(response.data)
          setRoomData(response.data.room)
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log(error)
    }
  }, [])

  const [notes, setNotes] = useState("")
  const [recording, setRecording] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Refs for recording
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const toggleItem = (itemName) => {
    setRoomData((prev) => {
      const newChecklist = prev.checklist.includes(itemName)
        ? prev.checklist.filter((item) => item !== itemName)
        : [...prev.checklist, itemName]

      console.log("Checklist updated:", newChecklist)
      return {
        ...prev,
        checklist: newChecklist,
      }
    })
  }

  const getChecklistStatus = () => {
    const totalItems = checklistItems.length
    const checkedItems = roomData.checklist.length

    if (checkedItems === 0) return "Not Ready"
    if (checkedItems === totalItems) return "Ready"
    return "Attention Required"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-800 border-green-300"
      case "Not Ready":
        return "bg-red-100 text-red-800 border-red-300"
      case "Attention Required":
        return "bg-amber-100 text-amber-800 border-amber-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getMissingItems = () => {
    if (getChecklistStatus() !== "Attention Required") return []
    return checklistItems.filter((item) => !roomData.checklist.includes(item.name)).map((item) => item.name)
  }

  const toggleActive = () => {
    setRoomData((prev) => {
      const newActive = !prev.active
      console.log("Room status updated:", newActive ? "Active" : "Inactive")
      return {
        ...prev,
        active: newActive,
      }
    })
  }

  // const ToggleStaff = (profileImg, name) => {
  //   console.log("Staff updated:", `${name} - ${profileImg}`) // ✅ Log before updating state

  //   setRoomData((prevData) => ({
  //     ...prevData,
  //     staffwhoupdated: `${name} - ${profileImg}`,
  //   }))
  // }

  const ToggleStaff = (profileImg, name) => {
    setRoomData(prev => ({
      ...prev,
      staffwhoupdated: `${name} - ${profileImg}`
    }));
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create FormData object for sending files
      const formData = new FormData();

      // Append all room data to FormData
      formData.append("active", roomData.active?.toString());
      formData.append("roomNum", roomData.roomNum);
      formData.append("roomName", roomData.roomName);
      formData.append("roomImage", roomData.roomImage);
      formData.append("checklist", JSON.stringify(roomData.checklist));
      formData.append("staff", JSON.stringify(roomData.staff));
      formData.append("staffWhoUpdated", roomData.staffwhoupdated);
      formData.append("notes", notes);
      formData.append("allChecklistItems", JSON.stringify(checklistItems.map(item => item.name)));

      // If there is a new voice recording, convert the Blob URL to a File
      if (audioURL && audioURL.startsWith('blob:')) {
        try {
          const response = await fetch(audioURL);
          const blob = await response.blob();
          const audioFile = new File([blob], `voice-note-${Date.now()}.wav`, { type: 'audio/wav' });
          formData.append("voiceNote", audioFile);
        } catch (error) {
          console.error("Error converting audio blob to file:", error);
        }
      }

      console.log("Submitting Data:", Object.fromEntries(formData));

      // Send request to API
      const response = await axios.post(`/api/property/rooms/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update the audio URL with the one from the server if available
      if (response.data.voiceNoteUrl) {
        setAudioURL(response.data.voiceNoteUrl);
      }

      alert("Data submitted successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("❌ Error submitting data:", error);
      alert("Error submitting data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
    
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)

        // Clean up the stream
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Error accessing microphone. Please ensure you have granted microphone permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const toggleRecording = () => {
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }
  

  

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-48 md:h-64">
            <img
              src={roomData.roomImage || "/placeholder.svg"}
              alt={roomData.roomName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold">{roomData.roomName}</h1>
                <p className="text-lg">Room {roomData.roomNum}</p>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Last updated: {formatDate(roomData.updatedAt)}</span>
            </div>

            {/* Status Summary */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${getStatusColor(getChecklistStatus())}`}
              >
                {getChecklistStatus()}
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Room Checklist Status</h2>
              <p className="text-gray-600">
                {getChecklistStatus() === "Ready"
                  ? "All items are ready for the guest."
                  : getChecklistStatus() === "Not Ready"
                    ? "No items have been prepared yet."
                    : `${roomData.checklist.length} of ${checklistItems.length} items are ready.`}
              </p>
            </div>
            <div
              className={`px-6 py-3 rounded-lg text-base font-medium border-2 ${getStatusColor(getChecklistStatus())}`}
            >
              {getChecklistStatus()}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getChecklistStatus() === "Ready"
                    ? "bg-green-500"
                    : getChecklistStatus() === "Not Ready"
                      ? "bg-red-500"
                      : "bg-amber-500"
                  }`}
                style={{ width: `${(roomData.checklist.length / checklistItems.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <h2 className="col-span-full text-xl font-semibold mb-2">Room Checklist</h2>
          {checklistItems.map((item) => {
            const isChecked = roomData.checklist.includes(item.name)

            return (
              <div key={item.id} onClick={() => toggleItem(item.name)} className="relative cursor-pointer group">
                <div
                  className={`aspect-square rounded-xl border-2 overflow-hidden transition-all
                  ${isChecked ? "border-green-500 shadow-md" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-all ${isChecked ? "" : "group-hover:opacity-80"}`}
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200
                    ${isChecked ? "bg-green-500 bg-opacity-40" : "bg-black bg-opacity-0 group-hover:bg-opacity-20"}`}
                  >
                    {isChecked && (
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                  <div className={`w-3 h-3 rounded-full ${isChecked ? "bg-green-500" : "bg-gray-300"}`}></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Missing Items Section (for Attention Required state) */}
        {getChecklistStatus() === "Attention Required" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <h3 className="text-amber-800 font-medium mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Attention Required
            </h3>
            <p className="text-amber-700 text-sm mb-2">The following items need attention:</p>
            <ul className="list-disc list-inside text-sm text-amber-700">
              {getMissingItems().map((item) => (
                <li key={item} className="mb-1">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes & Voice Notes Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Notes Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes here..."
              className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Voice Notes Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Voice Notes</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={toggleRecording}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${recording ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                <Mic className="w-5 h-5" />
                {recording ? "Stop Recording" : "Start Recording"}
              </button>

              {audioURL && (
                <div className="mt-4">
                  <AudioPlayer
                    src={audioURL}
                    showJumpControls={false}
                    customControlsSection={["MAIN_CONTROLS", "VOLUME_CONTROLS"]}
                    customProgressBarSection={["PROGRESS_BAR", "CURRENT_TIME"]}
                    autoPlayAfterSrcChange={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Enhanced Staff Section */}
        {roomData.staff.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Staff Assignment</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {roomData.staff.map((staff) => {
                const isSelected = roomData.staffwhoupdated === `${staff.name} - ${staff.profileImg}`;
                return (
                  <div
                    key={staff.name}
                    onClick={() => ToggleStaff(staff.profileImg, staff.name)}
                    className={`group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-105' : 'hover:scale-105'
                      }`}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className={`relative ${isSelected ? 'animate-pulse' : ''}`}>
                        <div
                          className={`w-20 h-20 rounded-full overflow-hidden border-4 transition-all duration-300 ${isSelected
                              ? 'border-blue-500 shadow-lg shadow-blue-200'
                              : 'border-gray-200 group-hover:border-blue-300'
                            }`}
                        >
                          <img
                            src={staff.profileImg || "/placeholder.svg"}
                            alt={staff.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p
                        className={`mt-3 text-sm font-medium transition-colors duration-300 ${isSelected ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-500'
                          }`}
                      >
                        {staff.name}
                      </p>
                      <div
                        className={`mt-1 px-3 py-1 rounded-full text-xs transition-all duration-300 ${isSelected
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}
                      >
                        {isSelected ? 'Assigned' : 'Click to assign'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Button with Loading State */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300
            ${isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200'
              }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomChecklist

