/**
 * xBR.js - Thin wrapper around xBRjs vendor library
 * 
 * xBRjs (Joseprio, MIT License) - https://github.com/joseprio/xBRjs
 * Exposes: xbrScale(imageData, scale) function
 * 
 * xBRjs must be loaded BEFORE this script via <script src="xbr-vendor.js">
 */

/**
 * Main API: xbrScale(imageData, scale)
 * 
 * @param {ImageData} imageData - Source image data (from canvas.getContext('2d').getImageData)
 * @param {number} scale - Scale factor: 2, 3, or 4
 * @returns {ImageData} - Scaled image data
 */
function xbrScale(imageData, scale) {
  if (!imageData || !imageData.data) {
    throw new Error('Invalid imageData');
  }
  
  scale = parseInt(scale, 10);
  if (scale !== 2 && scale !== 3 && scale !== 4) {
    throw new Error('Scale must be 2, 3, or 4');
  }
  
  if (typeof window.xBRjs === 'undefined') {
    throw new Error('xBRjs vendor library not loaded. Ensure xbr-vendor.js is included before xbr.js.');
  }
  
  const srcW = imageData.width;
  const srcH = imageData.height;
  
  // Convert ImageData to Uint32Array (ABGR format)
  // Uint8ClampedArray stores RGBA at byte offsets [0,1,2,3] = [R,G,B,A]
  // In little-endian Uint32 view: bits 0-7=R, 8-15=G, 16-23=B, 24-31=A
  const pixelView = new Uint32Array(imageData.data.buffer);
  
  // Call the appropriate xBR function
  let scaledPixels;
  switch (scale) {
    case 2:
      scaledPixels = window.xBRjs.xbr2x(pixelView, srcW, srcH, { blendColors: true });
      break;
    case 3:
      scaledPixels = window.xBRjs.xbr3x(pixelView, srcW, srcH, { blendColors: true });
      break;
    case 4:
      scaledPixels = window.xBRjs.xbr4x(pixelView, srcW, srcH, { blendColors: true });
      break;
  }
  
  // Calculate output dimensions
  const dstW = srcW * scale;
  const dstH = srcH * scale;
  
  // scaledPixels is a Uint32Array where each pixel is ABGR
  // We need to convert back to Uint8ClampedArray (RGBA bytes)
  const scaledUint8 = new Uint8ClampedArray(scaledPixels.buffer);
  
  // Create a canvas to convert to ImageData
  const canvas = document.createElement('canvas');
  canvas.width = dstW;
  canvas.height = dstH;
  const ctx = canvas.getContext('2d');
  const newImageData = ctx.createImageData(dstW, dstH);
  newImageData.data.set(scaledUint8);
  
  return newImageData;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { xbrScale };
}
