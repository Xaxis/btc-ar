/**
 * Camera utilities for real-time video capture
 */

export interface CameraStream {
  stream: MediaStream;
  video: HTMLVideoElement;
}

export async function initializeCamera(): Promise<CameraStream> {
  console.log('📷 Initializing camera...');
  
  try {
    // Request high-resolution camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        facingMode: 'environment' // Back camera on mobile
      },
      audio: false
    });

    // Create video element
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    // Wait for video to be ready
    await new Promise((resolve) => {
      video.addEventListener('loadedmetadata', resolve);
    });

    console.log('✅ Camera initialized:', video.videoWidth, 'x', video.videoHeight);
    
    return { stream, video };
    
  } catch (error) {
    console.error('❌ Camera initialization failed:', error);
    throw new Error('Failed to access camera');
  }
}

export function stopCamera(stream: MediaStream) {
  stream.getTracks().forEach(track => track.stop());
}
