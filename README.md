# Crop Disease Prediction System

A modern React frontend with Django backend for AI-powered crop disease prediction.

## 🌱 Features

- **AI-Powered Disease Detection**: Upload crop leaf images for instant prediction
- **Modern React UI**: Built with React, Tailwind CSS, and agriculture-themed design
- **PDF Reports**: Generate detailed treatment recommendations
- **History Management**: View and search previous predictions
- **Responsive Design**: Works on all devices

## 🚀 Quick Start

### Backend Setup (Django)

1. **Navigate to project directory**
   ```bash
   cd crop-disease-prediction
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Start Django server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup (React)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start React development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
crop-disease-prediction/
├── crop_app/                 # Django app
│   ├── models.py            # Database models
│   ├── views.py             # API endpoints and views
│   └── urls.py             # URL routing
├── crop22/                  # Django project settings
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── PredictionForm.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── HistoryTable.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Predict.jsx
│   │   │   └── History.jsx
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
└── manage.py
```

## 🔧 API Endpoints

### Prediction API
- **POST** `/api/predict` - Upload image and get prediction
  - Form data: `image`, `crop_name`, `location`
  - Returns: Prediction results with confidence and treatment

### History API
- **GET** `/api/history` - Get prediction history
  - Query params: `page`, `limit`, `search`
  - Returns: Paginated prediction history

### Report API
- **GET** `/api/report/<prediction_id>` - Download PDF report
  - Returns: PDF file with detailed analysis

## 🎨 UI Features

### Home Page
- Hero section with agriculture theme
- Navigation to prediction and history
- Feature highlights

### Prediction Page
- Image upload with preview
- Form validation
- Real-time prediction results
- PDF report generation

### History Page
- Searchable prediction history
- Pagination
- Report download functionality

## 🌿 Technology Stack

### Frontend
- **React 18** - Modern functional components
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast development server

### Backend
- **Django** - Web framework
- **TensorFlow/Keras** - ML model serving
- **Google Gemini AI** - Treatment recommendations
- **ReportLab** - PDF generation

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts
- Smooth animations

## 🔒 Security Features

- CSRF protection
- File upload validation
- Input sanitization
- Error handling

## 🚨 Important Notes

1. **Model Requirements**: The system uses `livestock_disease_model.h5` which expects tabular data. For accurate image prediction, replace with an image classification model.

2. **API Keys**: Ensure Google Gemini API key is properly configured.

3. **File Uploads**: Images are temporarily processed and not stored permanently.

4. **Browser Support**: Modern browsers with JavaScript enabled.

## 🐛 Troubleshooting

### Common Issues

1. **Tailwind CSS not working**
   ```bash
   npm install
   npm run dev
   ```

2. **API connection errors**
   - Ensure Django server is running on port 8081
   - Check CORS settings in Django

3. **Model loading errors**
   - Verify model file exists in project root
   - Check TensorFlow/Keras compatibility

## 📞 Support

For issues and questions:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure both backend and frontend are running

---

**CropAI** - Helping farmers detect diseases early with AI technology 🌱
