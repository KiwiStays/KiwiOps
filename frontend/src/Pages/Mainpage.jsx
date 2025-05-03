import { Link } from "react-router-dom";
import { Building2, Settings, Wrench } from "lucide-react"

export default function MainPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      {/* Admin button */}
      <div className="fixed top-6 right-6 z-50">
        <Link to="/adminpage">
          <div className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-100 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin Settings</span>
          </div>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen px-6">
        <h1 className="mb-12 text-4xl font-bold text-white text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Dashboard</span>
        </h1>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
          <Link to="/maintenance" className="w-full md:w-1/2">
            <div className="h-64 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl border-none shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-center w-20 h-20 mb-6 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                <Wrench className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Maintenance</h2>
              <p className="mt-2 text-blue-100 text-center">Manage maintenance requests and schedules</p>
            </div>
          </Link>

          <Link to="/homepage" className="w-full md:w-1/2">
            <div className="h-64 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl border-none shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-center w-20 h-20 mb-6 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Property</h2>
              <p className="mt-2 text-purple-100 text-center">View and manage property information</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
