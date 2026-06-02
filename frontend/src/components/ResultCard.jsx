import React, { useState } from 'react'
import axios from 'axios'

const ResultCard = ({ prediction, onNewPrediction }) => {
  const [generatingReport, setGeneratingReport] = useState(false)

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low':
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    try {
      const response = await axios.get(`/api/report/${prediction.id}`, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `disease_report_${prediction.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGeneratingReport(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <span className="text-2xl">🌿</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Prediction Results</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Disease Name */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Predicted Disease</h3>
          <p className="text-lg font-semibold text-gray-900">{prediction.disease}</p>
        </div>

        {/* Confidence */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Confidence</h3>
          <p className={`text-lg font-semibold ${getConfidenceColor(prediction.confidence)}`}>
            {prediction.confidence}%
          </p>
        </div>

        {/* Severity */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Severity Level</h3>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(prediction.severity)}`}>
            {prediction.severity || 'Moderate'}
          </span>
        </div>

        {/* Crop Name */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Crop Type</h3>
          <p className="text-lg font-semibold text-gray-900">{prediction.crop_name}</p>
        </div>
      </div>

      {/* Treatment Recommendations */}
      {prediction.treatment && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Suggested Treatment</h3>
          <p className="text-blue-700 whitespace-pre-line">{prediction.treatment}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleGenerateReport}
          disabled={generatingReport}
          className="flex-1 bg-agri-green text-white font-bold py-3 px-4 rounded-lg hover:bg-leaf-green transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generatingReport ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Report...
            </span>
          ) : (
            '📄 Generate Report'
          )}
        </button>
        
        <button
          onClick={onNewPrediction}
          className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          🔄 New Prediction
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          ⚠️ This is an AI prediction. Always consult with agricultural experts for accurate diagnosis and treatment recommendations.
        </p>
      </div>
    </div>
  )
}

export default ResultCard
