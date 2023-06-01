from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from PIL import Image
import io
import pytesseract
import re
import spacy
import torch
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Configure MongoDB Atlas connection
uri = "mongodb+srv://admin:republicpoly@cluster0.tyf7yym.mongodb.net/images?retryWrites=true&w=majority"
client = MongoClient(uri)
db = client["images"]
collection = db["ERD"]

# Load the spaCy model
nlp = spacy.load('en_core_web_md')

# Load the object detection model
model = torch.hub.load('ultralytics/yolov5', 'custom', path='yolov5/runs/train/exp/weights/best.pt')

# Function to extract text from an image
def extract_text(image):
    return pytesseract.image_to_string(image)

# Function to extract text from detected objects in an image
def extract_text_from_objects(image, results):
    # Create a dictionary to store the extracted text for each table and attributes
    tables = {}

    # Access object properties from the results
    for index, row in results.pandas().xyxy[0].iterrows():
        if row['name'] == 'table name':
            # Extract ROI for table name
            x1, y1, x2, y2 = row['xmin'], row['ymin'], row['xmax'], row['ymax']
            roi = image.crop((x1, y1, x2, y2))
            grayscale_roi = roi.convert('L')

            # Perform OCR on the ROI
            data = extract_text(grayscale_roi)
            tables[index] = data

    # Return the extracted text for the detected objects
    return list(tables.values())

@app.route("/api/upload", methods=["POST"])
def upload_files():
    if "files" not in request.files:
        return {"error": "No files provided"}, 400

    files = request.files.getlist("files")

    # Insert the file details into MongoDB Atlas
    inserted_ids = []
    for file in files:
        if file.filename == "":
            return {"error": "No file selected"}, 400

        # Save the file to a temporary folder called "uploads":
        file_path = "uploads/" + file.filename
        file.save(file_path)

        # Read the file data
        with open(file_path, "rb") as file_obj:
            file_data = file_obj.read()

        document = {
            "data": file_data,
            "filename": file.filename,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        result = collection.insert_one(document)
        inserted_ids.append(str(result.inserted_id))

        # Perform object detection and text extraction
        image = Image.open(file_path)
        results = model(image)
        extracted_text_list = extract_text_from_objects(image, results)

        # Remove special characters from the extracted text list
        extracted_text_list = [re.sub(r'([^\w\s]|\_)', ' ', text) for text in extracted_text_list]

        # Print the extracted text for the image
        print("Text extracted from", file.filename)
        for i, text in enumerate(extracted_text_list, 1):
            print("Table", i, ":\n", text)
        print()

        # Compare the similarity of text between each list in extracted_text_list
        similarity_results = []
        for doc in collection.find({"_id": {"$ne": ObjectId(result.inserted_id)}}):
            # Load the image from the database
            image_data = doc["data"]
            image = Image.open(io.BytesIO(image_data))

            # Perform object detection and text extraction for the database image
            db_results = model(image)
            db_extracted_text_list = extract_text_from_objects(image, db_results)

            # Remove special characters from the extracted text list
            db_extracted_text_list = [re.sub(r'([^\w\s]|\_)', ' ', text) for text in db_extracted_text_list]

            # Compare the similarity of the uploaded image's text and the text extracted from the current database image using spaCy
            doc1 = nlp('\n'.join(extracted_text_list))
            doc2 = nlp('\n'.join(db_extracted_text_list))
            similarity = doc1.similarity(doc2) * 100
            similarity = float("{:.2f}".format(similarity))  # Convert to float with 2 decimal places
            if similarity >= 80:
                similarity_results.append({"filename": doc["filename"], "similarity": "{:.2f}%".format(similarity)})

        # Update the similarity field in the uploaded image document
        collection.update_one(
            {"_id": ObjectId(result.inserted_id)},
            {"$set": {"similarity": similarity_results}}
        )

    return {"success": "Images uploaded successfully", "file_ids": inserted_ids}, 200

@app.route("/api/results", methods=["GET"])
def get_results():
    similarity_results = []
    for document in collection.find():
        similarity_results.append({"filename": document["filename"], "similarity": document.get("similarity", "")})

    return jsonify({"results": similarity_results}), 200

@app.route("/api/clear", methods=["POST"])
def clear_results():
    collection.delete_many({"similarity": {"$exists": True}})
    return {"success": "Results cleared successfully"}, 200


@app.route("/api/download/<file_id>", methods=["GET"])
def download_image(file_id):
    # Find the file document by its ID
    document = collection.find_one({"_id": ObjectId(file_id)})
    if not document:
        return {"error": "File not found"}, 404

    # Extract the file data from the document
    file_data = document["data"]
    file_name = document["filename"]

    # Save the file data to the downloads folder
    output_path = f"downloads/{file_name}"
    with open(output_path, "wb") as file:
        file.write(file_data)

    return {"success": "File downloaded successfully", "file_path": output_path}, 200

if __name__ == "__main__":
    app.run()
