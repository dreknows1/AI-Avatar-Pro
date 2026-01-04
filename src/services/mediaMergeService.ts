
/**
 * Service to merge Audio with Images or Videos to create exportable MP4s.
 * Uses browser native MediaRecorder and Web Audio API.
 */

export const mergeAudioAndImage = async (
  base64Image: string,
  base64Audio: string,
  onProgress?: (msg: string) => void
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (onProgress) onProgress("Loading assets...");

      // 1. Prepare Audio
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await decodeAudio(base64Audio, audioCtx);
      
      // 2. Prepare Image
      const img = new Image();
      img.src = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
      await new Promise((r) => { img.onload = r; });

      // 3. Setup Canvas (Video Track)
      // Standardize to a social-friendly resolution
      const width = img.naturalWidth % 2 === 0 ? img.naturalWidth : img.naturalWidth - 1;
      const height = img.naturalHeight % 2 === 0 ? img.naturalHeight : img.naturalHeight - 1;
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Draw initial frame
      ctx.drawImage(img, 0, 0, width, height);

      // 4. Setup Audio Stream
      const dest = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(dest);
      // We don't connect to destination here to avoid double-playing during export, 
      // but we need to keep the context running.
      
      // 5. Create MediaRecorder
      const canvasStream = canvas.captureStream(30); // 30 FPS
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      const chunks: Blob[] = [];
      // Try H.264 (mp4) first for best social compatibility, fall back to webm
      let mimeType = 'video/webm;codecs=vp9';
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        mimeType = 'video/webm;codecs=h264';
      }

      const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 2500000 });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
        // Cleanup
        audioCtx.close();
      };

      // 6. Animation Loop (Keep canvas alive)
      let animationId: number;
      const draw = () => {
        ctx.drawImage(img, 0, 0, width, height);
        animationId = requestAnimationFrame(draw);
      };

      // 7. Start Recording
      if (onProgress) onProgress("Rendering video...");
      draw(); // Start loop
      recorder.start();
      source.start();

      source.onended = () => {
        recorder.stop();
        cancelAnimationFrame(animationId);
      };

    } catch (e) {
      reject(e);
    }
  });
};

export const mergeAudioAndVideo = async (
  videoUrl: string,
  base64Audio: string,
  onProgress?: (msg: string) => void
): Promise<Blob> => {
    // This is more complex without FFmpeg because we need to sync two time-based media.
    // Approach: Play video in hidden element, draw to canvas, record canvas + new audio.
    // Video will loop if audio is longer.
    
    return new Promise(async (resolve, reject) => {
        try {
            if (onProgress) onProgress("Preparing media...");

            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioBuffer = await decodeAudio(base64Audio, audioCtx);

            const video = document.createElement('video');
            video.src = videoUrl;
            video.crossOrigin = 'anonymous';
            video.muted = true; // We use new audio
            video.loop = true;
            video.playsInline = true;
            
            await video.play(); // Start playing to get dims
            video.pause();

            const width = video.videoWidth;
            const height = video.videoHeight;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("No ctx");

            // Audio setup
            const dest = audioCtx.createMediaStreamDestination();
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(dest);

            const canvasStream = canvas.captureStream(30);
            const combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...dest.stream.getAudioTracks()
            ]);

            let mimeType = 'video/mp4';
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

            const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 2500000 });
            const chunks: Blob[] = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                video.pause();
                video.src = '';
                resolve(new Blob(chunks, { type: mimeType }));
                audioCtx.close();
            };

            // Draw loop
            let animationId: number;
            const draw = () => {
                ctx.drawImage(video, 0, 0, width, height);
                animationId = requestAnimationFrame(draw);
            }

            if (onProgress) onProgress("Mixing audio and video...");
            
            draw();
            recorder.start();
            source.start();
            video.play();

            // Stop when AUDIO ends
            source.onended = () => {
                recorder.stop();
                cancelAnimationFrame(animationId);
            };

        } catch (e) {
            reject(e);
        }
    });
};

// Helper: Decode Raw PCM Audio (Gemini Format: 16-bit Little Endian, 24kHz)
async function decodeAudio(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Convert PCM 16-bit to Float32
  const float32Array = new Float32Array(len / 2);
  const dataView = new DataView(bytes.buffer);
  
  for (let i = 0; i < len / 2; i++) {
    // Little-endian
    const int16 = dataView.getInt16(i * 2, true); 
    // Normalize to [-1, 1]
    float32Array[i] = int16 / 32768.0;
  }

  // Create buffer at 24kHz (Gemini Standard)
  const buffer = ctx.createBuffer(1, float32Array.length, 24000);
  buffer.getChannelData(0).set(float32Array);
  return buffer;
}

// Helper: Share File
export const shareFile = async (blob: Blob, filename: string, title: string, text: string) => {
    const file = new File([blob], filename, { type: blob.type });
    
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                title: title,
                text: text,
                files: [file]
            });
            return true;
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Share failed:", err);
            }
            return false;
        }
    } else {
        // Fallback to download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        return false;
    }
};
