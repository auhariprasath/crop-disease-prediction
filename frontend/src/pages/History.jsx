import React, { useState, useEffect } from 'react'
import axios from 'axios'
import HistoryTable from '../components/HistoryTable'

const History = () => {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 10

  useEffect(() => {
    fetchHistory()
  }, [currentPage, searchTerm])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/history', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        }
      })
      
      setPredictions(response.data.predictions || [])
      setTotalPages(response.data.totalPages || 1)
      setError(null)
    } catch (error) {
      console.error('Error fetching history:', error)
      setError('Failed to load prediction history. Please try again.')
      setPredictions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleDownloadReport = async (predictionId) => {
    try {
      const response = await axios.get(`/api/report/${predictionId}`, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `disease_report_${predictionId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report. Please try again.')
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-agri-green mb-2">Prediction History</h1>
          <p className="text-gray-600">View and manage your previous disease predictions</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search by crop name or disease..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center">
              <span className="text-xl mr-2">❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-agri-green"></div>
            <p className="mt-4 text-gray-600">Loading prediction history...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            {predictions.length > 0 && (
              <div className="mb-4 text-center text-gray-600">
                Showing {predictions.length} results
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </div>
            )}

            {/* History Table */}
            <HistoryTable 
              predictions={predictions}
              onDownloadReport={handleDownloadReport}
            />

            {/* No Results */}
            {predictions.length === 0 && !loading && !error && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Start by making your first prediction'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === page
                          ? 'bg-agri-green text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default History
