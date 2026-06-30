import sys
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import json
import numpy as np
import cv2

IMG_SIZE = 150
MODEL_FILENAME = 'plant disease model final.h5'

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

def preprocess(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return None
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    return np.expand_dims(img, axis=0)

def predict(img_path):
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', MODEL_FILENAME)
    model_path = os.path.normpath(model_path)

    batch = preprocess(img_path)
    if batch is None:
        return {"status": "error", "message": "Could not read image"}

    try:
        from tensorflow.keras.models import load_model
        model = load_model(model_path)
        pred = model.predict(batch, verbose=0)[0]

        idx = int(np.argmax(pred))
        confidence = round(float(pred[idx]) * 100, 2)
        disease = CLASS_NAMES[idx]
        plant = PLANT_NAMES.get(disease, "Unknown")

        return {
            "status": "success",
            "disease": disease,
            "crop_name": plant,
            "confidence": confidence
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No image path provided"}))
        sys.exit(1)
    result = predict(sys.argv[1])
    print(json.dumps(result))
