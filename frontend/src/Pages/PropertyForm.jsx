import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { Plus, X, Upload, Building, Home, Users, Camera, CheckCircle, PlusCircle, Loader2 } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Propertyform() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    PlaceName: "",
    buildingName: "",
    buildingPic: null,
    propertyCount: 0,
    properties: [],
    staff: [],
  })
  const [roomImages, setRoomImages] = useState([])
  const [staffImages, setStaffImages] = useState([])

  const buildingPicRef = useRef(null)
  const controls = useAnimation()

  useEffect(() => {
    controls.start("visible")
  }, [controls])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "propertyCount" ? Number.parseInt(value) || 0 : value,
    })

    // If property count changes, initialize or trim properties array
    if (name === "propertyCount") {
      const count = Number.parseInt(value) || 0
      const newProperties = [...formData.properties]

      if (count > newProperties.length) {
        // Add new properties
        for (let i = newProperties.length; i < count; i++) {
          newProperties.push({ houseNumber: "", houseName: "", image: null })
        }
      } else if (count < newProperties.length) {
        // Remove excess properties
        newProperties.splice(count)
      }

      setFormData((prevData) => ({
        ...prevData,
        properties: newProperties,
      }))
    }
  }
  const handleAddProperty = () => {
    setFormData((prevData) => ({
      ...prevData,
      properties: [
        ...prevData.properties,
        { houseNumber: "", houseName: "", image: null }, // New property object
      ],
    }));
  };

  const handleBuildingPicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        buildingPic: e.target.files[0],
      })
    }
  }

  const handlePropertyChange = (index, field, value) => {
    const updatedProperties = [...formData.properties]
    updatedProperties[index] = {
      ...updatedProperties[index],
      [field]: value,
    }

    setFormData({
      ...formData,
      properties: updatedProperties,
    })
  }

  const handlePropertyImageChange = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      handlePropertyChange(index, "image", e.target.files[0])
    }
  }

  const addStaffMember = () => {
    setFormData({
      ...formData,
      staff: [...formData.staff, { name: "", profileImg: null }],
    })
  }

  const removeStaffMember = (index) => {
    const updatedStaff = [...formData.staff]
    updatedStaff.splice(index, 1)

    setFormData({
      ...formData,
      staff: updatedStaff,
    })
  }

  const handleStaffChange = (index, field, value) => {
    const updatedStaff = [...formData.staff]
    updatedStaff[index] = {
      ...updatedStaff[index],
      [field]: value,
    }

    setFormData({
      ...formData,
      staff: updatedStaff,
    })
  }

  const handleStaffImageChange = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      handleStaffChange(index, "profileImg", e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append("propertyName", formData.PlaceName);
    submitData.append("buildingName", formData.buildingName);

    if (formData.buildingPic) {
      submitData.append("buildingPic", formData.buildingPic);
    }

    submitData.append("propertyCount", formData.propertyCount);
    submitData.append("properties", JSON.stringify(formData.properties));
    submitData.append("staff", JSON.stringify(formData.staff));

    formData.properties.forEach((property) => {
      if (property.image) {
        submitData.append("propertyImages", property.image);
      }
    });

    formData.staff.forEach((staffMember) => {
      if (staffMember.profileImg) {
        submitData.append("staffImages", staffMember.profileImg);
      }
    });

    try {
      const response = await axios.post("/api/property/create", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  const buttonVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.95 },
  }

  const propertyCardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  }

  const staffCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
    hover: {
      y: -5,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="bg-white rounded-xl p-8 shadow-2xl relative z-10 max-w-md w-full"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
            >
              <div className="text-center">
                <motion.div
                  className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", duration: 0.8 }}
                >
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </motion.div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Successfully Submitted!</h3>
                <p className="mt-2 text-gray-500">Your property information has been successfully saved.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/')}
                  className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Home
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="max-w-4xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div className="text-center mb-10" variants={itemVariants}>
          <motion.h1
            className="text-4xl font-bold text-blue-900 mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            Property Management
          </motion.h1>
          <motion.p
            className="text-blue-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Add and manage your properties with ease
          </motion.p>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-xl overflow-hidden" variants={itemVariants} layout>
          <div className="px-6 py-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Main Property Information */}
              <motion.div className="space-y-8" variants={itemVariants}>
                <motion.div
                  className="flex items-center space-x-3 pb-4 border-b border-blue-100"
                  variants={fadeInVariants}
                >
                  <Building className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-blue-900">Main Property Information</h3>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    className="space-y-2"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <label htmlFor="PlaceName" className="block text-sm font-medium text-blue-900 mb-1">
                      Property Location / Area Name
                    </label>
                    <input
                      type="text"
                      id="PlaceName"
                      name="PlaceName"
                      value={formData.PlaceName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter property name"
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <label htmlFor="buildingName" className="block text-sm font-medium text-blue-900 mb-1">
                      Building Name
                    </label>
                    <input
                      type="text"
                      id="buildingName"
                      name="buildingName"
                      value={formData.buildingName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter building name"
                      required
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label className="block text-sm font-medium text-blue-900 mb-1">Building Picture</label>
                    <motion.div
                      className="relative border-2 border-dashed border-blue-200 rounded-lg p-6 flex flex-col justify-center items-center cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => buildingPicRef.current.click()}
                      whileHover={{ scale: 1.02, borderColor: "#3B82F6" }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <input
                        type="file"
                        ref={buildingPicRef}
                        onChange={handleBuildingPicChange}
                        className="hidden"
                        accept="image/*"
                      />

                      {formData.buildingPic ? (
                        <motion.div
                          className="text-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                          <div className="relative inline-block">
                            <motion.img
                              src={URL.createObjectURL(formData.buildingPic) || "/placeholder.svg"}
                              alt="Building preview"
                              className="h-40 w-auto object-cover rounded-lg mb-2"
                              initial={{ filter: "blur(10px)" }}
                              animate={{ filter: "blur(0px)" }}
                              transition={{ duration: 0.5 }}
                            />
                            <motion.div
                              className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.2 }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </motion.div>
                          </div>
                          <p className="text-sm text-blue-600 font-medium mt-2">{formData.buildingPic.name}</p>
                          <p className="text-xs text-blue-400">Click to change</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          className="text-center"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, repeatType: "reverse" }}
                        >
                          <div className="bg-blue-100 rounded-full p-4 mb-4 inline-block">
                            <Camera className="h-8 w-8 text-blue-600" />
                          </div>
                          <p className="text-blue-600 font-medium">Upload Building Picture</p>
                          <p className="text-xs text-blue-400 mt-1">Click to browse files</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="propertyCount" className="block text-sm font-medium text-blue-900 mb-1">
                      Number of Properties
                    </label>
                    <div className="relative">
                      <motion.input
                        type="number"
                        id="propertyCount"
                        name="propertyCount"
                        min="0"
                        value={formData.propertyCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="How many properties?"
                        whileHover={{ scale: 1.01 }}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Home className="h-5 w-5 text-blue-400" />
                      </div>
                    </div>
                    <motion.p
                      className="text-xs text-blue-500 mt-1"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                    >
                      This will generate {formData.propertyCount} property{" "}
                      {formData.propertyCount === 1 ? "form" : "forms"} below
                    </motion.p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Property Details */}
              {formData.propertyCount > 0 && (
                <motion.div
                  className="space-y-8"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  layout
                >
                  <motion.div
                    className="flex items-center space-x-3 pb-4 border-b border-blue-100"
                    variants={fadeInVariants}
                  >
                    <Home className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-blue-900">Property Details</h3>
                  </motion.div>

                  <motion.div className="grid grid-cols-1 gap-6" variants={containerVariants}>
                    <AnimatePresence>
                      {formData.properties.map((property, index) => (
                        <motion.div
                          key={index}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={propertyCardVariants}
                          custom={index}
                          layout
                          className="p-6 border border-blue-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                          whileHover={{ y: -5 }}
                        >
                          <motion.div className="flex items-center justify-between mb-4" variants={fadeInVariants}>
                            <h4 className="font-semibold text-blue-800 flex items-center">
                              <motion.span
                                className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-2"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                {index + 1}
                              </motion.span>
                              Property #{index + 1}
                            </h4>
                          </motion.div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* House Number */}
                            <motion.div className="space-y-2" variants={itemVariants}>
                              <label className="block text-sm font-medium text-blue-900 mb-1">House Number</label>
                              <input
                                type="text"
                                value={property.houseNumber}
                                onChange={(e) => handlePropertyChange(index, "houseNumber", e.target.value)}
                                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Enter house number"
                              />
                            </motion.div>

                            {/* House Name */}
                            <motion.div className="space-y-2" variants={itemVariants}>
                              <label className="block text-sm font-medium text-blue-900 mb-1">House Name</label>
                              <input
                                type="text"
                                value={property.houseName}
                                onChange={(e) => handlePropertyChange(index, "houseName", e.target.value)}
                                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Enter house name"
                              />
                            </motion.div>

                            {/* House Image */}
                            <motion.div className="space-y-2" variants={itemVariants}>
                              <label className="block text-sm font-medium text-blue-900 mb-1">House Image</label>
                              <motion.div
                                className="relative border-2 border-dashed border-blue-200 rounded-lg p-3 flex justify-center items-center cursor-pointer hover:bg-blue-50 transition-colors duration-200 h-[70px]"
                                onClick={() => document.getElementById(`property-image-${index}`).click()}
                                whileHover={{ scale: 1.02, borderColor: "#3B82F6" }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                              >
                                <input
                                  type="file"
                                  id={`property-image-${index}`}
                                  onChange={(e) => handlePropertyImageChange(index, e)}
                                  className="hidden"
                                  accept="image/*"
                                />

                                {property.image ? (
                                  <motion.div
                                    className="text-center flex items-center space-x-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <motion.img
                                      src={URL.createObjectURL(property.image) || "/placeholder.svg"}
                                      alt="House preview"
                                      className="h-12 w-12 object-cover rounded-md"
                                      initial={{ filter: "blur(5px)" }}
                                      animate={{ filter: "blur(0px)" }}
                                      transition={{ duration: 0.3 }}
                                    />
                                    <div>
                                      <p className="text-xs text-blue-600 font-medium text-left">
                                        {property.image.name.length > 15
                                          ? property.image.name.substring(0, 15) + "..."
                                          : property.image.name}
                                      </p>
                                      <p className="text-xs text-blue-400 text-left">Click to change</p>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    className="text-center"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{
                                      repeat: Number.POSITIVE_INFINITY,
                                      duration: 2,
                                      repeatType: "reverse",
                                    }}
                                  >
                                    <Upload className="mx-auto h-6 w-6 text-blue-400" />
                                    <p className="text-xs text-blue-500 mt-1">Upload image</p>
                                  </motion.div>
                                )}
                              </motion.div>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* ADD BUTTON - Click to Add New Property */}
                  <motion.button
                    type="button"
                    onClick={handleAddProperty}
                    className="w-full flex justify-center items-center py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add New Property
                  </motion.button>
                </motion.div>
              )}

              {/* Staff Information */}
              <motion.div className="space-y-8" variants={containerVariants} layout>
                <motion.div
                  className="flex items-center justify-between pb-4 border-b border-blue-100"
                  variants={fadeInVariants}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-blue-900">Staff Information</h3>
                  </div>
                  <motion.button
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onClick={addStaffMember}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Staff
                  </motion.button>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  layout
                >
                  <AnimatePresence>
                    {formData.staff.map((staffMember, index) => (
                      <motion.div
                        key={index}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover="hover"
                        variants={staffCardVariants}
                        custom={index}
                        layout
                        className="p-5 border border-blue-100 rounded-xl bg-white shadow-sm relative group"
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.1}
                      >
                        <motion.div
                          className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-white hover:bg-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                          whileHover={{ scale: 1.1, backgroundColor: "#EF4444" }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.button
                            type="button"
                            onClick={() => removeStaffMember(index)}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </motion.div>

                        <motion.div className="space-y-4" variants={itemVariants}>
                          <motion.div
                            className="relative mx-auto w-20 h-20 rounded-full overflow-hidden border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition-all duration-200"
                            onClick={() => document.getElementById(`staff-image-${index}`).click()}
                            whileHover={{ scale: 1.05, borderColor: "#3B82F6" }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <input
                              type="file"
                              id={`staff-image-${index}`}
                              onChange={(e) => handleStaffImageChange(index, e)}
                              className="hidden"
                              accept="image/*"
                            />

                            {staffMember.profileImg ? (
                              <motion.img
                                src={URL.createObjectURL(staffMember.profileImg) || "/placeholder.svg"}
                                alt="Staff preview"
                                className="w-full h-full object-cover"
                                initial={{ filter: "blur(10px)" }}
                                animate={{ filter: "blur(0px)" }}
                                transition={{ duration: 0.5 }}
                              />
                            ) : (
                              <motion.div
                                className="w-full h-full bg-blue-100 flex items-center justify-center"
                                animate={{
                                  backgroundColor: ["#DBEAFE", "#EFF6FF", "#DBEAFE"],
                                }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                              >
                                <Camera className="h-8 w-8 text-blue-400" />
                              </motion.div>
                            )}
                          </motion.div>

                          <motion.div className="space-y-2" variants={itemVariants}>
                            <label className="block text-sm font-medium text-blue-900 mb-1 text-center">
                              Staff Name
                            </label>
                            <motion.input
                              type="text"
                              value={staffMember.name}
                              onChange={(e) => handleStaffChange(index, "name", e.target.value)}
                              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-center"
                              placeholder="Enter name"
                              whileHover={{ scale: 1.02 }}
                              whileFocus={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            />
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {formData.staff.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full p-8 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center text-center"
                      variants={fadeInVariants}
                    >
                      <motion.div
                        className="bg-blue-100 rounded-full p-3 mb-3"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, 0, -5, 0],
                        }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                      >
                        <Users className="h-6 w-6 text-blue-500" />
                      </motion.div>
                      <motion.p
                        className="text-blue-800 font-medium"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                      >
                        No staff members added yet
                      </motion.p>
                      <motion.p
                        className="text-blue-500 text-sm mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        Click the "Add Staff" button to add staff members
                      </motion.p>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>

              {/* Submit Button */}
              <motion.div className="pt-6" variants={itemVariants}>
                <motion.button
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </motion.div>
                  ) : (
                    "Submit Property Information"
                  )}
                </motion.button>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-red-600 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}