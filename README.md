# OCR Data Extraction App
### https://clever-faloodeh-e7c31a.netlify.app/

This project is an OCR (Optical Character Recognition) data extraction app built with Node.js, Express, MongoDB, and Google Cloud Vision API.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Dependencies](#dependencies)
- [Architecture Overview](#architecture-overview)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [License](#license)

## Introduction

The OCR Data Extraction App allows you to upload an image, extract relevant information using Google Cloud Vision API, and store the data in MongoDB. The app is built with simplicity and modularity in mind, making it easy to integrate into other projects.

## Features

- Image upload for OCR data extraction
- Storing extracted data in MongoDB
- RESTful API endpoints for CRUD operations
- JSON data upload for quick data storage

## Setup Instructions

To compile and run the app, follow these steps:

1. *Clone the Repository*
   ```bash
   git clone [https://github.com/vini09m/ocr-data-extraction-app.git](https://github.com/vini09m/IdcardOcr.git)https://github.com/vini09m/IdcardOcr.git
   cd ocr-data-extraction-app
   
1)Install Dependencies
npm install

2)Set up Google Cloud Vision API Credentials
Generate a JSON key file for your Google Cloud Project.
Save the JSON key file as ServiceAccountToken.json in the root directory.
Set up MongoDB

3)Create a MongoDB Atlas account and set up a cluster.
Replace the URI variable in server.js with your MongoDB connection string.

4)Run the App
to run the app type this in cmd:
a)node server.js in the detection-backend directory
b)npm start in the detection directory

5)Access the App
Open your browser and go to http://localhost:5000

## Dependencies

Express
Multer
@google-cloud/vision
Cors
Path
Mongoose

## Architecture Overview
The app follows a client-server architecture with Node.js serving as the backend, MongoDB for data storage, and Google Cloud Vision API for OCR.

## Usage
Upload an image using the /upload endpoint.
Extracted OCR data is stored in MongoDB.
Access the data through the provided API endpoints.

## Endpoints
POST /upload
Upload an image for OCR data extraction.

GET /ocrData
Retrieve all OCR data.

PUT /ocrData/:id
Update OCR data by ID.

DELETE /ocrData/:id
Delete OCR data by ID.

POST /uploadJson
Upload JSON data for storage.

POST /ocrData
Create new OCR data.




![image](https://github.com/vini09m/IdcardOcr/assets/108429128/d51b355a-fd77-4641-86de-6f6fe17c4fae)
![image](https://github.com/vini09m/IdcardOcr/assets/108429128/52b60911-5950-4dad-9015-9c37495a5309)
![image](https://github.com/vini09m/IdcardOcr/assets/108429128/04f81336-583a-4803-80c9-4af37e70802f)
![image](https://github.com/vini09m/IdcardOcr/assets/108429128/d2958a59-ec0c-497a-a438-9a49db4facb0)
![image](https://github.com/vini09m/IdcardOcr/assets/108429128/ffb1452d-74a6-4ce2-a159-88f3959aedc3)

### It takes a bit time to process the data :)
