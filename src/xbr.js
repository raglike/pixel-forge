/**
 * xBR.js - Pure JavaScript xBR Image Scaler
 * Based on xBR algorithm by Hyllian (http://www.hyllian.org/)
 * Ported from xBRjs by Joseprio (MIT License)
 * 
 * Exposes: xbr2x, xbr3x, xbr4x, xbrScale
 */

'use strict';

/**
 * Pack RGBA bytes into a Uint32 (ARGB format)
 */
function packPixel(r, g, b, a) {
  return ((a & 0xFF) << 24) | ((b & 0xFF) << 16) | ((g & 0xFF) << 8) | (r & 0xFF);
}

/**
 * Unpack a Uint32 pixel to [r, g, b, a]
 */
function unpackPixel(u32) {
  return [
    u32 & 0xFF,
    (u32 >>> 8) & 0xFF,
    (u32 >>> 16) & 0xFF,
    (u32 >>> 24) & 0xFF
  ];
}

/**
 * Blend two colors with alpha weighting
 */
function blendPixels(ca, cb, alpha) {
  const a1 = ((alpha >>> 24) & 0xFF) / 255;
  const a2 = 1 - a1;
  return packPixel(
    Math.round(((ca >>> 0) & 0xFF) * a2 + ((cb >>> 0) & 0xFF) * a1),
    Math.round(((ca >>> 8) & 0xFF) * a2 + ((cb >>> 8) & 0xFF) * a1),
    Math.round(((ca >>> 16) & 0xFF) * a2 + ((cb >>> 16) & 0xFF) * a1),
    255
  );
}

// xBR weight constants
const w1 = 2.0;
const w2 = 1.0;
const w3 = 1.0;
const yc1 = 2.0;
const yc2 = 1.0;
const yc3 = 0.0;
const N = (w1 + w2 + w3);

function diff(c1, c2) {
  const r1 = (c1 >>> 0) & 0xFF, r2 = (c2 >>> 0) & 0xFF;
  const g1 = (c1 >>> 8) & 0xFF, g2 = (c2 >>> 8) & 0xFF;
  const b1 = (c1 >>> 16) & 0xFF, b2 = (c2 >>> 16) & 0xFF;
  const a1 = (c1 >>> 24) & 0xFF, a2 = (c2 >>> 24) & 0xFF;
  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) + Math.abs(a1 - a2);
}

function eq(c1, c2) {
  return c1 === c2;
}

function numOfDiff(p1, p2) {
  let r = 0;
  if (p1[0] !== p2[0]) r++;
  if (p1[1] !== p2[1]) r++;
  if (p1[2] !== p2[2]) r++;
  if (p1[3] !== p2[3]) r++;
  return r;
}

function interpolatePacked(p1, p2, p3, p4, w1, w2, w3) {
  // Simple bilinear interpolation of packed uint32 pixels
  const a1 = p1, a2 = p2, a3 = p3, a4 = p4;
  const t1 = (w1 / N), t2 = (w2 / N), t3 = (w3 / N);
  
  // Unpack
  const r1 = a1 & 0xFF, g1 = (a1 >>> 8) & 0xFF, b1 = (a1 >>> 16) & 0xFF;
  const r2 = a2 & 0xFF, g2 = (a2 >>> 8) & 0xFF, b2 = (a2 >>> 16) & 0xFF;
  const r3 = a3 & 0xFF, g3 = (a3 >>> 8) & 0xFF, b3 = (a3 >>> 16) & 0xFF;
  const r4 = a4 & 0xFF, g4 = (a4 >>> 8) & 0xFF, b4 = (a4 >>> 16) & 0xFF;
  
  const r = Math.round(r1 * t1 + r2 * t2 + r3 * t3 + r4 * (1 - t1 - t2 - t3));
  const g = Math.round(g1 * t1 + g2 * t2 + g3 * t3 + g4 * (1 - t1 - t2 - t3));
  const b = Math.round(b1 * t1 + b2 * t2 + b3 * t3 + b4 * (1 - t1 - t2 - t3));
  
  return packPixel(r, g, b, 255);
}

function fillTheme(theme, p1, p2, p3, p4) {
  theme[0] = unpackPixel(p1);
  theme[1] = unpackPixel(p2);
  theme[2] = unpackPixel(p3);
  theme[3] = unpackPixel(p4);
}

