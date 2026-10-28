const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directories exist
const uploadsDir = path.join(__dirname, 'data', 'uploads');
const videosDir = path.join(__dirname, 'data', 'videos');
[uploadsDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// AI Models catalog
const MODELS = [
  {
    id: 'sora-2',
    name: 'Sora 2 (OpenAI)',
    description: 'Ultra-realistic cinematic video generation with advanced physics simulation',
    capabilities: ['photorealistic', 'cinematic', 'physics-accurate', 'multi-scene'],
    maxDuration: 60,
    resolutions: ['720p', '1080p', '4K'],
    fps: [24, 30, 60],
    style: 'cinematic'
  },
  {
    id: 'runway-gen4',
    name: 'Runway Gen-4',
    description: 'Creative motion design with keyframe control and style transfer',
    capabilities: ['motion-design', 'style-transfer', 'keyframes', 'green-screen'],
    maxDuration: 40,
    resolutions: ['720p', '1080p'],
    fps: [24, 30],
    style: 'creative'
  },
  {
    id: 'pika-2',
    name: 'Pika 2.0',
    description: 'Fast generation with lip-sync, sound effects, and scene expansion',
    capabilities: ['lip-sync', 'sound-effects', 'scene-expand', 'fast'],
    maxDuration: 30,
    resolutions: ['720p', '1080p'],
    fps: [24, 30],
    style: 'animated'
  },
  {
    id: 'kling-2',
    name: 'Kling 2.0 (Kuaishou)',
    description: 'Long-form video with complex multi-character interaction',
    capabilities: ['long-form', 'multi-character', 'complex-motion', '1080p-native'],
    maxDuration: 120,
    resolutions: ['720p', '1080p', '4K'],
    fps: [24, 30, 60],
    style: 'realistic'
  },
  {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    description: 'Artistic video with camera control and physics-based animation',
    capabilities: ['camera-control', 'physics', 'artistic', 'text-to-video'],
    maxDuration: 30,
    resolutions: ['720p', '1080p'],
    fps: [24, 30],
    style: 'artistic'
  },
  {
    id: 'minimax-hailuo',
    name: 'MiniMax Hailuo 02',
    description: 'High-fidelity video with natural human movement and expressions',
    capabilities: ['human-motion', 'expressions', 'high-fidelity', 'multi-shot'],
    maxDuration: 60,
    resolutions: ['720p', '1080p'],
    fps: [24, 30],
    style: 'realistic'
  },
  {
    id: 'vidu-2',
    name: 'Vidu 2.0 (Shengshu)',
    description: 'Consistent character generation with reference image fidelity',
    capabilities: ['character-consistency', 'reference-fidelity', 'multi-view'],
    maxDuration: 45,
    resolutions: ['720p', '1080p'],
    fps: [24, 30],
    style: 'consistent'
  },
  {
    id: 'hunyuan-video',
    name: 'Hunyuan Video (Tencent)',
    description: 'Open-source quality with excellent text rendering in video',
    capabilities: ['text-rendering', 'open-source', 'high-quality', 'fast'],
    maxDuration: 30,
    resolutions: ['720p', '1080p'],
    fps: [24, 30],
    style: 'versatile'
  },
  {
    id: 'cogvideo-x',
    name: 'CogVideoX (Zhipu)',
    description: 'Open-source diffusion with strong prompt adherence',
    capabilities: ['open-source', 'prompt-adherence', 'diffusion', 'research'],
    maxDuration: 30,
    resolutions: ['720p', '1080p'],
    fps: [24, 30],
    style: 'research'
  },
  {
    id: 'wan-2',
    name: 'Wan 2.0 (Alibaba)',
    description: 'High-resolution generation with temporal consistency',
    capabilities: ['high-res', 'temporal-consistency', 'long-sequence'],
    maxDuration: 90,
    resolutions: ['720p', '1080p', '4K'],
    fps: [24, 30, 60],
    style: 'high-quality'
  }
];

// NSFW Content Presets
const NSFW_PRESETS = {
  'romantic': {
    label: 'Romantic/Intimate',
    keywords: 'soft lighting, gentle movements, close-up, warm tones, intimate atmosphere',
    palette: ['#ff6b9d', '#c44569', '#f8a5c2', '#feca57'],
    motion: 'slow-gentle'
  },
  'sensual': {
    label: 'Sensual/Artistic',
    keywords: 'dramatic lighting, flowing fabric, slow motion, shadow play, artistic nude',
    palette: ['#6c5ce7', '#a29bfe', '#fd79a8', '#e17055'],
    motion: 'flowing'
  },
  'explicit': {
    label: 'Explicit/Graphic',
    keywords: 'detailed anatomy, realistic skin, dynamic movement, close-up detail, explicit',
    palette: ['#e74c3c', '#c0392b', '#ff7675', '#d63031'],
    motion: 'dynamic'
  },
  'erotic-dance': {
    label: 'Erotic Dance',
    keywords: 'rhythmic movement, body isolations, floor work, expressive, musical',
    palette: ['#00cec9', '#81ecec', '#fdcb6e', '#e17055'],
    motion: 'rhythmic'
  },
  'fetish': {
    label: 'Fetish/Kink',
    keywords: 'leather, silk, bondage aesthetics, power dynamics, dramatic contrast',
    palette: ['#2d3436', '#636e72', '#d63031', '#fdcb6e'],
    motion: 'controlled'
  },
  'fantasy': {
    label: 'Fantasy/Erotic Art',
    keywords: 'ethereal, magical lighting, impossible physics, surreal, dreamlike',
    palette: ['#00b894', '#55efc4', '#fd79a8', '#a29bfe'],
    motion: 'ethereal'
  }
};

// Camera movements
const CAMERA_MOVES = [
  'static', 'pan-left', 'pan-right', 'pan-up', 'pan-down',
  'dolly-in', 'dolly-out', 'orbit-ccw', 'orbit-cw',
  'crane-up', 'crane-down', 'handheld', 'steadicam',
  'zoom-in', 'zoom-out', 'rack-focus', 'whip-pan'
];

// Generate video using canvas + ffmpeg
async function generateVideo(params, videoId) {
  const {
    prompt,
    model = 'sora-2',
    duration = 10,
    resolution = '720p',
    fps = 24,
    cameraMove = 'dolly-in',
    style = 'cinematic',
    nsfwPreset = 'romantic',
    referenceImage = null,
    aspectRatio = '16:9',
    seed = Math.floor(Math.random() * 999999),
    negativePrompt = ''
  } = params;

  const width = resolution === '4K' ? 3840 : resolution === '1080p' ? 1920 : 1280;
  const height = aspectRatio === '9:16' ? Math.round(width * 9 / 16) :
                 aspectRatio === '1:1' ? width :
                 aspectRatio === '21:9' ? Math.round(width * 9 / 21) :
                 Math.round(width * 9 / 16);

  const totalFrames = duration * fps;
  const preset = NSFW_PRESETS[nsfwPreset] || NSFW_PRESETS['romantic'];
  const modelInfo = MODELS.find(m => m.id === model) || MODELS[0];

  // Load reference image if provided
  let refImageData = null;
  if (referenceImage && fs.existsSync(referenceImage)) {
    try {
      refImageData = fs.readFileSync(referenceImage);
    } catch (e) {
      refImageData = null;
    }
  }

  // Create video file
  const videoPath = path.join(videosDir, `${videoId}.mp4`);

  // Use ffmpeg to generate video from raw frames
  const { spawn } = require('child_process');

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-s', `${width}x${height}`,
    '-pix_fmt', 'rgb24',
    '-r', `${fps}`,
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    videoPath
  ]);

  let frameIndex = 0;
  let error = null;

  ffmpeg.stderr.on('data', (data) => {
    // Ignore ffmpeg warnings
  });

  ffmpeg.on('error', (err) => { error = err; });

  // Generate frames
  function generateFrame(frameNum, totalFrames) {
    const t = frameNum / totalFrames;
    const tAbs = frameNum / fps; // absolute time in seconds

    const buffer = Buffer.alloc(width * height * 3);

    // Parse prompt for scene elements
    const promptLower = prompt.toLowerCase();
    const hasWater = promptLower.includes('water') || promptLower.includes('ocean') || promptLower.includes('rain');
    const hasFire = promptLower.includes('fire') || promptLower.includes('flame') || promptLower.includes('lava');
    const hasNight = promptLower.includes('night') || promptLower.includes('dark') || promptLower.includes('moon');
    const hasSunset = promptLower.includes('sunset') || promptLower.includes('dusk') || promptLower.includes('golden hour');
    const hasForest = promptLower.includes('forest') || promptLower.includes('tree') || promptLower.includes('nature');
   
