const Complaint = require('../models/complaint');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.submitComplaint = async (req, res) => {
  try {
    console.log('Received complaint submission:', req.body);
    console.log('File:', req.file);

    const { category, description, anonymous, location } = req.body;
    const imagePath = req.file ? req.file.path : '';

    console.log('Analyzing complaint with Gemini...');
    const geminiAnalysis = await analyzeComplaintWithGemini(description, imagePath);
    console.log('Gemini analysis result:', geminiAnalysis);

    // Save the complaint to the database
    const complaint = new Complaint({
      category,
      description,
      anonymous: anonymous === 'true',
      image: imagePath,
      location: JSON.parse(location),  // Parse the location string to JSON
      geminiAnalysis,
    });

    console.log('Saving complaint to database...');
    await complaint.save();
    console.log('Complaint saved successfully');

    res.status(201).json({ message: 'Complaint registered successfully', complaint });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({
      message: 'Error submitting complaint',
      error: error.message,
      stack: error.stack,
    });
  }
};

async function analyzeComplaintWithGemini(description, imagePath) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let imageData = null;
    if (imagePath) {
      console.log('Reading image file:', imagePath);
      const imageBuffer = fs.readFileSync(imagePath);
      imageData = {
        inlineData: {
          data: imageBuffer.toString('base64'),  // Convert image to Base64
          mimeType: 'image/jpeg',  // Adjust based on your image type (e.g., png, jpg)
        },
      };
    }

    // Construct the prompt for Gemini API
    const prompt = `Analyze this complaint:
    Description: ${description}

    Tasks:
    1. If an image is provided, describe it in detail.
    2. Determine if the image (if provided) matches the description.
    3. Assess the authenticity and seriousness of the complaint.
    4. Categorize the incident level as: Low Priority, Medium Priority, High Priority, or Very High Priority.
    5. Provide any additional relevant details or insights.

    Format your response as a JSON object with these keys: imageDescription, descriptionMatch, incidentLevel, additionalDetails`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent([prompt, imageData]);

    // Check if result and response are valid
    if (!result || !result.response) {
      throw new Error('Invalid response from Gemini API');
    }

    const responseText = await result.response.text();
    console.log('Gemini API response:', responseText);

    const pdata = responseText.replace(/```json\s*|\s*```/g, '').trim();

    try {
      return JSON.parse(pdata);  // Parse the JSON response from Gemini
    } catch (jsonError) {
      console.error('Error parsing Gemini API response:', jsonError);
      return { error: 'Failed to parse response from Gemini API' };
    }
  } catch (error) {
    console.error('Error in Gemini analysis:', error);
    return { error: error.message };  // Return error as part of the analysis result
  }
}

