from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId

# Configure MongoDB Atlas connection
uri = "mongodb+srv://admin:republicpoly@cluster0.tyf7yym.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["images"]
collection = db["ERD"]

def download_file(file_id, output_path):
    # Find the file document by its ID
    document = collection.find_one({"_id": ObjectId(file_id)})
    if not document:
        return {"error": "File not found"}

    # Extract the file data from the document
    file_data = document["data"]

    # Save the file data to the specified output path
    with open(output_path, "wb") as file:
        file.write(file_data)

    return {"success": "File downloaded successfully"}

# Test the file download
file_id = "64741f31c2ccc42bb007b77e"
output_path = "downloads/test.jpg"
result = download_file(file_id, output_path)
if "error" in result:
    print(result["error"])
else:
    print(result["success"])
