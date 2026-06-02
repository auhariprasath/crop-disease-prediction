import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-agri-green rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-lg">🌱</span>
                </div>
                <span className="text-xl font-bold text-agri-green">CropAI</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/')
                  ? 'bg-agri-green text-white'
                  : 'text-gray-700 hover:bg-green-100 hover:text-agri-green'
              }`}
            >
              Home
            </Link>
            <Link
              to="/predict"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/predict')
                  ? 'bg-agri-green text-white'
                  : 'text-gray-700 hover:bg-green-100 hover:text-agri-green'
              }`}
            >
              Predict
            </Link>
            <Link
              to="/history"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/history')
                  ? 'bg-agri-green text-white'
                  : 'text-gray-700 hover:bg-green-100 hover:text-agri-green'
              }`}
            >
              History
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
