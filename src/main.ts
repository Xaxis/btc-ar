/**
 * SIMPLE TEST - Just get overlay working first
 */

class SimpleTest {
  private videoElement: HTMLVideoElement | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;

  async initialize(): Promise<void> {
    console.log('🧪 SIMPLE TEST - Starting basic overlay test');

    try {
      // FIRST: Hide the loading screen
      const loading = document.getElementById('loading');
      if (loading) {
        loading.style.display = 'none';
        console.log('✅ Loading screen hidden');
      }

      // Get DOM elements
      this.videoElement = document.getElementById('video') as HTMLVideoElement;
      this.overlayCanvas = document.getElementById('overlay') as HTMLCanvasElement;

      if (!this.videoElement || !this.overlayCanvas) {
        console.error('❌ DOM elements not found');
        this.showError('DOM elements not found');
        return;
      }

      console.log('✅ DOM elements found');

      // Get camera
      console.log('📷 Requesting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });

      this.videoElement.srcObject = stream;
      await this.videoElement.play();

      console.log('✅ Camera working');

      // Setup overlay
      this.setupOverlay();

      // Start simple test
      this.startTest();

      console.log('✅ Test started - you should see shapes on screen');

    } catch (error) {
      console.error('❌ Test failed:', error);
      this.showError(`Test failed: ${error.message}`);
    }
  }

  private showError(message: string): void {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.innerHTML = `<div style="color: red; font-size: 18px;">ERROR: ${message}</div>`;
    }
  }

  private setupOverlay(): void {
    if (!this.videoElement || !this.overlayCanvas) return;

    // Position overlay over video
    const updateOverlay = () => {
      const rect = this.videoElement!.getBoundingClientRect();

      this.overlayCanvas!.style.position = 'absolute';
      this.overlayCanvas!.style.left = rect.left + 'px';
      this.overlayCanvas!.style.top = rect.top + 'px';
      this.overlayCanvas!.style.width = rect.width + 'px';
      this.overlayCanvas!.style.height = rect.height + 'px';
      this.overlayCanvas!.style.pointerEvents = 'none';
      this.overlayCanvas!.style.zIndex = '999';

      this.overlayCanvas!.width = rect.width;
      this.overlayCanvas!.height = rect.height;

      console.log('📐 Overlay sized:', rect.width, 'x', rect.height);
    };

    updateOverlay();
    setInterval(updateOverlay, 100);
  }