function determineBlend(w1, w2, blendTheme, p1, p2, p3, p4) {
  // This function determines the blending weights based on edge detection
  const t1 = blendTheme[0];
  const t2 = blendTheme[1];
  const t3 = blendTheme[2];
  const t4 = blendTheme[3];
  
  const e1 = yc1 * Math.abs(t1[0] - t4[0]) + yc2 * Math.abs(t1[1] - t4[1]) + yc3 * Math.abs(t1[2] - t4[2]);
  const e2 = yc1 * Math.abs(t2[0] - t4[0]) + yc2 * Math.abs(t2[1] - t4[1]) + yc3 * Math.abs(t2[2] - t4[2]);
  const e3 = yc1 * Math.abs(t1[0] - t2[0]) + yc2 * Math.abs(t1[1] - t2[1]) + yc3 * Math.abs(t1[2] - t2[2]);
  
  if (e1 <= e2 && e1 <= e3) {
    return p1;
  } else if (e2 <= e1 && e2 <= e3) {
    return p2;
  } else {
    return p3;
  }
}

// ============================================================
// 2xBR Core - processes 1 source pixel -> 4 output pixels
// ============================================================

function process2xBR(src, srcW, srcH, dst, offX, offY) {
  // Neighbors layout for 3x3 kernel centered at pixel:
  // A | B | C       0 | 1 | 2
  // D | E | F  =>   3 | 4 | 5
  // G | H | I       6 | 7 | 8
  
  const neighbors = new Array(9);
  
  for (let v = -1; v <= 1; v++) {
    for (let u = -1; u <= 1; u++) {
      const sx = Math.min(srcW - 1, Math.max(0, offX + u));
      const sy = Math.min(srcH - 1, Math.max(0, offY + v));
      neighbors[(v + 1) * 3 + (u + 1)] = src[sy * srcW + sx];
    }
  }
  
  const A = neighbors[0], B = neighbors[1], C = neighbors[2];
  const D = neighbors[3], E = neighbors[4], F = neighbors[5];
  const G = neighbors[6], H = neighbors[7], I = neighbors[8];
  
  const b = E;
  const c = B;
  const a = D;
  const f = H;
  const g = E;
  const h = F;
  const e = D;
  const d = G;
  
  // Edge detection: check if this is a horizontal or vertical edge
  const leftEdge  = diff(e, d) + diff(e, h) + diff(f, g) + diff(h, c);
  const upEdge    = diff(e, c) + diff(e, f) + diff(h, a) + diff(f, b);
  const downEdge  = diff(e, a) + diff(e, b) + diff(d, f) + diff(c, h);
  const rightEdge = diff(e, g) + diff(e, a) + diff(d, h) + diff(b, f);
  
  const blendTheme = [];
  blendTheme[0] = unpackPixel(c);
  blendTheme[1] = unpackPixel(b);
  blendTheme[2] = unpackPixel(f);
  blendTheme[3] = unpackPixel(h);
  
  // Horizontal edge
  if (leftEdge < upEdge && leftEdge < downEdge && leftEdge < rightEdge) {
    if (diff(e, g) < diff(e, c)) {
      const blend = determineBlend(1, 1, blendTheme, A, E, F, H);
      // Top-left
      dst[offY * srcW * 4 + offX * 4] = e;
      dst[offY * srcW * 4 + offX * 4 + 1] = blend;
      dst[offY * srcW * 4 + offX * 4 + 2] = blend;
      dst[offY * srcW * 4 + offX * 4 + 3] = 255;
      // Top-right
      dst[offY * srcW * 4 + offX * 4 + 4] = blend;
      dst[offY * srcW * 4 + offX * 4 + 5] = blend;
      dst[offY * srcW * 4 + offX * 4 + 6] = f;
      dst[offY * srcW * 4 + offX * 4 + 7] = 255;
      // Bottom-left
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4] = blend;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 1] = blend;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 2] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 3] = 255;
      // Bottom-right
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 4] = blend;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 5] = blend;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 6] = blend;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 7] = 255;
    } else {
      // Just copy 2x
      dst[offY * 2 * srcW * 4 + offX * 4] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 1] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 2] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 3] = 255;
      dst[offY * 2 * srcW * 4 + offX * 4 + 4] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 5] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 6] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 7] = 255;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 1] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 2] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 3] = 255;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 4] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 5] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 6] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 7] = 255;
    }
  }
  // Vertical edge
  else if (upEdge < leftEdge && upEdge < downEdge && upEdge < rightEdge) {
    if (diff(e, c) < diff(e, g)) {
      const blend = determineBlend(1, 1, blendTheme, D, B, F, H);
      dst[offY * 2 * srcW * 4 + offX * 4] = blend;
      dst[offY * 2 * srcW * 4 + offX * 4 + 1] = blend;
      dst[offY * 2 * srcW * 4 + offX * 4 + 2] = b;
      dst[offY * 2 * srcW * 4 + offX * 4 + 3] = 255;
      dst[offY * 2 * srcW * 4 + offX * 4 + 4] = blend;
      dst[offY * 2 * srcW * 4 + offX * 4 + 5] = blend;
      dst[offY * 2 * srcW * 4 + offX * 4 + 6] = b;
      dst[offY * 2 * srcW * 4 + offX * 4 + 7] = 255;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4] = blend;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 1] = blend;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 2] = h;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 3] = 255;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 4] = blend;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 5] = blend;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 6] = h;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 7] = 255;
    } else {
      dst[offY * 2 * srcW * 4 + offX * 4] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 1] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 2] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 3] = 255;
      dst[offY * 2 * srcW * 4 + offX * 4 + 4] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 5] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 6] = e;
      dst[offY * 2 * srcW * 4 + offX * 4 + 7] = 255;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 1] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 2] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 3] = 255;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 4] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 5] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 6] = e;
      dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 7] = 255;
    }
  }
  // Diagonal edge (45-degree)
  else if (diff(e, g) < diff(e, c)) {
    const blend = determineBlend(1, 1, blendTheme, D, B, F, H);
    dst[offY * 2 * srcW * 4 + offX * 4] = e;
    dst[offY * 2 * srcW * 4 + offX * 4 + 1] = blend;
    dst[offY * 2 * srcW * 4 + offX * 4 + 2] = b;
    dst[offY * 2 * srcW * 4 + offX * 4 + 3] = 255;
    dst[offY * 2 * srcW * 4 + offX * 4 + 4] = blend;
    dst[offY * 2 * srcW * 4 + offX * 4 + 5] = blend;
    dst[offY * 2 * srcW * 4 + offX * 4 + 6] = f;
    dst[offY * 2 * srcW * 4 + offX * 4 + 7] = 255;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4] = blend;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 1] = blend;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 2] = e;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 3] = 255;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 4] = blend;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 5] = blend;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 6] = h;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 7] = 255;
  }
  else {
    dst[offY * 2 * srcW * 4 + offX * 4] = e;
    dst[offY * 2 * srcW * 4 + offX * 4 + 1] = e;
    dst[offY * 2 * srcW * 4 + offX * 4 + 2] = b;
    dst[offY * 2 * srcW * 4 + offX * 4 + 3] = 255;
    dst[offY * 2 * srcW * 4 + offX * 4 + 4] = e;
    dst[offY * 2 * srcW * 4 + offX * 4 + 5] = e;
    dst[offY * 2 * srcW * 4 + offX * 4 + 6] = f;
    dst[offY * 2 * srcW * 4 + offX * 4 + 7] = 255;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4] = e;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 1] = e;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 2] = e;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 3] = 255;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 4] = e;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 5] = e;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 6] = h;
    dst[(offY * 2 + 1) * srcW * 4 + offX * 4 + 7] = 255;
  }
}

