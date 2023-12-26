const express = require('express');
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 5000;

// Set the path for Google Cloud Vision API credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'ServiceAccountToken.json');

// Enable CORS
app.use(cors());

// Create a client for Google Cloud Vision API
const client = new ImageAnnotatorClient();

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Use JSON parsing middleware
app.use(express.json());

// Connect to MongoDB Atlas
const URI = "mongodb+srv://vinitamertia:t1YtqSTDWLhTcgAN@cluster0.pjej4lm.mongodb.net/nodeJsEasyWays?retryWrites=true&w=majority";
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function () {
    console.log("Database connected successfully");
});

// Define a mongoose schema for storing OCR data
const ocrDataSchema = new mongoose.Schema({
    identification_number: String,
    name: String,
    last_name: String,
    date_of_birth: String,
    date_of_issue: String,
    date_of_expiry: String,
    state: String,
});

const OCRData = mongoose.model('OCRData', ocrDataSchema);

// Handle file upload and text detection
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const [result] = await client.textDetection(req.file.buffer);
        const detections = result.textAnnotations;
        const text = detections.map((annotation) => annotation.description).join('\n');

        const englishOnlyText = text.replace(/[^a-zA-Z0-9\s]/g, '');

        const data = {
            identification_number: extractInfo(englishOnlyText, 'Identification Number'),
            name: extractInfo(englishOnlyText, 'Name'),
            last_name: extractInfo(englishOnlyText, 'Last Name'),
            date_of_birth: extractInfo(englishOnlyText, 'Date of Birth'),
            date_of_issue: extractInfo(englishOnlyText, 'Date of Issue'),
            date_of_expiry: extractInfo(englishOnlyText, 'Date of Expiry'),
        };

        data.state=jsonData.state = (jsonData.identification_number && jsonData.name && jsonData.last_name && jsonData.date_of_birth && jsonData.date_of_issue && jsonData.date_of_expiry) ? 'Success' : 'Failure';

        res.json({ text: englishOnlyText, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch all OCR data
app.get('/ocrData', async (req, res) => {
    try {
        const allOCRData = await OCRData.find();
        res.json(allOCRData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update OCR data by ID
app.put('/ocrData/:id', async (req, res) => {
    const { id } = req.params;
    const newData = req.body;

    try {
        await OCRData.findByIdAndUpdate(id, newData);
        res.json({ message: 'OCR data updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete OCR data by ID
app.delete('/ocrData/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await OCRData.findByIdAndDelete(id);
        res.json({ message: 'OCR data deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Save JSON data to MongoDB
app.post('/uploadJson', (req, res) => {
    const jsonDataString = req.body.jsonData;

    try {
        const jsonData = JSON.parse(jsonDataString);

        const jsonOutput = new OCRData(jsonData);
        jsonOutput.save()
            .then(() => {
                res.status(200).json({ message: 'JSON data saved successfully' });
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Invalid JSON data' });
    }
});

// Create new OCR data
app.post('/ocrData', async (req, res) => {
  const newData = req.body;

  try {
      newData.state=jsonData.state = (newData.identification_number && newData.name && newData.last_name && newData.date_of_birth && newData.date_of_issue && newData.date_of_expiry) ? 'Success' : 'Failure';
      const ocrData = new OCRData(newData);
      await ocrData.save();

      res.status(201).json({ message: 'OCR data created successfully', data: ocrData });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper function to extract information using regular expressions
function extractInfo(text, keyword) {
    const match = text.match(new RegExp(`${keyword}\\s*([^A-Za-z]+)`));
    return match ? match[1].trim() : '';
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});