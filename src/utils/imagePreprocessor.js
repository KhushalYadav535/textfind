/**
 * Image preprocessing utilities for better OCR accuracy
 */

export class ImagePreprocessor {
  /**
   * Create a canvas from image file
   */
  static async createCanvasFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Auto-rotate image based on EXIF data
   */
  static async autoRotate(canvas) {
    // Note: EXIF reading requires additional library
    // This is a simplified version
    return canvas;
  }

  /**
   * Adjust brightness
   */
  static adjustBrightness(canvas, value) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + value));     // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value)); // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value)); // B
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Adjust contrast
   */
  static adjustContrast(canvas, value) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));     // R
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // G
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // B
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Convert to grayscale
   */
  static toGrayscale(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;     // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Apply sharpening filter
   */
  static sharpen(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    const newData = new Uint8ClampedArray(data);
    
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const k = kernel[(ky + 1) * 3 + (kx + 1)];
              sum += data[idx] * k;
            }
          }
          const idx = (y * width + x) * 4 + c;
          newData[idx] = Math.min(255, Math.max(0, sum));
        }
      }
    }
    
    ctx.putImageData(new ImageData(newData, width, height), 0, 0);
    return canvas;
  }

  /**
   * Deskew (straighten) image
   */
  static async deskew(canvas) {
    // Simplified deskew - would need more complex algorithm for production
    return canvas;
  }

  /**
   * Convert canvas to blob
   */
  static canvasToBlob(canvas, mimeType = 'image/png', quality = 0.9) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });
  }

  /**
   * Process image with all enhancements
   */
  static async processImage(file, options = {}) {
    let canvas = await this.createCanvasFromFile(file);
    
    if (options.grayscale) {
      canvas = this.toGrayscale(canvas);
    }
    
    if (options.brightness !== undefined) {
      canvas = this.adjustBrightness(canvas, options.brightness);
    }
    
    if (options.contrast !== undefined) {
      canvas = this.adjustContrast(canvas, options.contrast);
    }
    
    if (options.sharpen) {
      canvas = this.sharpen(canvas);
    }
    
    if (options.autoRotate) {
      canvas = await this.autoRotate(canvas);
    }
    
    if (options.deskew) {
      canvas = await this.deskew(canvas);
    }
    
    const blob = await this.canvasToBlob(canvas, file.type);
    return new File([blob], file.name, { type: file.type });
  }
}

