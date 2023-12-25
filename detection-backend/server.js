const express = require('express');
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 5000;

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'ServiceAccountToken.json');

app.use(cors());

const client = new ImageAnnotatorClient();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// Connect to MongoDB Atlas
const URI = "mongodb+srv://vinitamertia:t1YtqSTDWLhTcgAN@cluster0.pjej4lm.mongodb.net/nodeJsEasyWays?retryWrites=true&w=majority";
//mongodb+srv://vinitamertia:LKQDuXjAXITQ1Rg6@cluster0.6l5umrd.mongodb.net/nodeJsEasyWays?retryWrites=true&w=majority
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
});

const OCRData = mongoose.model('OCRData', ocrDataSchema);

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

        // // Save the data to MongoDB
        // const ocrData = new OCRData(data);
        // await ocrData.save();

        res.json({ text: englishOnlyText, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/ocrData', async (req, res) => {
    try {
        const allOCRData = await OCRData.find();
        res.json(allOCRData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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

app.post('/uploadJson', (req, res) => {
    const jsonDataString = req.body.jsonData;

    try {
        // Parse the JSON data string
        const jsonData = JSON.parse(jsonDataString);

        // Save the JSON data to MongoDB
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

app.post('/ocrData', async (req, res) => {
  const newData = req.body;

  try {
      // Create a new OCRData document
      const ocrData = new OCRData(newData);

      // Save the new data to MongoDB
      await ocrData.save();

      res.status(201).json({ message: 'OCR data created successfully', data: ocrData });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Helper function to extract information using regular expressions
function extractInfo(text, keyword) {
    const match = text.match(new RegExp(`${keyword}\\s*([^A-Za-z]+)`));
    return match ? match[1].trim() : '';
}





// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const mongoose = require('mongoose');

// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB Atlas
// const URI = "mongodb+srv://vinitamertia:t1YtqSTDWLhTcgAN@cluster0.pjej4lm.mongodb.net/nodeJsEasyWays?retryWrites=true&w=majority";
// mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

// const db = mongoose.connection;

// db.on('error', console.error.bind(console, 'connection error'));
// db.once('open', function () {
//     console.log("Database connected successfully");
// });

// // Define a mongoose schema for storing JSON output
// const jsonOutputSchema = new mongoose.Schema({
//     identification_number: String,
//     name: String,
//     last_name: String,
//     date_of_birth: String,
//     date_of_issue: String,
//     date_of_expiry: String,
// });

// const JsonOutput = mongoose.model('JsonOutput', jsonOutputSchema);

// app.post('/uploadJson', (req, res) => {
//     const jsonData = req.body;

//     // Save the JSON output to MongoDB
//     const jsonOutput = new JsonOutput(jsonData);
//     jsonOutput.save()
//         .then(() => {
//             res.status(200).json({ message: 'JSON data saved successfully' });
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         });
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });


