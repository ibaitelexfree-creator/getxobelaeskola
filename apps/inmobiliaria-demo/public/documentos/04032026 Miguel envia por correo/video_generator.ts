// ============================================
// PROPERTYAI - VIDEO GENERATOR v1.0
// ============================================
// Genera videos verticales (Reels/TikTok/Shorts)
// a partir de fotos de propiedades
// ============================================

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TYPES
// ============================================

interface VideoConfig {
  photos: string[];           // URLs o paths de las fotos
  propertyData: {
    title: string;
    neighborhood: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    size_sqm: number;
    price: string;            // Ya formateado: "320.000 €"
    amenities: string[];
  };
  agencyLogo: string;         // URL o path del logo
  agencyName: string;
  musicTrack?: string;        // Path a música de fondo
  template?: 'modern' | 'luxury' | 'minimal' | 'dynamic';
  duration?: number;          // Duración total en segundos (default: 20)
}

interface VideoResult {
  videoPath: string;
  thumbnailPath: string;
  duration: number;
  resolution: string;
  fileSize: number;
}

// ============================================
// CONFIGURATION
// ============================================

const config = {
  outputDir: process.env.VIDEO_OUTPUT_DIR || '/tmp/propertyai-videos',
  musicDir: process.env.MUSIC_DIR || './assets/music',
  fontsDir: process.env.FONTS_DIR || './assets/fonts',
  resolution: {
    width: 1080,
    height: 1920,
  },
  fps: 30,
  photoDuration: 3,        // Segundos por foto
  transitionDuration: 0.5, // Segundos de transición
};

// ============================================
// MUSIC LIBRARY
// ============================================

const musicLibrary: Record<string, string[]> = {
  luxury: [
    'elegant-piano-1.mp3',
    'sophisticated-ambient.mp3',
    'luxury-lifestyle.mp3',
  ],
  modern: [
    'lofi-chill-1.mp3',
    'minimal-beats.mp3',
    'urban-vibe.mp3',
  ],
  minimal: [
    'soft-ambient.mp3',
    'clean-corporate.mp3',
  ],
  dynamic: [
    'upbeat-pop.mp3',
    'energetic-electronic.mp3',
  ],
};

function selectMusic(template: string): string {
  const tracks = musicLibrary[template] || musicLibrary['modern'];
  const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
  return path.join(config.musicDir, randomTrack);
}

// ============================================
// TEXT OVERLAYS
// ============================================

interface TextOverlay {
  text: string;
  startTime: number;
  duration: number;
  position: 'top' | 'center' | 'bottom';
  fontSize: number;
  fontColor: string;
  backgroundColor?: string;
  animation?: 'fade' | 'slide' | 'none';
}

function generateTextOverlays(data: VideoConfig['propertyData'], totalDuration: number): TextOverlay[] {
  const overlays: TextOverlay[] = [];
  
  // Intro (0-2s)
  overlays.push({
    text: 'NUEVA PROPIEDAD',
    startTime: 0,
    duration: 2,
    position: 'top',
    fontSize: 48,
    fontColor: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    animation: 'fade',
  });
  
  // Ubicación (2-5s)
  overlays.push({
    text: `📍 ${data.neighborhood}, ${data.city}`,
    startTime: 2,
    duration: 3,
    position: 'bottom',
    fontSize: 42,
    fontColor: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    animation: 'slide',
  });
  
  // Características (5-10s)
  overlays.push({
    text: `${data.bedrooms} hab · ${data.bathrooms} baños · ${data.size_sqm}m²`,
    startTime: 5,
    duration: 4,
    position: 'bottom',
    fontSize: 38,
    fontColor: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    animation: 'slide',
  });
  
  // Amenities destacados (10-14s)
  if (data.amenities.length > 0) {
    const amenitiesText = data.amenities.slice(0, 3).map(a => `✓ ${a}`).join('  ');
    overlays.push({
      text: amenitiesText,
      startTime: 10,
      duration: 4,
      position: 'bottom',
      fontSize: 32,
      fontColor: 'white',
      backgroundColor: 'rgba(0,0,0,0.5)',
      animation: 'fade',
    });
  }
  
  // Precio (14-18s)
  overlays.push({
    text: `💰 ${data.price}`,
    startTime: totalDuration - 6,
    duration: 4,
    position: 'center',
    fontSize: 64,
    fontColor: 'white',
    backgroundColor: 'rgba(0,0,0,0.7)',
    animation: 'fade',
  });
  
  // Call to action (18-20s)
  overlays.push({
    text: 'Link en bio 👆',
    startTime: totalDuration - 2,
    duration: 2,
    position: 'bottom',
    fontSize: 36,
    fontColor: 'white',
    animation: 'fade',
  });
  
  return overlays;
}

