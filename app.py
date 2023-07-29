from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from PIL import Image
import io
import numpy as np
import spacy
import torch
from datetime import datetime
import base64
import os
import re
import hashlib

app = Flask(__name__)
app.config['SECRET_KEY'] = 'FYP'
CORS(app)  # Enable Cross-Origin Resource Sharing

# Configure MongoDB Atlas connection
uri = "mongodb+srv://admin:republicpoly@cluster0.tyf7yym.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri)
db = client["FYP"]
collection = db["images"]
users_collection = db["users"]

# Load the spaCy model
nlp = spacy.load('en_core_web_md')

# Load the object detection model
model = torch.hub.load('ultralytics/yolov5', 'custom', path='yolov5/runs/train/exp/weights/best.pt')

# Load the easyocr model
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'
import easyocr
reader = easyocr.Reader(['en'])

# Function to extract text from an image
def extract_text(image):
    # Convert the PIL image to a numpy array
    image_array = np.array(image)

    # Read text from the image using EasyOCR
    result = reader.readtext(image_array, detail=0)

    # Join the extracted text into a single string
    text = ' '.join(result)

    return text

# Function to extract text from detected objects in an image
def extract_text_from_objects(image, results):
    # Create a dictionary to store the extracted text for each table and attributes
    tables = {}

    # Access object properties from the results
    for index, row in results.pandas().xyxy[0].iterrows():
        if row['name'] == 'table':
            # Extract ROI for table name
            x1, y1, x2, y2 = row['xmin'], row['ymin'], row['xmax'], row['ymax']
            roi = np.array(image.crop((x1, y1, x2, y2)))

            # Perform OCR on the ROI
            data = extract_text(roi)
            tables[index] = data

    # Return the extracted text for the detected objects
    return list(tables.values())

@app.route("/api/upload", methods=["POST"])
def upload_files():
    threshold = int(request.form.get("similarityThreshold", 80))
    if "files" not in request.files:
        return {"error": "No files provided"}, 400

    files = request.files.getlist("files") # Retrieve the list of uploaded files
    inserted_ids = []

    for file in files:
        if file.filename == "":
            return {"error": "No file selected"}, 400

        # Read file data
        file_data = file.stream.read()

        document = {
            "data": file_data,
            "filename": file.filename,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "uploaded_by": session.get("username"),
            "threshold": str(threshold)+"%"
        }

        # Insert document into MongoDB database
        result = collection.insert_one(document)
        inserted_ids.append(str(result.inserted_id))

    # Perform object detection and text extraction
    for doc in collection.find():
        if "text" not in doc:
            image_data = doc["data"]
            image = Image.open(io.BytesIO(image_data))
            results = model(image)
            extracted_text_list = extract_text_from_objects(image, results)
            
            # Clean extracted text
            extracted_text_list = [re.sub(r'Indexes', '', re.sub(r'[\W_]+', ' ', re.sub(r'\d+', '', text))) for text in extracted_text_list]

            # Print the extracted text to console
            print("Text extracted from", doc["filename"])
            for i, text in enumerate(extracted_text_list, 1):
                table_name, *attributes = text.split()
                table_label = table_name.capitalize()
                print("Table:", table_label)
                print("Attributes:", ' '.join(attributes))
                print()
            print()

            # Update the documents with extracted text
            collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"text": extracted_text_list}}
            )

    # Perform similarity comparison using pre-extracted text
    for doc in collection.find({"uploaded_by": session.get("username")}):
        if "text" in doc:
            similarity_results = []
            current_text_list = doc["text"]

            for other_doc in collection.find({"_id": {"$ne": doc["_id"]}, "text": {"$exists": True}, "uploaded_by": session.get("username")}):
                other_text_list = other_doc["text"]
                other_filename = other_doc["filename"]

                doc1 = nlp(' '.join(current_text_list))
                doc2 = nlp(' '.join(other_text_list))
                similarity = doc1.similarity(doc2) * 100
                similarity = float("{:.2f}".format(similarity))

                if similarity >= threshold:
                    similarity_results.append({
                        "filename": other_filename,
                        "data": base64.b64encode(other_doc["data"]).decode('utf-8'),
                        "similarity": "{:.2f}%".format(similarity)
                    })
                    
            # Set similarity field containing similarity results for each image
            collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"similarity": similarity_results}}
            )

    return {"success": "Images uploaded successfully", "file_ids": inserted_ids}, 200


@app.route("/api/results", methods=["GET"])
def get_results():
    username = session.get("username")
    similarity_results = []
    for document in collection.find({"uploaded_by": username}):
        similarity_results.append({"filename": document["filename"], "similarity": document.get("similarity", "")})

    return jsonify({"results": similarity_results}), 200

@app.route("/api/clear", methods=["POST"])
def clear_results():
    username = session.get("username")
    collection.delete_many({"uploaded_by": username})
    return {"success": "Results cleared successfully"}, 200

@app.route("/api/login", methods=["POST"])
def login():
    username = request.json.get("username")
    password = request.json.get("password")

    # Hash the password using SHA-256
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    # Check if the username and hashed password match the records in the users collection
    user = users_collection.find_one({"username": username, "password": hashed_password})

    if user:
        # Successful login
        session["username"] = user["username"]
        return jsonify({"message": "Login successful", "username": user["username"]}), 200
    else:
        # Failed login
        return jsonify({"message": "Invalid username or password"}), 401


if __name__ == "__main__":
    app.run()
