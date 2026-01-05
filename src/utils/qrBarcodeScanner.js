import jsQR from 'jsqr';

/**
 * QR Code and Barcode scanning utilities
 */

export class QRCodeScanner {
  /**
   * Scan QR code from image file
   */
  static async scanQRCode(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        URL.revokeObjectURL(url);
        
        if (code) {
          resolve({
            data: code.data,
            location: code.location
          });
        } else {
          reject(new Error('No QR code found'));
        }
      };
      
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Scan QR code from image URL
   */
  static async scanQRCodeFromURL(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          resolve({
            data: code.data,
            location: code.location
          });
        } else {
          reject(new Error('No QR code found'));
        }
      };
      
      img.onerror = reject;
      img.src = imageUrl;
    });
  }
}

/**
 * Barcode scanning (simplified - would need barcode library)
 */
export class BarcodeScanner {
  static async scanBarcode(file) {
    // Placeholder - would use barcode scanning library
    throw new Error('Barcode scanning not yet implemented');
  }
}

