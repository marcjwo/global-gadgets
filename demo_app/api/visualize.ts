import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

const visualizeRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini API
// NOTE: Requires GOOGLE_API_KEY environment variable
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Helper to get access token from Metadata Server (Cloud Run)
async function getGcpAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
      headers: { 'Metadata-Flavor': 'Google' }
    });
    if (!response.ok) return null;
    const data = await response.json() as { access_token: string };
    return data.access_token;
  } catch (e) {
    // console.warn('Could not fetch access token from metadata server (not on Cloud Run?):', e);
    return null;
  }
}

visualizeRouter.post('/', upload.single('roomImage'), async (req, res) => {
  try {
    const roomImageFile = req.file;
    const productImageUri = req.body.productImage;

    if (!roomImageFile) {
      return res.status(400).json({ error: 'No room image uploaded.' });
    }

    if (!productImageUri) {
      return res.status(400).json({ error: 'No product image URI provided.' });
    }

    console.log(`Visualize request: Room image size=${roomImageFile.size}, Product URI=${productImageUri}`);

    // 1. Fetch Product Image
    let productBase64 = '';
    let productMimeType = 'image/jpeg';

    try {
      // Convert mtls URL to standard URL for backend access
      let fetchUri = productImageUri;
      if (productImageUri.includes('storage.mtls.cloud.google.com')) {
        fetchUri = productImageUri.replace('storage.mtls.cloud.google.com', 'storage.googleapis.com');
      }

      console.log(`Fetching product image from: ${fetchUri}`);

      const token = await getGcpAccessToken();
      const headers: any = {};
      if (token) {
        console.log('Using GCP Access Token for GCS fetch');
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(fetchUri, { headers });

      if (!response.ok) throw new Error(`Failed to fetch product image: ${response.statusText}`);

      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type for product image: ${contentType}. Expected an image.`);
      }

      const arrayBuffer = await response.arrayBuffer();
      productBase64 = Buffer.from(arrayBuffer).toString('base64');
      if (contentType) productMimeType = contentType;

    } catch (err) {
      console.error('Error fetching product image:', err);
      return res.status(500).json({ error: 'Failed to fetch product image.', details: (err as Error).message });
    }

    // 2. Prepare Gemini Model
    // Use a model that supports image editing/generation. 
    // Note: As of late 2024, 'gemini-1.5-pro-002' or specific preview models are best for this.
    // We will try 'gemini-1.5-pro-002' as a safe default for advanced multimodal tasks.
    // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' });
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    // 3. Construct Prompt
    const prompt = "Place the product shown in the second image into the room shown in the first image. Make it look realistic and natural, matching the lighting and perspective of the room.";

    // 4. Call Gemini API
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: roomImageFile.buffer.toString('base64'),
          mimeType: roomImageFile.mimetype
        }
      },
      {
        inlineData: {
          data: productBase64,
          mimeType: productMimeType
        }
      }
    ]);

    const response = await result.response;
    // console.log('Gemini response:', JSON.stringify(response, null, 2)); // Debug logging

    // 5. Extract Image
    // The API returns generated images in inlineData or similar structure depending on the specific model version/capability.
    // For standard generateContent with image output, it often comes as inlineData in parts.

    // Check for candidates
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini.');
    }

    const candidate = response.candidates[0];
    const parts = candidate.content.parts;

    // Find the image part
    const imagePart = parts.find(part => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      // Fallback: Check if it returned text saying it can't do it
      const textPart = parts.find(part => part.text);
      if (textPart) {
        console.warn('Gemini returned text instead of image:', textPart.text);
        return res.status(422).json({ error: 'Model returned text instead of image. It might have refused the request.', details: textPart.text });
      }
      throw new Error('No image data found in Gemini response.');
    }

    // 6. Return Image
    const generatedImageBase64 = imagePart.inlineData.data;
    const generatedMimeType = imagePart.inlineData.mimeType || 'image/png';

    res.json({
      image: `data:${generatedMimeType};base64,${generatedImageBase64}`
    });

  } catch (error) {
    console.error('Error in /api/visualize:', error);
    res.status(500).json({ error: 'Internal server error during visualization.', details: (error as Error).message });
  }
});

export default visualizeRouter;