// ============================================================
// xBR 2x
// ============================================================
function xbr2x(pixels, width, height) {
  const dstWidth = width * 2;
  const dstHeight = height * 2;
  const dst = new Uint8ClampedArray(dstWidth * dstHeight * 4);
  
  // Initialize with bilinear-style scaling (nearest neighbor base)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = pixels[y * width + x];
      const u = unpackPixel(pixel);
      // Write 2x2 block
      const base = y * 2 * dstWidth * 4 + x * 2 * 4;
      dst[base] = u[0]; dst[base+1] = u[1]; dst[base+2] = u[2]; dst[base+3] = 255;
      dst[base+4] = u[0]; dst[base+5] = u[1]; dst[base+6] = u[2]; dst[base+7] = 255;
      dst[base + dstWidth*4] = u[0]; dst[base + dstWidth*4+1] = u[1]; dst[base + dstWidth*4+2] = u[2]; dst[base + dstWidth*4+3] = 255;
      dst[base + dstWidth*4+4] = u[0]; dst[base + dstWidth*4+5] = u[1]; dst[base + dstWidth*4+6] = u[2]; dst[base + dstWidth*4+7] = 255;
    }
  }
  
  // Apply edge-directed enhancement (single pass is sufficient for 2x)
  const enhanced = new Uint8ClampedArray(dst);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      process2xBR(null, dstWidth, dstHeight, enhanced, x, y);
    }
  }
  
  return new Uint32Array(enhanced.buffer);
}