// ============================================
// FFMPEG FILTER BUILDERS
// ============================================

function buildZoomPanFilter(photoIndex: number, duration: number): string {
  // Ken Burns effect - zoom lento
  const zoomStart = 1.0;
  const zoomEnd = 1.1;
  const zoomDelta = (zoomEnd - zoomStart) / (duration * config.fps);
  
  // Alternar dirección del pan
  const directions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  const direction = directions[photoIndex % directions.length];
  
  let x = 0, y = 0;
  switch (direction) {
    case 'top-left':
      x = 0; y = 0;
      break;
    case 'top-right':
      x = config.resolution.width * 0.1; y = 0;
      break;
    case 'bottom-left':
      x = 0; y = config.resolution.height * 0.1;
      break;
    case 'bottom-right':
      x = config.resolution.width * 0.1; y = config.resolution.height * 0.1;
      break;
  }
  
  return `zoompan=z='${zoomStart}+${zoomDelta}*in':x='${x}':y='${y}':d=${duration * config.fps}:s=${config.resolution.width}x${config.resolution.height}:fps=${config.fps}`;
}

function buildTextOverlayFilter(overlay: TextOverlay, index: number): string {
  let y: string;
  switch (overlay.position) {
    case 'top':
      y = '100';
      break;
    case 'center':
      y = '(h-text_h)/2';
      break;
    case 'bottom':
      y = 'h-text_h-150';
      break;
  }
  
  // Escapar caracteres especiales para FFmpeg
  const escapedText = overlay.text
    .replace(/'/g, "'\\''")
    .replace(/:/g, '\\:');
  
  let filter = `drawtext=text='${escapedText}'`;
  filter += `:fontsize=${overlay.fontSize}`;
  filter += `:fontcolor=${overlay.fontColor}`;
  filter += `:x=(w-text_w)/2:y=${y}`;
  filter += `:enable='between(t,${overlay.startTime},${overlay.startTime + overlay.duration})'`;
  
  // Box background
  if (overlay.backgroundColor) {
    filter += `:box=1:boxcolor=${overlay.backgroundColor}:boxborderw=20`;
  }
  
  return filter;
}

// ============================================
// MAIN VIDEO GENERATOR
// ============================================

export async function generatePropertyVideo(videoConfig: VideoConfig): Promise<VideoResult> {
  const videoId = uuidv4();
  const outputPath = path.join(config.outputDir, `${videoId}.mp4`);
  const thumbnailPath = path.join(config.outputDir, `${videoId}_thumb.jpg`);
  
  // Asegurar que el directorio existe
  await fs.mkdir(config.outputDir, { recursive: true });
  
  // Calcular duración total
  const photoDuration = videoConfig.duration 
    ? videoConfig.duration / videoConfig.photos.length 
    : config.photoDuration;
  const totalDuration = photoDuration * videoConfig.photos.length;
  
  // Seleccionar música
  const musicPath = videoConfig.musicTrack || selectMusic(videoConfig.template || 'modern');
  
  // Generar overlays de texto
  const textOverlays = generateTextOverlays(videoConfig.propertyData, totalDuration);
  
  return new Promise((resolve, reject) => {
    let command = ffmpeg();
    
    // Añadir cada foto como input
    videoConfig.photos.forEach((photo, index) => {
      command = command.input(photo);
    });
    
    // Añadir música
    command = command.input(musicPath);
    
    // Construir filtro complejo
    const filterParts: string[] = [];
    const photoOutputs: string[] = [];
    
    // Procesar cada foto con zoom/pan y escalar
    videoConfig.photos.forEach((_, index) => {
      const zoomFilter = buildZoomPanFilter(index, photoDuration);
      filterParts.push(`[${index}:v]${zoomFilter},setpts=PTS-STARTPTS[v${index}]`);
      photoOutputs.push(`[v${index}]`);
    });
    
    // Concatenar videos con transiciones
    const concatInput = photoOutputs.join('');
    filterParts.push(`${concatInput}concat=n=${videoConfig.photos.length}:v=1:a=0[vconcat]`);
    
    // Añadir overlays de texto
    let lastOutput = 'vconcat';
    textOverlays.forEach((overlay, index) => {
      const textFilter = buildTextOverlayFilter(overlay, index);
      const outputName = `vtext${index}`;
      filterParts.push(`[${lastOutput}]${textFilter}[${outputName}]`);
      lastOutput = outputName;
    });
    
    // Añadir logo en esquina
    if (videoConfig.agencyLogo) {
      // Asumimos que el logo se añade como último input
      command = command.input(videoConfig.agencyLogo);
      const logoInput = videoConfig.photos.length + 1; // +1 por la música
      filterParts.push(`[${logoInput}:v]scale=150:-1[logo]`);
      filterParts.push(`[${lastOutput}][logo]overlay=W-w-30:30[vfinal]`);
      lastOutput = 'vfinal';
    }
    
    // Audio: fade in/out y ajustar duración
    const audioInput = videoConfig.photos.length; // Índice del input de música
    filterParts.push(`[${audioInput}:a]afade=t=in:st=0:d=1,afade=t=out:st=${totalDuration - 1}:d=1,atrim=0:${totalDuration}[aout]`);
    
    // Aplicar filtro complejo
    command
      .complexFilter(filterParts.join(';'), [lastOutput, 'aout'])
      .outputOptions([
        '-map', `[${lastOutput}]`,
        '-map', '[aout]',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-pix_fmt', 'yuv420p',
        '-r', String(config.fps),
      ])
      .output(outputPath)
      .on('start', (cmd) => {
        console.log('FFmpeg command:', cmd);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${Math.round(progress.percent || 0)}%`);
      })
      .on('end', async () => {
        try {
          // Generar thumbnail
          await generateThumbnail(outputPath, thumbnailPath);
          
          // Obtener info del archivo
          const stats = await fs.stat(outputPath);
          
          resolve({
            videoPath: outputPath,
            thumbnailPath,
            duration: totalDuration,
            resolution: `${config.resolution.width}x${config.resolution.height}`,
            fileSize: stats.size,
          });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .run();
  });
}

// ============================================
// THUMBNAIL GENERATOR
// ============================================

async function generateThumbnail(videoPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['10%'],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: `${config.resolution.width}x${config.resolution.height}`,
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
}

// ============================================
// SIMPLIFIED VIDEO (fallback si FFmpeg complejo falla)
// ============================================

export async function generateSimpleSlideshow(
  photos: string[],
  outputPath: string,
  duration: number = 20
): Promise<string> {
  const photoDuration = duration / photos.length;
  
  return new Promise((resolve, reject) => {
    let command = ffmpeg();
    
    // Añadir fotos
    photos.forEach(photo => {
      command = command.input(photo).inputOptions(['-loop', '1', '-t', String(photoDuration)]);
    });
    
    // Concatenar con transiciones simples
    const filterInputs = photos.map((_, i) => `[${i}:v]`).join('');
    const filter = `${filterInputs}concat=n=${photos.length}:v=1:a=0,format=yuv420p[out]`;
    
    command
      .complexFilter(filter, 'out')
      .outputOptions([
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '28',
        '-pix_fmt', 'yuv420p',
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
}

// ============================================
// EXAMPLE USAGE
// ============================================

/*
import { generatePropertyVideo } from './video_generator';

const result = await generatePropertyVideo({
  photos: [
    '/uploads/photo1.jpg',
    '/uploads/photo2.jpg',
    '/uploads/photo3.jpg',
    '/uploads/photo4.jpg',
    '/uploads/photo5.jpg',
  ],
  propertyData: {
    title: 'Piso en Eixample',
    neighborhood: 'Eixample',
    city: 'Barcelona',
    bedrooms: 3,
    bathrooms: 2,
    size_sqm: 85,
    price: '320.000 €',
    amenities: ['Reformado', 'Aire acondicionado', 'Ascensor'],
  },
  agencyLogo: '/assets/logos/agency.png',
  agencyName: 'Tu Agencia',
  template: 'modern',
  duration: 20,
});

console.log('Video generado:', result.videoPath);
console.log('Thumbnail:', result.thumbnailPath);
console.log('Duración:', result.duration, 'segundos');
console.log('Tamaño:', (result.fileSize / 1024 / 1024).toFixed(2), 'MB');
*/
