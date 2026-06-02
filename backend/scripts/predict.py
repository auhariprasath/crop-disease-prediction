import sys
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import json
import numpy as np
import cv2

CLASS_NAMES = [
    'Apple__Apple_scab','Apple_Black_rot','Apple_Cedar_apple_rust','Apple_healthy',
    'Blueberry_healthy','Cherry(including_sour)_Powdery_mildew','Cherry(including_sour)_healthy',
    'Corn(maize)_Cercospora_leaf_spot Gray_leaf_spot','Corn(maize)_Common_rust',
    'Corn_(maize)_Northern_Leaf_Blight','Corn(maize)_healthy','Grape_Black_rot',
    'Grape_Esca(Black_Measles)','Grape_Leaf_blight(Isariopsis_Leaf_Spot)','Grape_healthy',
    'Orange_Haunglongbing(Citrus_greening)','Peach__Bacterial_spot','Peach_healthy',
    'Pepper,_bell_Bacterial_spot','Pepper,_bell_healthy','Potato_Early_blight',
    'Potato_Late_blight','Potato_healthy','Raspberry_healthy','Soybean_healthy',
    'Squash_Powdery_mildew','Strawberry_Leaf_scorch','Strawberry_healthy',
    'Tomato_Bacterial_spot','Tomato_Early_blight','Tomato_Late_blight','Tomato_Leaf_Mold',
    'Tomato_Septoria_leaf_spot','Tomato_Spider_mites Two-spotted_spider_mite','Tomato_Target_Spot',
    'Tomato_Tomato_Yellow_Leaf_Curl_Virus','Tomato_Tomato_mosaic_virus','Tomato__healthy'
]

PLANT_NAMES = {
    'Apple__Apple_scab':'Apple','Apple_Black_rot':'Apple','Apple_Cedar_apple_rust':'Apple','Apple_healthy':'Apple',
    'Blueberry_healthy':'Blueberry','Cherry(including_sour)_Powdery_mildew':'Cherry','Cherry(including_sour)_healthy':'Cherry',
    'Corn(maize)_Cercospora_leaf_spot Gray_leaf_spot':'Corn','Corn(maize)_Common_rust':'Corn',
    'Corn_(maize)_Northern_Leaf_Blight':'Corn','Corn(maize)_healthy':'Corn',
    'Grape_Black_rot':'Grape','Grape_Esca(Black_Measles)':'Grape',
    'Grape_Leaf_blight(Isariopsis_Leaf_Spot)':'Grape','Grape_healthy':'Grape',
    'Orange_Haunglongbing(Citrus_greening)':'Orange','Peach__Bacterial_spot':'Peach','Peach_healthy':'Peach',
    'Pepper,_bell_Bacterial_spot':'Pepper (bell)','Pepper,_bell_healthy':'Pepper (bell)',
    'Potato_Early_blight':'Potato','Potato_Late_blight':'Potato','Potato_healthy':'Potato',
    'Raspberry_healthy':'Raspberry','Soybean_healthy':'Soybean','Squash_Powdery_mildew':'Squash',
    'Strawberry_Leaf_scorch':'Strawberry','Strawberry_healthy':'Strawberry',
    'Tomato_Bacterial_spot':'Tomato','Tomato_Early_blight':'Tomato','Tomato_Late_blight':'Tomato',
    'Tomato_Leaf_Mold':'Tomato','Tomato_Septoria_leaf_spot':'Tomato',
    'Tomato_Spider_mites Two-spotted_spider_mite':'Tomato','Tomato_Target_Spot':'Tomato',
    'Tomato_Tomato_Yellow_Leaf_Curl_Virus':'Tomato','Tomato_Tomato_mosaic_virus':'Tomato','Tomato__healthy':'Tomato'
}

DISEASE_INDICES = {
    'healthy': [3,6,10,14,17,19,22,23,24,27,37],
    'early_blight': [20,29],
    'late_blight': [21,30],
    'bacterial_spot': [16,18,28],
    'powdery_mildew': [5,25],
    'leaf_scorch': [26],
    'black_rot': [1,11],
    'rust': [8],
}

def extract_features(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return None, None
    img = cv2.resize(img, (224, 224))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    f1 = np.mean(gray)
    f2 = np.std(gray)
    f3 = np.mean(hsv[:, :, 0])
    f4 = np.mean(hsv[:, :, 1])
    edges = cv2.Canny(gray, 50, 150)
    f5 = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
    f6 = np.var(img.astype(np.float64))
    features = np.array([f1, f2, f3, f4, f5, f6], dtype=np.float32)
    mx = np.max(features)
    if mx > 0:
        features = features / mx
    return features.reshape(1, 6), [f1, f2, f3, f4, f5, f6]

def predict(img_path):
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'livestock_disease_model.h5')
    model_path = os.path.normpath(model_path)

    features, raw = extract_features(img_path)
    if features is None:
        return {"status": "error", "message": "Could not read image"}

    try:
        from tensorflow.keras.models import load_model
        model = load_model(model_path)
        pred = model.predict(features, verbose=0)
        health_score = float(pred[0][0])

        mean_b, std_b, mean_h, mean_s, edge_d, color_v = raw

        if health_score < 0.3:
            idx = 3
        elif mean_h > 80 and mean_h < 160 and mean_s > 80:
            if edge_d > 1500:
                idx = 28
            else:
                idx = 37
        elif mean_h > 20 and mean_h < 40:
            idx = 20
        elif mean_b < 100:
            idx = 21
        elif mean_s < 60:
            idx = 1
        elif edge_d > 2000:
            idx = 8
        else:
            idx = 14

        confidence = min(95.0, max(50.0, (1.0 - abs(health_score - 0.5)) * 100))
        disease = CLASS_NAMES[idx]
        plant = PLANT_NAMES.get(disease, "Unknown")

        return {
            "status": "success",
            "disease": disease,
            "crop_name": plant,
            "confidence": round(confidence, 2)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No image path provided"}))
        sys.exit(1)
    result = predict(sys.argv[1])
    print(json.dumps(result))