// ============================================================
// xBR 3x
// ============================================================
function xbr3x(pixels, width, height) {
  // First do 3x nearest neighbor, then apply 2x xBR
  const tmpWidth = width * 3;
  const tmpHeight = height * 3;
  const tmp = new Uint8ClampedArray(tmpWidth * tmpHeight * 4);
  
  // 3x nearest neighbor
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = pixels[y * width + x];
      const u = unpackPixel(pixel);
      const baseY = y * 3;
      const baseX = x * 3;
      for (let sy = 0; sy < 3; sy++) {
        for (let sx = 0; sx < 3; sx++) {
          const idx = (baseY + sy) * tmpWidth * 4 + (baseX + sx) * 4;
          tmp[idx] = u[0]; tmp[idx+1] = u[1]; tmp[idx+2] = u[2]; tmp[idx+3] = 255;
        }
      }
    }
  }
  
  // Now apply 2x xBR on the 3x scaled result (scale by 2 = 6x total, but we want 3x)
  // Actually for 3x we need a different approach - do direct 3x edge enhancement
  const dstWidth = width * 3;
  const dstHeight = height * 3;
  const dst = new Uint8ClampedArray(tmp);
  
  // Apply edge-directed enhancement for 3x
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors = new Array(9);
      for (let v = -1; v <= 1; v++) {
        for (let u = -1; u <= 1; u++) {
          const sx = Math.min(width - 1, Math.max(0, x + u));
          const sy = Math.min(height - 1, Math.max(0, y + v));
          neighbors[(v + 1) * 3 + (u + 1)] = pixels[sy * width + sx];
        }
      }
      
      const E = neighbors[4]; // center
      const c = neighbors[1], b = neighbors[3], f = neighbors[5], h = neighbors[7];
      const d = neighbors[0], a = neighbors[6], g = neighbors[2], i = neighbors[8];
      
      const leftEdge  = diff(E, b) + diff(E, f) + diff(h, d) + diff(f, c);
      const upEdge    = diff(E, d) + diff(E, h) + diff(f, a) + diff(h, b);
      
      const blendTheme = [];
      blendTheme[0] = unpackPixel(c);
      blendTheme[1] = unpackPixel(b);
      blendTheme[2] = unpackPixel(f);
      blendTheme[3] = unpackPixel(h);
      
      // For 3x: write 3x3 block per source pixel, blend edges
      const bx = x * 3, by = y * 3;
      
      if (leftEdge < upEdge && diff(E, b) < diff(E, d)) {
        const blend = determineBlend(1, 1, blendTheme, d, b, f, h);
        const uE = unpackPixel(E);
        const uBlend = unpackPixel(blend);
        
        // 3x3 grid: [0-2][0-2] in the output block
        // Apply horizontal edge blend
        for (let sy = 0; sy < 3; sy++) {
          for (let sx = 0; sx < 3; sx++) {
            const idx = (by + sy) * dstWidth * 4 + (bx + sx) * 4;
            if (sx === 2) {
              dst[idx] = uBlend[0]; dst[idx+1] = uBlend[1]; dst[idx+2] = uBlend[2]; dst[idx+3] = 255;
            } else {
              dst[idx] = uE[0]; dst[idx+1] = uE[1]; dst[idx+2] = uE[2]; dst[idx+3] = 255;
            }
          }
        }
      } else if (upEdge < leftEdge && diff(E, d) < diff(E, b)) {
        const blend = determineBlend(1, 1, blendTheme, d, b, f, h);
        const uE = unpackPixel(E);
        const uBlend = unpackPixel(blend);
        
        for (let sy = 0; sy < 3; sy++) {
          for (let sx = 0; sx < 3; sx++) {
            const idx = (by + sy) * dstWidth * 4 + (bx + sx) * 4;
            if (sy === 2) {
              dst[idx] = uBlend[0]; dst[idx+1] = uBlend[1]; dst[idx+2] = uBlend[2]; dst[idx+3] = 255;
            } else {
              dst[idx] = uE[0]; dst[idx+1] = uE[1]; dst[idx+2] = uE[2]; dst[idx+3] = 255;
            }
          }
        }
      }
      // else: no blend, 3x3 of E
    }
  }
  
  return new Uint32Array(dst.buffer);
}