  private startTest(): void {
    const drawTest = () => {
      if (!this.overlayCanvas) return;

      const ctx = this.overlayCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

      // Draw test rectangles at fixed positions
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 5;
      ctx.strokeRect(50, 50, 100, 50);

      ctx.fillStyle = '#00FF00';
      ctx.fillRect(200, 100, 150, 75);

      ctx.fillStyle = '#0000FF';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('OVERLAY TEST', 50, 200);

      requestAnimationFrame(drawTest);
    };

    drawTest();
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  const app = new SimpleTest();
  app.initialize();
});

  private startProcessing(): void {
    // Start 60fps rendering loop
    this.startRenderLoop();
    
    // Start OCR processing every 2 seconds
    this.ocrInterval = setInterval(() => {
      if (!this.isProcessing) {
        this.processFrame();
      }
    }, 2000);
    
    // Process first frame immediately
    setTimeout(() => this.processFrame(), 500);
  }

  private startRenderLoop(): void {
    const render = () => {
      this.renderOverlay();
      this.animationFrame = requestAnimationFrame(render);
    };
    render();
  }

  private async processFrame(): Promise<void> {
    if (!this.camera || !this.btcPrice || this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('📸 Processing frame for OCR...');
    
    try {
      // Capture frame from video
      const canvas = this.captureVideoFrame();
      if (!canvas) return;
      
      // Process with OCR
      const ocrResult = await processImage(canvas);
      console.log('📝 OCR result:', ocrResult.text, 'confidence:', ocrResult.confidence);
      
      if (ocrResult.confidence < 20) {
        console.log('⚠️ Low OCR confidence, skipping');
        return;
      }
      
      // Extract prices
      const prices = extractPricesFromText(ocrResult.text);
      console.log('💰 Extracted prices:', prices);
      
      if (prices.length === 0) return;
      
      // Map to coordinates and update detected prices
      this.updateDetectedPrices(prices, ocrResult, canvas);
      
    } catch (error) {
      console.error('❌ Frame processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private captureVideoFrame(): HTMLCanvasElement | null {
    if (!this.camera) return null;
    
    const video = this.camera.video;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    
    return canvas;
  }

  private updateDetectedPrices(prices: number[], ocrResult: OCRResult, sourceCanvas: HTMLCanvasElement): void {
    if (!this.overlayCanvas || !this.videoElement) return;
    
    const now = Date.now();
    this.detectedPrices = [];
    
    // Calculate coordinate transformation
    const videoRect = this.videoElement.getBoundingClientRect();
    const scaleX = videoRect.width / sourceCanvas.width;
    const scaleY = videoRect.height / sourceCanvas.height;
    
    console.log('📐 Coordinate transform:', scaleX.toFixed(3), 'x', scaleY.toFixed(3));
    
    for (const price of prices) {
      const coords = this.findPriceCoordinates(price, ocrResult);
      
      if (coords) {
        this.detectedPrices.push({
          price,
          x: coords.x * scaleX,
          y: coords.y * scaleY,
          width: coords.width * scaleX,
          height: coords.height * scaleY,
          timestamp: now
        });
        
        console.log(`✅ Mapped $${price} to (${(coords.x * scaleX).toFixed(1)}, ${(coords.y * scaleY).toFixed(1)})`);
      }
    }
  }

  private findPriceCoordinates(price: number, ocrResult: OCRResult): { x: number; y: number; width: number; height: number } | null {
    // Try to find exact word match
    for (const word of ocrResult.words) {
      if (!word.text || !word.bbox) continue;
      
      const wordText = word.text.replace(/[^\d.,]/g, '');
      const wordPrice = parseFloat(wordText);
      
      if (!isNaN(wordPrice) && Math.abs(wordPrice - price) < 0.01) {
        return {
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0
        };
      }
    }
    
    // Fallback: estimate from text position
    const lines = ocrResult.text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(price.toString()) || lines[i].includes(`$${price}`)) {
        return {
          x: 100,
          y: 50 + i * 40,
          width: 80,
          height: 30
        };
      }
    }
    
    return null;
  }

  private renderOverlay(): void {
    if (!this.overlayContext || !this.overlayCanvas) return;
    
    const ctx = this.overlayContext;
    ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    
    // Remove old detections (older than 5 seconds)
    const now = Date.now();
    this.detectedPrices = this.detectedPrices.filter(p => now - p.timestamp < 5000);
    
    // Draw detected prices
    for (const priceData of this.detectedPrices) {
      this.drawPriceOverlay(ctx, priceData);
    }
    
    // Draw status
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Detected: ${this.detectedPrices.length} prices`, 10, 30);
  }

  private drawPriceOverlay(ctx: CanvasRenderingContext2D, priceData: DetectedPrice): void {
    if (!this.btcPrice) return;
    
    const conversion = convertToBitcoin(priceData.price, this.btcPrice.usd);
    
    // Draw hit box
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    ctx.strokeRect(priceData.x, priceData.y, priceData.width, priceData.height);
    
    // Draw conversion box
    const convX = priceData.x + priceData.width + 10;
    const convY = priceData.y;
    
    ctx.fillStyle = 'rgba(247, 147, 26, 0.9)';
    ctx.fillRect(convX, convY, 140, 50);
    
    ctx.strokeStyle = '#f7931a';
    ctx.lineWidth = 2;
    ctx.strokeRect(convX, convY, 140, 50);
    
    // Draw text
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px Arial';
    ctx.fillText(`$${priceData.price.toFixed(2)}`, convX + 5, convY + 15);
    ctx.fillText(conversion.formattedBtc, convX + 5, convY + 30);
    ctx.fillText(conversion.formattedSats, convX + 5, convY + 45);
  }

  private showStatus(message: string): void {
    console.log('📱', message);
  }

  private clearStatus(): void {
    // Status cleared
  }

  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.ocrInterval) {
      clearInterval(this.ocrInterval);
    }
    
    if (this.camera) {
      stopCamera(this.camera.stream);
    }
    
    terminateOCR();
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  const app = new ARPriceDetector();
  app.initialize();
});
