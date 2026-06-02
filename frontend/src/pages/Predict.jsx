import React, { useState } from 'react'
import PredictionForm from '../components/PredictionForm'
import ResultCard from '../components/ResultCard'

const Predict = () => {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePredictionComplete = (result) => {
    setPrediction(result)
    setLoading(false)
  }

  const handlePredictionStart = () => {
    setLoading(true)
    setError(null)
    setPrediction(null)
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
    setLoading(false)
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-agri-green mb-2">Crop Disease Prediction</h1>
          <p className="text-gray-600">Upload an image of your crop leaf to detect diseases</p>
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
        {loading && (
          <div className="mb-6 p-8 bg-white rounded-lg shadow-lg text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-agri-green"></div>
            <p className="mt-4 text-gray-600">Analyzing image... This may take a few seconds.</p>
          </div>
        )}

        {/* Prediction Form */}
        {!loading && !prediction && (
          <PredictionForm 
            onPredictionStart={handlePredictionStart}
            onPredictionComplete={handlePredictionComplete}
            onError={handleError}
          />
        )}

        {/* Result Card */}
        {prediction && (
          <ResultCard 
            prediction={prediction}
            onNewPrediction={() => {
              setPrediction(null)
              setError(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Predict