// ============================================================
// xBR 4x
// ============================================================
function xbr4x(pixels, width, height) {
  // 2x nearest neighbor first, then apply 2x xBR
  const tmpWidth = width * 2;
  const tmpHeight = height * 2;
  const tmp = new Uint8ClampedArray(tmpWidth * tmpHeight * 4);
  
  // 2x nearest neighbor
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = pixels[y * width + x];
      const u = unpackPixel(pixel);
      const base = y * 2 * tmpWidth * 4 + x * 2 * 4;
      for (let sy = 0; sy < 2; sy++) {
        for (let sx = 0; sx < 2; sx++) {
          const idx = base + sy * tmpWidth * 4 + sx * 4;
          tmp[idx] = u[0]; tmp[idx+1] = u[1]; tmp[idx+2] = u[2]; tmp[idx+3] = 255;
        }
      }
    }
  }
  
  // Apply 2x xBR on tmp
  const dstWidth = width * 4;
  const dstHeight = height * 4;
  const dst = new Uint8ClampedArray(tmp);
  
  for (let y = 0; y < tmpHeight; y++) {
    for (let x = 0; x < tmpWidth; x++) {
      process2xBR(null, tmpWidth, tmpHeight, dst, x, y);
    }
  }
  
  // Second pass of 2x xBR
  const dst2 = new Uint8ClampedArray(dst);
  for (let y = 0; y < dstHeight; y++) {
    for (let x = 0; x < dstWidth; x++) {
      process2xBR(null, dstWidth, dstHeight, dst2, x, y);
    }
  }
  
  return new Uint32Array(dst2.buffer);
}

// ============================================================
// Main API: xbrScale(imageData, scale)
// imageData: ImageData from canvas.getContext('2d').getImageData(0, 0, w, h)
// scale: 2, 3, or 4
// Returns: ImageData
// ============================================================
function xbrScale(imageData, scale) {
  if (!imageData || !imageData.data) {
    throw new Error('Invalid imageData');
  }
  
  scale = parseInt(scale, 10);
  if (scale !== 2 && scale !== 3 && scale !== 4) {
    throw new Error('Scale must be 2, 3, or 4');
  }
  
  const srcW = imageData.width;
  const srcH = imageData.height;
  
  // Convert RGBA Uint8ClampedArray to Uint32Array (ARGB)
  const pixelView = new Uint32Array(imageData.data.buffer);
  
  let scaledPixels;
  let dstW, dstH;
  
  switch (scale) {
    case 2:
      dstW = srcW * 2;
      dstH = srcH * 2;
      scaledPixels = xbr2x(pixelView, srcW, srcH);
      break;
    case 3:
      dstW = srcW * 3;
      dstH = srcH * 3;
      scaledPixels = xbr3x(pixelView, srcW, srcH);
      break;
    case 4:
      dstW = srcW * 4;
      dstH = srcH * 4;
      scaledPixels = xbr4x(pixelView, srcW, srcH);
      break;
  }
  
  // Convert back to Uint8ClampedArray
  const scaledData = new Uint8ClampedArray(scaledPixels.buffer);
  
  // Create new ImageData
  const canvas = document.createElement('canvas');
  canvas.width = dstW;
  canvas.height = dstH;
  const ctx = canvas.getContext('2d');
  const newImageData = ctx.createImageData(dstW, dstH);
  newImageData.data.set(scaledData);
  
  return newImageData;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { xbrScale, xbr2x, xbr3x, xbr4x };
}
