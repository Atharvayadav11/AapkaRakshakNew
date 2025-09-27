require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Setup face-api.js with canvas
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

mongoose.connect('mongodb+srv://atharvayadav11:ashokvaishali@cluster0.twnwnbu.mongodb.net/NFCDatabase?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/users', userRoutes);

// Face comparison functionality
const MODEL_DIR = path.join(__dirname, 'face-api-models');
const WANTED_IMAGES_DIR = path.join(__dirname, 'wanted_images');

// Global variables
let wantedImagesCache = [];
let modelsLoaded = false;
let wantedImagesLoaded = false;

// Load face-api models (only when needed)
async function loadModels() {
  if (modelsLoaded) return;
  
  try {
    console.log('Loading face-api models...');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_DIR);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_DIR);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_DIR);
    modelsLoaded = true;
    console.log('Face-api models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api models:', error);
    throw error;
  }
}

// Enhanced image loading with better error handling
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const request = protocol.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Load image from URL or base64
async function loadImageFromUrl(imageInput) {
  try {
    console.log('Loading image from:', imageInput?.substring(0, 100) + '...');
    
    // Check if it's a base64 image
    if (imageInput.startsWith('data:image/')) {
      console.log('Loading base64 image');
      const img = await canvas.loadImage(imageInput);
      return img;
    }
    
    // Check if it's a valid URL
    try {
      new URL(imageInput);
    } catch (e) {
      throw new Error('Invalid URL format');
    }
    
    // Download and load image
    console.log('Downloading image from URL');
    const imageBuffer = await downloadImage(imageInput);
    const img = await canvas.loadImage(imageBuffer);
    console.log('Image loaded successfully');
    return img;
    
  } catch (error) {
    console.error('Error loading image:', error.message);
    throw new Error(`Failed to load image: ${error.message}`);
  }
}

// Load wanted images (only when face comparison is requested)
async function loadWantedImages() {
  if (wantedImagesLoaded) {
    console.log(`Using cached wanted images: ${wantedImagesCache.length} images`);
    return wantedImagesCache;
  }

  try {
    console.log('Loading wanted images from:', WANTED_IMAGES_DIR);
    
    // Check if directory exists
    try {
      await fs.access(WANTED_IMAGES_DIR);
    } catch (error) {
      console.error('Wanted images directory does not exist:', WANTED_IMAGES_DIR);
      wantedImagesLoaded = true; // Mark as loaded to avoid repeated attempts
      return [];
    }
    
    const files = await fs.readdir(WANTED_IMAGES_DIR);
    const wantedImages = [];
    
    console.log(`Found ${files.length} files in wanted images directory`);
    
    for (const file of files) {
      if (file.match(/\.(jpg|jpeg|png)$/i)) {
        try {
          console.log(`Processing wanted image: ${file}`);
          const filePath = path.join(WANTED_IMAGES_DIR, file);
          const img = await canvas.loadImage(filePath);
          const detection = await faceapi.detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          
          if (detection) {
            wantedImages.push({
              name: file.replace(/\.[^/.]+$/, ""),
              descriptor: detection.descriptor
            });
            console.log(`Successfully processed: ${file}`);
          } else {
            console.log(`No face detected in: ${file}`);
          }
        } catch (error) {
          console.error(`Error processing ${file}:`, error.message);
        }
      }
    }
    
    wantedImagesCache = wantedImages;
    wantedImagesLoaded = true;
    console.log(`Successfully loaded ${wantedImages.length} wanted images with faces`);
    return wantedImages;
  } catch (error) {
    console.error('Error loading wanted images:', error);
    wantedImagesLoaded = true; // Mark as loaded to avoid repeated attempts
    return [];
  }
}

// Face comparison endpoint
app.post('/compare-faces', async (req, res) => {
  try {
    console.log('Face comparison request received');
    const { image1 } = req.body;

    if (!image1) {
      return res.status(400).json({ 
        error: 'Please provide image URL or base64 data in image1 field' 
      });
    }

    // Load models if not already loaded
    if (!modelsLoaded) {
      console.log('Models not loaded, loading now...');
      await loadModels();
    }

    console.log('Detecting face in input image');
    const img1 = await loadImageFromUrl(image1);
    const detection1 = await faceapi.detectSingleFace(img1)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection1) {
      console.log('No face detected in input image');
      return res.json({ 
        result: 'Blue', 
        message: 'No face detected in provided image' 
      });
    }

    console.log('Face detected, loading wanted images...');
    // Load wanted images only when needed
    const wantedImages = await loadWantedImages();
    
    if (wantedImages.length === 0) {
      console.log('No wanted images available for comparison');
      return res.json({
        result: 'Blue',
        message: 'No wanted images available for comparison'
      });
    }

    console.log(`Comparing with ${wantedImages.length} wanted images`);
    const threshold = 0.6;
    
    let bestMatch = null;
    let minDistance = Infinity;

    for (const wanted of wantedImages) {
      const distance = faceapi.euclideanDistance(detection1.descriptor, wanted.descriptor);
      
      if (distance < threshold && distance < minDistance) {
        minDistance = distance;
        bestMatch = wanted;
      }
    }

    if (bestMatch) {
      const confidence = ((1 - minDistance) * 100).toFixed(2);
      console.log(`Match found: ${bestMatch.name}, confidence: ${confidence}%`);
      res.json({
        result: 'Red',
        message: `Match found with ${bestMatch.name}. Confidence: ${confidence}%`,
        matchedName: bestMatch.name,
        confidence: confidence
      });
    } else {
      console.log('No match found');
      res.json({
        result: 'Blue',
        message: 'No match found in wanted list'
      });
    }

  } catch (error) {
    console.error('Error in face comparison:', error);
    res.status(500).json({ 
      error: 'Face comparison failed', 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    modelsLoaded: modelsLoaded,
    wantedImagesLoaded: wantedImagesLoaded,
    wantedImagesCount: wantedImagesCache.length
  });
});

// Endpoint to manually preload wanted images (optional)
app.post('/preload-wanted-images', async (req, res) => {
  try {
    if (!modelsLoaded) {
      await loadModels();
    }
    const wantedImages = await loadWantedImages();
    res.json({
      message: 'Wanted images loaded successfully',
      count: wantedImages.length
    });
  } catch (error) {
    console.error('Error preloading wanted images:', error);
    res.status(500).json({
      error: 'Failed to preload wanted images',
      details: error.message
    });
  }
});

// Start server (no image processing during startup)
async function startServer() {
  try {
    console.log('Starting server...');
    
    // Only check if directories exist, don't load anything
    if (!await fs.access(MODEL_DIR).then(() => true).catch(() => false)) {
      console.error(`Models directory not found: ${MODEL_DIR}`);
      process.exit(1);
    }
    
    if (!await fs.access(WANTED_IMAGES_DIR).then(() => true).catch(() => false)) {
      console.warn(`Wanted images directory not found: ${WANTED_IMAGES_DIR}`);
      console.warn('Face comparison will not work until wanted images are available');
    }
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Face comparison API ready!');
      console.log('Models and images will be loaded when first face comparison is requested');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();