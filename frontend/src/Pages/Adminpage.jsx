"use client"

import { useContext } from "react"
import { AdminContext } from "../Context/AdminContext"
import { Link } from "react-router-dom"
import { Building2, ClipboardList, LogOut, Settings, Users, Home } from "lucide-react"

const AdminPage = () => {
  const { logout } = useContext(AdminContext)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 border-l-4 border-blue-500 pl-4">Admin Controls</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create Property Card */}
            <Link to="/propertymaintain" className="group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group-hover:from-blue-600 group-hover:to-blue-800">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Create Property</h3>
                <p className="text-blue-100">Add new properties to your portfolio and manage their details</p>
              </div>
            </Link>

            {/* Property Management Card */}
            <Link to="#" className="group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group-hover:from-purple-600 group-hover:to-purple-800">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Manage Properties</h3>
                <p className="text-purple-100">View, edit, and delete existing properties in the system</p>
              </div>
            </Link>

            {/* User Management Card */}
            <Link to="#" className="group">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group-hover:from-emerald-600 group-hover:to-emerald-800">
                <div className="flex items-center justify-center w-16 h-16 mb-4 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
                <p className="text-emerald-100">Manage user accounts, permissions and access controls</p>
              </div>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-medium text-white/70 mb-2">Total Properties</h4>
              <p className="text-3xl font-bold text-white">24</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-medium text-white/70 mb-2">Active Maintenance</h4>
              <p className="text-3xl font-bold text-white">7</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-medium text-white/70 mb-2">Registered Users</h4>
              <p className="text-3xl font-bold text-white">156</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminPage
