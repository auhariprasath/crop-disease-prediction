import React, { useState } from 'react'
import axios from 'axios'

const PredictionForm = ({ onPredictionStart, onPredictionComplete, onError }) => {
  const [formData, setFormData] = useState({
    image: null
  })
  const [imagePreview, setImagePreview] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.image) {
      onError('Please upload an image')
      return
    }

    onPredictionStart()

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('image', formData.image)

      const response = await axios.post('/api/predict', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onPredictionComplete(response.data)
    } catch (error) {
      console.error('Prediction error:', error)
      onError(
        error.response?.data?.message || 
        'Failed to predict disease. Please try again.'
      )
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Crop Leaf Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-agri-green transition-colors duration-200">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="mb-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-2">Image selected</p>
                </div>
              ) : (
                <div>
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <span className="text-3xl">📷</span>
                  </div>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-agri-green hover:text-leaf-green focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-agri-green"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-agri-green text-white font-bold py-3 px-4 rounded-lg hover:bg-leaf-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-agri-green focus:ring-offset-2"
          >
            Predict Disease
          </button>
        </div>
      </form>
    </div>
  )
}

export default PredictionForm
