import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  // State variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [ocrData, setOcrData] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    // Fetch OCR data when the component mounts
    fetchOcrData();
  }, []);

  // Handle clear button click
  const handleClear = () => {
    setSelectedFile(null);
    setImageUrl(null);
    setJsonData(null);

    // Reset the value of the file input to clear the selected file
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = null;
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Check if a file is selected
    if (file) {
      // Check the file size
      const fileSizeInBytes = file.size;
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

      // Check if the file size exceeds 2MB
      if (fileSizeInMB > 2) {
        alert('Please select an image file that is 2MB or smaller.');
        setSelectedFile(null);
        setImageUrl(null);

        // Reset the file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.value = null;
        }
        return;
      } else {
        setSelectedFile(e.target.files[0]);
        setImageUrl(URL.createObjectURL(e.target.files[0]));
      }
    }
  };

  // Handle file upload
  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select an image file.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    axios.post('https://ocr-detect-92zt.onrender.com/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        setExtractedText(response.data.text);
        const lines = response.data.text.split('\n');
        const parsedData = parseExtractedText(lines);

        // Check if the identification number already exists in ocrData
        const identificationNumberExists = ocrData.some(data => data.identification_number === parsedData.identification_number);

        if (identificationNumberExists) {
          alert('Identification number already exists. Please choose a different ID Card.');
          return;
        }

        setJsonData(parsedData);

        // Send the JSON data string to the server
        axios.post('https://ocr-detect-92zt.onrender.com/uploadJson', { jsonData: JSON.stringify(parsedData, null, 2) })
          .then(serverResponse => {
            console.log(serverResponse.data.message);

            // Fetch updated OCR data after upload
            fetchOcrData();
          })
          .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
  };

  // Parse extracted text
  const parseExtractedText = (lines) => {
    const jsonData = {
      identification_number: extractValue(lines, /\b(\d{1,4}\s*){5,}\d{1,4}\b/),
      name: extractValue(lines, /Name\s*([\s\n]*[A-Za-z]+\s[A-Za-z]+)/, 'Name'),
      last_name: extractValue(lines, /Last [nN]ame\s*([\s\n]*[A-Za-z]+)/, 'Last name'),
      date_of_birth: extractValue(lines, /\d{1,2}\s[A-Za-z]+\s\d{4}/, 'Date of Birth'),
      date_of_issue: extractLineAbove(lines, 'Date of Issue'),
      date_of_expiry: extractLineAbove(lines, 'Date of Expiry'),
    };

    if (!jsonData.last_name) {
      jsonData.last_name = extractLineAbove(lines, 'Last Name');
    }

    if (!jsonData.name) {
      jsonData.name = extractLineBelow(lines, 'Name');
      console.log('Name field is empty.');
    }

    if (!jsonData.date_of_birth) {
      jsonData.date_of_birth = extractLineBelow(lines, 'Date of Birth');
    }
    return jsonData;
  };

  // Extract line above a keyword
  const extractLineAbove = (lines, keyword) => {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].includes(keyword)) {
        return lines[i - 1].trim();
      }
    }
    return '';
  };

  // Extract line below a keyword
  const extractLineBelow = (lines, keyword) => {
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i].includes(keyword)) {
        return lines[i + 1].trim();
      }
    }
    return '';
  };

  // Extract a value based on a regex
  const extractValue = (lines, regex, removeWord) => {
    const line = lines.find((line) => regex.test(line));
    if (line) {
      const value = line.replace(removeWord, '').trim();
      return value;
    }
    return '';
  };

  // Fetch OCR data
  const fetchOcrData = () => {
    axios.get('https://ocr-detect-92zt.onrender.com/ocrData')
      .then(response => {
        setOcrData(response.data);
      })
      .catch(error => console.error(error));
  };

  // Handle create button click
  const handleCreate = () => {
    const identificationNumber = prompt('Enter Identification Number:');
    const name = prompt('Enter Name:');
    const lastName = prompt('Enter Last Name:');
    const dateOfBirth = prompt('Enter Date of Birth:');
    const dateOfIssue = prompt('Enter Date of Issue:');
    const dateOfExpiry = prompt('Enter Date of Expiry:');

    if (
      identificationNumber === null ||
      name === null ||
      lastName === null ||
      dateOfBirth === null ||
      dateOfIssue === null ||
      dateOfExpiry === null
    ) {
      return;
    }

    const identificationNumberExists = ocrData.some(data => data.identification_number === identificationNumber);

    if (identificationNumberExists) {
      alert('Identification number already exists. Please enter a different identification number.');
      return;
    }

    const newOcrData = {
      identification_number: identificationNumber,
      name: name,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      date_of_issue: dateOfIssue,
      date_of_expiry: dateOfExpiry,
    };

    axios.post('https://ocr-detect-92zt.onrender.com/ocrData', newOcrData)
      .then(response => {
        console.log(response.data.message);
        fetchOcrData();
      })
      .catch(error => console.error(error));
  };

  // Handle update button click
  const handleUpdate = (id) => {
    const dataToUpdate = ocrData.find(data => data._id === id);

    const updatedIdentificationNumber = prompt('Enter updated Identification Number:', dataToUpdate.identification_number);
    const updatedName = prompt('Enter updated Name:', dataToUpdate.name);
    const updatedLastName = prompt('Enter updated Last Name:', dataToUpdate.last_name);
    const updatedDateOfBirth = prompt('Enter updated Date of Birth:', dataToUpdate.date_of_birth);
    const updatedDateOfIssue = prompt('Enter updated Date of Issue:', dataToUpdate.date_of_issue);
    const updatedDateOfExpiry = prompt('Enter updated Date of Expiry:', dataToUpdate.date_of_expiry);

    if (
      updatedIdentificationNumber === null ||
      updatedName === null ||
      updatedLastName === null ||
      updatedDateOfBirth === null ||
      updatedDateOfIssue === null ||
      updatedDateOfExpiry === null
    ) {
      return;
    }

    const updatedData = {
      ...dataToUpdate,
      identification_number: updatedIdentificationNumber,
      name: updatedName,
      last_name: updatedLastName,
      date_of_birth: updatedDateOfBirth,
      date_of_issue: updatedDateOfIssue,
      date_of_expiry: updatedDateOfExpiry,
    };

    axios.put(`https://ocr-detect-92zt.onrender.com/ocrData/${id}`, updatedData)
      .then(response => {
        console.log(response.data.message);
        fetchOcrData();
      })
      .catch(error => console.error(error));
  };
