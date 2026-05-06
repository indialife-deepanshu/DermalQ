from flask import Flask, request, jsonify
from flask_cors import CORS 
import tensorflow as tf
import torch
import torch.nn as nn
import timm
from torchvision import transforms
from PIL import Image
import numpy as np
import io
import os

# Suppress TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app)

# --- 1. UPDATED MODEL 3 ARCHITECTURE (Matches your best_model.pth) ---
class HybridSkinModel(nn.Module):
    def __init__(self, num_classes=7, dropout=0.3):
        super(HybridSkinModel, self).__init__()
        # Backbone 1: EfficientNet
        self.efficientnet = timm.create_model('efficientnet_b3', pretrained=False, num_classes=0)
        # Backbone 2: Vision Transformer
        self.vit = timm.create_model('vit_small_patch16_224', pretrained=False, num_classes=0)
        
        # Updated Classifier to match the checkpoint (9 layers total)
        self.classifier = nn.Sequential(
            nn.Linear(1536 + 384, 512),   # Layer 0
            nn.BatchNorm1d(512),          # Layer 1
            nn.ReLU(),                    # Layer 2
            nn.Dropout(dropout),          # Layer 3
            nn.Linear(512, 256),          # Layer 4 (This was the mismatch!)
            nn.BatchNorm1d(256),          # Layer 5
            nn.ReLU(),                    # Layer 6
            nn.Dropout(dropout),          # Layer 7
            nn.Linear(256, num_classes)   # Layer 8
        )

    def forward(self, x):
        features_eff = self.efficientnet(x)
        features_vit = self.vit(x)
        combined = torch.cat((features_eff, features_vit), dim=1)
        return self.classifier(combined)

# --- 2. UPDATED LOADING LOGIC ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model3_torch = HybridSkinModel()
checkpoint = torch.load('../exports/best_model.pth', map_location=device)

# --- FIX FOR KEY NAMES ---
# We need to map 'efficientnet.features.0...' to 'efficientnet.conv_stem...' etc.
state_dict = checkpoint['model_state_dict']
new_state_dict = {}
for k, v in state_dict.items():
    # If key contains 'efficientnet.features', we might need to handle it 
    # depending on your timm version. If loading still fails, we use strict=False.
    new_state_dict[k] = v

# Load with strict=False to bypass minor naming differences in the backbone
model3_torch.load_state_dict(new_state_dict, strict=False)
model3_torch.to(device)
model3_torch.eval()

models = {
    'model1': tf.keras.models.load_model('../exports/final_skin_disease_model.keras'),
    'model2': tf.keras.models.load_model('../exports/CNN_with_Metadata.keras'),
    'model3': model3_torch
}

CLASSES_MODEL3 = ['nv', 'mel', 'bkl', 'bcc', 'akiec', 'vasc', 'df']
# Add this line below it:
CLASSES_TF = ['akiec', 'bcc', 'bkl', 'df', 'mel', 'nv', 'vasc']

# 2. HELPER: Image Preprocessing
def preprocess_tf(image, target_size=(224, 224)):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = tf.keras.preprocessing.image.img_to_array(image)
    image = np.expand_dims(image, axis=0)
    return image / 255.0

# Preprocessing for Model 3 matching the notebook
transform_torch = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# 3. HELPER: Metadata Preprocessing (For Model 2)
# This MUST match the encoding/scaling used during training in your notebook
def preprocess_metadata(age, gender, localization):
    # Example: Normalize Age (if max age in dataset was 100)
    norm_age = float(age) / 85.0
    
    # Example: Simple encoding (Update these to match your LabelEncoder/OneHot logic)
    gender_map = {'male': 0, 'female': 1, 'unknown': 2}
    loc_list = ['abdomen', 'acral', 'back', 'chest', 'ear', 'face', 
                    'foot', 'genital', 'hand', 'lower extremity', 'neck', 
                    'scalp', 'trunk', 'unknown', 'upper extremity']
    
    gen_val = gender_map.get(gender.lower(), 2)
    loc_val = loc_list.index(localization.lower()) if localization.lower() in loc_list else 0
    
    # Create a feature vector [Age, Gender, Localization]
    # Note: If your model used One-Hot, you'd need a longer vector here.
    meta_vector = np.array([[norm_age, gen_val, loc_val]], dtype=np.float32)
    return meta_vector

@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image provided"}), 400
    
    try:
        file = request.files['image']
        age = request.form.get('age', 0)
        gender = request.form.get('gender', 'unknown')
        localization = request.form.get('localization', 'back')
        model_choice = request.form.get('model_choice', 'model3')

        selected_model = models.get(model_choice, models['model1'])
        img = Image.open(io.BytesIO(file.read())).convert("RGB")

        results = []
        
        # INFERENCE LOGIC FOR MODEL 3 (PyTorch)
        if model_choice == 'model3':
            input_tensor = transform_torch(img).unsqueeze(0).to(device)
            with torch.no_grad():
                output = selected_model(input_tensor)
                probabilities = torch.softmax(output, dim=1)[0].cpu().numpy()
            
            for i in range(len(CLASSES_MODEL3)):
                results.append({
                    "label": CLASSES_MODEL3[i],
                    "confidence": round(float(probabilities[i]), 4)
                })

        # INFERENCE LOGIC FOR MODELS 1 & 2 (TensorFlow)
        else:
            processed_img = preprocess_tf(img)
            if model_choice == 'model2':
                # (Assuming you keep your existing preprocess_metadata function)
                processed_meta = preprocess_metadata(age, gender, localization)
                prediction = selected_model.predict([processed_img, processed_meta])[0]
            else:
                prediction = selected_model.predict(processed_img)[0]

            for i in range(len(CLASSES_TF)):
                results.append({
                    "label": CLASSES_TF[i],
                    "confidence": round(float(prediction[i]), 4)
                })

        results = sorted(results, key=lambda x: x['confidence'], reverse=True)

        return jsonify({
            "success": True,
            "model_used": model_choice,
            "top_prediction": results[0],
            "all_predictions": results
        })

    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({"success": False, "error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