console.log(extractedText);
  // Handle delete button click
  const handleDelete = (id) => {
    const confirmDeletion = window.confirm('Are you sure you want to delete this data?');

    if (confirmDeletion) {
      axios.delete(`https://ocr-detect-92zt.onrender.com/ocrData/${id}`)
        .then(response => {
          console.log(response.data.message);
          fetchOcrData();
        })
        .catch(error => console.error(error));
    }
  };

  return (
    <div className="container mt-5" style={{ backgroundColor: '#f8f9fa', fontFamily: 'Lucida Console", "Courier New", monospace' }}>
      <h1 className="mb-4 text-center" style={{ fontSize: '5rem' }}>ID Card OCR</h1>
      <div className="row">
        <div className="col-md-6 mb-3 pr-md-4">
          <h2>Uploaded Image:</h2>
          {imageUrl ? (
            <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '400px' }} />
          ) : (
            <div className="" style={{ backgroundColor: '#f4f4f4', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="text-primary">Select an image to upload</span>
            </div>
          )}
        </div>
        <div className="col-md-6 mb-5">
          <div style={{ padding: '0px 0px 0px 100px' }}>
            <h2>JSON Data:</h2>
            <pre style={{ fontSize: '16px', lineHeight: '2.6' }}>{JSON.stringify(jsonData, null, 2)}</pre>
          </div>
        </div>
      </div>

      <div className="mb-3 d-flex">
        <label className='btn btn-success' htmlFor="fileInput" style={{ padding: '10px', cursor: 'pointer', marginRight: '30px' }}>
          Choose File
        </label>
        <input
          type="file"
          accept="image/*"
          id="fileInput"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button className="btn btn-primary ms-2 flex-shrink-0" style={{ marginRight: '36px' }} onClick={handleUpload}>Upload and Process</button>
        <button className="btn btn-danger" onClick={handleClear}>Clear</button>
      </div>

      <div>
        <h2>History:</h2>
        <ul className="list-group">
          {ocrData.map(data => (
            <li key={data._id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div><strong>ID:</strong> {data._id}</div>
                  <div><strong>Identification Number:</strong> {data.identification_number}</div>
                  <div><strong>Name:</strong> {data.name}</div>
                  <div><strong>Last Name:</strong> {data.last_name}</div>
                  <div><strong>Date of Birth:</strong> {data.date_of_birth}</div>
                  <div><strong>Date of Issue:</strong> {data.date_of_issue}</div>
                  <div><strong>Date of Expiry:</strong> {data.date_of_expiry}</div>
                </div>
                <div className="d-flex flex-column align-items-end">
                  <button className="btn btn-warning mb-2" onClick={() => handleUpdate(data._id)}>Update</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(data._id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button className="btn btn-success mt-3" onClick={handleCreate}>Create</button>
      </div>
    </div>
  );
};

export default App;