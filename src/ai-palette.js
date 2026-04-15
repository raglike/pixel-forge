/**
 * F33: AI Smart Palette Recommendation
 * Pure algorithm-based image content analysis and palette recommendation
 * No AI model dependencies
 */

// ========== COLOR ANALYSIS UTILITIES ==========

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

/**
 * Calculate color brightness (0-100)
 */
function getBrightness(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 * 100;
}

/**
 * Calculate color saturation (0-100)
 */
function getSaturation(r, g, b) {
  const [h, s] = rgbToHsl(r, g, b);
  return s;
}

/**
 * Calculate contrast ratio of the image
 */
function getContrast(pixels) {
  if (pixels.length === 0) return 0;
  const brightnesses = pixels.map(p => getBrightness(p[0], p[1], p[2]));
  const max = Math.max(...brightnesses);
  const min = Math.min(...brightnesses);
  return (max - min) / 100;
}

/**
 * Analyze dominant colors from pixel array
 */
function analyzeDominantColors(pixels, maxColors = 8) {
  if (pixels.length === 0) return [];

  // Group similar colors
  const colorMap = new Map();

  for (const p of pixels) {
    // Quantize to reduce noise
    const qr = Math.round(p[0] / 32) * 32;
    const qg = Math.round(p[1] / 32) * 32;
    const qb = Math.round(p[2] / 32) * 32;
    const key = `${qr},${qg},${qb}`;

    if (colorMap.has(key)) {
      colorMap.set(key, colorMap.get(key) + 1);
    } else {
      colorMap.set(key, 1);
    }
  }

  // Sort by frequency
  const sorted = [...colorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors);

  return sorted.map(([key, count]) => {
    const [r, g, b] = key.split(',').map(Number);
    return { r, g, b, count, percentage: count / pixels.length };
  });
}

/**
 * Get hue distribution from pixels
 */
function getHueDistribution(pixels) {
  const ranges = {
    red: 0,      // 0-30, 330-360
    orange: 0,   // 30-60
    yellow: 0,   // 60-90
    green: 0,    // 90-150
    cyan: 0,     // 150-180
    blue: 0,     // 180-240
    purple: 0,   // 240-300
    pink: 0      // 300-330
  };

  for (const p of pixels) {
    const [h] = rgbToHsl(p[0], p[1], p[2]);
    if (h < 30 || h >= 330) ranges.red += 1;
    else if (h < 60) ranges.orange += 1;
    else if (h < 90) ranges.yellow += 1;
    else if (h < 150) ranges.green += 1;
    else if (h < 180) ranges.cyan += 1;
    else if (h < 240) ranges.blue += 1;
    else if (h < 300) ranges.purple += 1;
    else ranges.pink += 1;
  }

  const total = pixels.length || 1;
  return {
    red: ranges.red / total,
    orange: ranges.orange / total,
    yellow: ranges.yellow / total,
    green: ranges.green / total,
    cyan: ranges.cyan / total,
    blue: ranges.blue / total,
    purple: ranges.purple / total,
    pink: ranges.pink / total
  };
}

// ========== SCENE CLASSIFICATION ==========

/**
 * Scene types for classification
 */
const SCENE_TYPES = {
  LANDSCAPE: 'landscape',     // Nature, outdoor scenes
  PORTRAIT: 'portrait',       // People, faces
  UI_ICON: 'ui_icon',         // UI elements, icons, sprites
  ABSTRACT: 'abstract',       // Art, patterns
  NIGHT: 'night',             // Dark scenes
  PASTEL: 'pastel'            // Soft, light colors
};

/**
 * Classify image scene type based on color analysis
 */
function classifyScene(pixels) {
  if (pixels.length === 0) return SCENE_TYPES.ABSTRACT;

  const brightnesses = pixels.map(p => getBrightness(p[0], p[1], p[2]));
  const avgBrightness = brightnesses.reduce((a, b) => a + b, 0) / brightnesses.length;

  const saturations = pixels.map(p => getSaturation(p[0], p[1], p[2]));
  const avgSaturation = saturations.reduce((a, b) => a + b, 0) / saturations.length;

  const contrast = getContrast(pixels);
  const hueDist = getHueDistribution(pixels);
  const domColors = analyzeDominantColors(pixels, 5);

  // Check for skin tones (portrait indicator)
  let skinToneCount = 0;
  for (const p of pixels) {
    const [h, s, l] = rgbToHsl(p[0], p[1], p[2]);
    if (h >= 0 && h <= 50 && s >= 10 && s <= 60 && l >= 40 && l <= 80) {
      skinToneCount++;
    }
  }
  const skinToneRatio = skinToneCount / pixels.length;

  // Check for sky/nature colors
  const naturalColors = hueDist.green + hueDist.cyan + hueDist.blue;

  // Check for warm colors
  const warmColors = hueDist.red + hueDist.orange + hueDist.yellow;

  // Decision logic
  let sceneType = SCENE_TYPES.ABSTRACT;
  let confidence = 0;

  // Night scene: low brightness, high contrast
  if (avgBrightness < 30 && contrast > 0.4) {
    sceneType = SCENE_TYPES.NIGHT;
    confidence = 0.7;
  }
  // Portrait: skin tones detected
  else if (skinToneRatio > 0.05) {
    sceneType = SCENE_TYPES.PORTRAIT;
    confidence = Math.min(0.9, skinToneRatio * 5);
  }
  // Landscape: nature colors dominant
  else if (naturalColors > 0.4 && avgSaturation > 20) {
    sceneType = SCENE_TYPES.LANDSCAPE;
    confidence = Math.min(0.85, naturalColors);
  }
  // UI/Icon: high contrast, few colors, balanced
  else if (contrast > 0.5 && domColors.length <= 8 && avgSaturation > 15) {
    sceneType = SCENE_TYPES.UI_ICON;
    confidence = 0.6;
  }
  // Pastel: low saturation, high brightness
  else if (avgSaturation < 25 && avgBrightness > 60) {
    sceneType = SCENE_TYPES.PASTEL;
    confidence = 0.65;
  }
  // Abstract: high saturation, varied hues
  else if (avgSaturation > 40 && warmColors > 0.5) {
    sceneType = SCENE_TYPES.ABSTRACT;
    confidence = 0.55;
  }

  return { type: sceneType, confidence, details: { avgBrightness, avgSaturation, contrast, hueDist, domColors } };
}

// ========== PALETTE RECOMMENDATION =========-

/**
 * Palette recommendation database with scene suitability scores
 */
const PALETTE_SCORES = {
  'PICO-8': {
    landscape: 0.7, portrait: 0.8, ui_icon: 0.9, abstract: 0.85, night: 0.6, pastel: 0.75,
    description: '明亮糖果色，适合卡通风格'
  },
  'NES': {
    landscape: 0.85, portrait: 0.75, ui_icon: 0.7, abstract: 0.6, night: 0.8, pastel: 0.5,
    description: '经典游戏机色彩，色域丰富'
  },
  'GameBoy': {
    landscape: 0.5, portrait: 0.4, ui_icon: 0.6, abstract: 0.7, night: 0.9, pastel: 0.6,
    description: '极简4色，适合复古风格'
  },
  '灰度': {
    landscape: 0.4, portrait: 0.6, ui_icon: 0.5, abstract: 0.5, night: 0.95, pastel: 0.4,
    description: '纯灰度，适合写实素描效果'
  }
};

/**
 * Recommend palettes based on scene type
 */
function recommendPalettes(sceneType, details) {
  const scores = PALETTE_SCORES;
  const recommendations = [];

  // Get base scores for scene type
  for (const [palette, sceneScores] of Object.entries(scores)) {
    const baseScore = sceneScores[sceneType.type] || 0.5;

    // Adjust based on color count requirements
    let colorBonus = 0;
    if (details.domColors.length <= 4 && palette === 'GameBoy') {
      colorBonus += 0.15;
    }
    if (details.domColors.length > 8 && palette === 'NES') {
      colorBonus += 0.1;
    }
    if (details.avgSaturation < 15 && (palette === '灰度' || palette === 'GameBoy')) {
      colorBonus += 0.2;
    }
    if (details.avgBrightness < 25 && palette === 'GameBoy') {
      colorBonus += 0.15;
    }

    const finalScore = Math.min(1, baseScore + colorBonus);

    recommendations.push({
      palette,
      score: finalScore,
      reason: buildRecommendationReason(palette, sceneType, details),
      colors: PALETTE_PRESETS[palette]
    });
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

/**
 * Build human-readable recommendation reason
 */
function buildRecommendationReason(palette, sceneType, details) {
  const reasons = {
    'PICO-8': [
      '色彩鲜艳活泼，适合卡通风格图片',
      '16色调色板，颜色过渡平滑',
      '复古游戏风格，增加趣味性'
    ],
    'NES': [
      '色域广泛，风景层次丰富',
      '经典游戏色彩，怀旧感强',
      '适合色彩丰富的场景'
    ],
    'GameBoy': [
      '极简风格，突出轮廓和形状',
      '复古绿色调，适合夜间场景',
      '适合高对比度的UI图标'
    ],
    '灰度': [
      '纯灰度色阶，写实素描效果',
      '适合夜间或低亮度场景',
      '突出光影对比和结构'
    ]
  };

  const options = reasons[palette] || ['综合表现良好'];
  // Pick reason based on scene
  if (sceneType.type === 'night' && palette === '灰度') {
    return '夜间场景的理想选择，突出明暗对比';
  }
  if (sceneType.type === 'ui_icon' && palette === 'PICO-8') {
    return '卡通图标的首选，色彩鲜明活泼';
  }
  return options[0];
}

// ========== MAIN RECOMMENDATION FUNCTION ==========

/**
 * Get image data from canvas
 */
function getImagePixels(canvas) {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = [];

  for (let i = 0; i < imgData.data.length; i += 4) {
    // Skip transparent pixels
    if (imgData.data[i + 3] > 128) {
      pixels.push([imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]]);
    }
  }

  return pixels;
}

/**
 * Main function: Analyze image and recommend palette
 * @param {HTMLCanvasElement} canvas - Source canvas with image data
 * @returns {Object} Recommendation result with scene type, palettes, and reasons
 */
function recommendPalette(canvas) {
  const pixels = getImagePixels(canvas);

  if (pixels.length === 0) {
    return {
      success: false,
      message: '图片为空或无法读取像素数据'
    };
  }

  // Step 1: Classify scene
  const sceneResult = classifyScene(pixels);

  // Step 2: Get palette recommendations
  const recommendations = recommendPalettes(sceneResult, sceneResult.details || {});

  // Step 3: Generate overall analysis
  const analysis = generateAnalysisText(sceneResult, pixels);

  return {
    success: true,
    scene: sceneResult,
    analysis,
    recommendations,
    topRecommendation: recommendations[0]
  };
}

/**
 * Generate analysis text
 */
function generateAnalysisText(sceneResult, pixels) {
  const { type, confidence, details } = sceneResult;
  const sceneNames = {
    [SCENE_TYPES.LANDSCAPE]: '自然风景',
    [SCENE_TYPES.PORTRAIT]: '人物肖像',
    [SCENE_TYPES.UI_ICON]: 'UI图标/精灵',
    [SCENE_TYPES.ABSTRACT]: '艺术抽象',
    [SCENE_TYPES.NIGHT]: '夜间场景',
    [SCENE_TYPES.PASTEL]: '柔和粉彩'
  };

  const brightness = details?.avgBrightness?.toFixed(1) || 'N/A';
  const saturation = details?.avgSaturation?.toFixed(1) || 'N/A';
  const contrast = details?.contrast?.toFixed(2) || 'N/A';

  return `图片分析：检测为「${sceneNames[type]||'综合'}]类型 ` +
    `(置信度${(confidence*100).toFixed(0)}%) | ` +
    `亮度${brightness}% | 饱和度${saturation}% | 对比度${contrast}`;
}

// PALETTE_PRESETS - separate from main app's PALETTES to avoid conflicts
const PALETTE_PRESETS = {
  "PICO-8": ["#000000","#1D2B53","#7E2553","#008751","#AB5236","#5F574F","#C2C3C7","#FFF1E8","#FF004D","#FFA300","#FFEC27","#00E436","#29ADFF","#83769C","#FF77A8","#FFCCAA"],
  "NES": ["#000000","#fcfcfc","#f8f8f8","#bcbcbc","#7c7c7c","#a4e4fc","#3cbcfc","#0078f8","#0000fc","#b8b8f8","#6888fc","#0058f8","#0000bc","#d8b8f8","#9878f8","#6844fc","#4428bc","#f8b8f8","#f878f8","#d800cc","#940084","#f8a4c0","#f85898","#e40058","#a80020","#f0d0b0","#f87858","#f83800","#a81000","#fce0a8","#fca044","#e45c10","#881400","#f8d878","#f8b800","#ac7c00","#503000","#d8f878","#b8f818","#00b800","#007800","#b8f8b8","#58d854","#00a800","#006800","#b8f8d8","#58f898","#00a844","#005800","#00fcfc","#00e8d8","#008888","#004058","#f8d8f8","#787878"],
  "GameBoy": ["#0f380f","#306230","#8bac0f","#9bbc0f"],
  "灰度": Array.from({length:16},(_,i)=>{const v=Math.round(i*17);return"#"+v.toString(16).padStart(2,"0").repeat(3);})
};

// ========== F30: AI PIXELATION (EDGE-PRESERVING) ==========

/**
 * Sobel edge detection
 * Returns grayscale edge intensity map (0-255)
 */
function sobelEdgeDetect(imageData) {
  const { data, width, height } = imageData;
  const edges = new Uint8Array(width * height);

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          // Convert to grayscale
          const gray = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += gray * sobelX[ki];
          gy += gray * sobelY[ki];
        }
      }

      // Magnitude
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, magnitude);
    }
  }

  return edges;
}

/**
 * Simple median cut quantization for palette reduction
 */
function medianCutQuantize(pixels, maxColors) {
  const pixelsArray = [];
  for (let i = 0; i < pixels.length; i += 4) {
    pixelsArray.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
  }

  function getColorRange(pixels) {
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
    for (const p of pixels) {
      minR = Math.min(minR, p[0]); maxR = Math.max(maxR, p[0]);
      minG = Math.min(minG, p[1]); maxG = Math.max(maxG, p[1]);
      minB = Math.min(minB, p[2]); maxB = Math.max(maxB, p[2]);
    }
    const r = maxR - minR, g = maxG - minG, b = maxB - minB;
    if (r >= g && r >= b) return 0;
    if (g >= r && g >= b) return 1;
    return 2;
  }

  function splitBox(pixels) {
    if (pixels.length === 0) return [];
    const channel = getColorRange(pixels);
    pixels.sort((a, b) => a[channel] - b[channel]);
    const mid = Math.floor(pixels.length / 2);
    return [pixels.slice(0, mid), pixels.slice(mid)];
  }

  let boxes = [pixelsArray];
  while (boxes.length < maxColors) {
    // Find largest box
    let maxSize = 0, maxIdx = 0;
    boxes.forEach((box, i) => {
      if (box.length > maxSize) { maxSize = box.length; maxIdx = i; }
    });

    const [box1, box2] = splitBox(boxes[maxIdx]);
    boxes.splice(maxIdx, 1);
    if (box1.length > 0) boxes.push(box1);
    if (box2.length > 0) boxes.push(box2);
    if (boxes.length >= maxColors) break;
  }

  // Get average color from each box
  return boxes.map(box => {
    if (box.length === 0) return [0, 0, 0];
    const avg = [0, 0, 0];
    for (const p of box) {
      avg[0] += p[0]; avg[1] += p[1]; avg[2] += p[2];
    }
    return [Math.round(avg[0] / box.length), Math.round(avg[1] / box.length), Math.round(avg[2] / box.length)];
  }).filter(c => c[0] + c[1] + c[2] > 0);
}

/**
 * Bilateral filter for edge-preserving smoothing
 * Simplified version - applies spatial and range filtering
 */
function bilateralFilter(imageData, diameter, sigmaColor, sigmaSpace) {
  const { data, width, height } = imageData;
  const result = new Uint8ClampedArray(data.length);

  const radius = Math.floor(diameter / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let sumR = 0, sumG = 0, sumB = 0, sumW = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          const nidx = (ny * width + nx) * 4;

          // Spatial weight
          const spatialDist = dx * dx + dy * dy;
          const spatialWeight = Math.exp(-spatialDist / (2 * sigmaSpace * sigmaSpace));

          // Range (color) weight
          const colorDist = (data[nidx] - data[idx]) ** 2 +
            (data[nidx + 1] - data[idx + 1]) ** 2 +
            (data[nidx + 2] - data[idx + 2]) ** 2;
          const rangeWeight = Math.exp(-colorDist / (2 * sigmaColor * sigmaColor));

          const weight = spatialWeight * rangeWeight;

          sumR += data[nidx] * weight;
          sumG += data[nidx + 1] * weight;
          sumB += data[nidx + 2] * weight;
          sumW += weight;
        }
      }

      result[idx] = Math.round(sumR / sumW);
      result[idx + 1] = Math.round(sumG / sumW);
      result[idx + 2] = Math.round(sumB / sumW);
      result[idx + 3] = data[idx + 3];
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Downsample image with edge preservation using edge-guided interpolation
 */
function edgeAwareDownsample(srcData, srcWidth, srcHeight, targetWidth, targetHeight, edgeMap) {
  const result = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  const scaleX = srcWidth / targetWidth;
  const scaleY = srcHeight / targetHeight;

  for (let ty = 0; ty < targetHeight; ty++) {
    for (let tx = 0; tx < targetWidth; tx++) {
      const sx = Math.floor(tx * scaleX);
      const sy = Math.floor(ty * scaleY);

      // Check if this is an edge pixel - if so, use edge-directed interpolation
      const edgeVal = edgeMap[sy * srcWidth + sx];
      const isEdge = edgeVal > 40;

      let r, g, b;

      if (isEdge) {
        // For edge pixels, prefer sampling from similar-edge regions
        let bestR = 0, bestG = 0, bestB = 0, bestScore = -1;

        for (let dy = 0; dy <= 1; dy++) {
          for (let dx = 0; dx <= 1; dx++) {
            const ssx = Math.min(srcWidth - 1, sx + dx);
            const ssy = Math.min(srcHeight - 1, sy + dy);
            const sidx = (ssy * srcWidth + ssx) * 4;

            // Score based on edge similarity
            const sEdgeVal = edgeMap[ssy * srcWidth + ssx];
            const edgeScore = 1 - Math.abs(sEdgeVal - edgeVal) / 255;
            const colorDist = ((srcData[sidx] - srcData[(sy * srcWidth + sx) * 4]) ** 2 +
              (srcData[sidx + 1] - srcData[(sy * srcWidth + sx) * 4 + 1]) ** 2 +
              (srcData[sidx + 2] - srcData[(sy * srcWidth + sx) * 4 + 2]) ** 2) / (255 * 255 * 3);
            const score = edgeScore * 0.7 + (1 - colorDist) * 0.3;

            if (score > bestScore) {
              bestScore = score;
              bestR = srcData[sidx];
              bestG = srcData[sidx + 1];
              bestB = srcData[sidx + 2];
            }
          }
        }
        r = bestR; g = bestG; b = bestB;
      } else {
        // For non-edge pixels, simple bilinear-like averaging
        let sumR = 0, sumG = 0, sumB = 0, count = 0;

        for (let dy = 0; dy < scaleY; dy++) {
          for (let dx = 0; dx < scaleX; dx++) {
            const ssx = Math.min(srcWidth - 1, sx + dx);
            const ssy = Math.min(srcHeight - 1, sy + dy);
            const sidx = (ssy * srcWidth + ssx) * 4;
            sumR += srcData[sidx];
            sumG += srcData[sidx + 1];
            sumB += srcData[sidx + 2];
            count++;
          }
        }
        r = Math.round(sumR / count);
        g = Math.round(sumG / count);
        b = Math.round(sumB / count);
      }

      const tidx = (ty * targetWidth + tx) * 4;
      result[tidx] = r;
      result[tidx + 1] = g;
      result[tidx + 2] = b;
      result[tidx + 3] = 255;
    }
  }

  return new ImageData(result, targetWidth, targetHeight);
}

/**
 * Quantize image to palette with optional edge preservation
 */
function quantizeToPalette(imageData, palette, edgeMap, edgeStrength) {
  const { data, width, height } = imageData;
  const result = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor((i / 4) / width);
    const edgeVal = edgeMap ? edgeMap[y * width + x] : 0;

    // Normal color quantization
    let best = palette[0] || [0, 0, 0], bestDist = Infinity;
    for (const c of palette) {
      const d = (data[i] - c[0]) ** 2 + (data[i + 1] - c[1]) ** 2 + (data[i + 2] - c[2]) ** 2;
      if (d < bestDist) { bestDist = d; best = c; }
    }

    let r = best[0], g = best[1], b = best[2];

    // Edge enhancement: blend original edge intensity with quantized result
    if (edgeStrength > 0 && edgeVal > 30) {
      const edgeFactor = (edgeVal / 255) * (edgeStrength / 100) * 0.5;
      // Boost edge contrast by lightening bright edges, darkening dark edges
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      if (brightness > 0.5) {
        r = Math.min(255, r + edgeFactor * 60);
        g = Math.min(255, g + edgeFactor * 60);
        b = Math.min(255, b + edgeFactor * 60);
      } else {
        r = Math.max(0, r - edgeFactor * 60);
        g = Math.max(0, g - edgeFactor * 60);
        b = Math.max(0, b - edgeFactor * 60);
      }
    }

    result[i] = r;
    result[i + 1] = g;
    result[i + 2] = b;
    result[i + 3] = 255;
  }

  return new ImageData(result, width, height);
}

/**
 * Apply edge overlay to pixelated result for sharper edges
 */
function applyEdgeOverlay(pixelatedData, edgeMap, width, height, strength) {
  const result = new Uint8ClampedArray(pixelatedData.length);

  for (let i = 0; i < pixelatedData.length; i += 4) {
    const idx = i / 4;
    const x = idx % width;
    const y = Math.floor(idx / width);

    // Sample edge at a slightly blurred scale for smoother edges
    const edgeVal = edgeMap[y * width + x];

    if (edgeVal > 50) {
      // Calculate edge direction for sharpening
      const factor = (edgeVal / 255) * (strength / 100) * 0.3;

      // Get neighboring pixel brightness
      const brightness = pixelatedData[i] * 0.299 + pixelatedData[i + 1] * 0.587 + pixelatedData[i + 2] * 0.114;

      // Sharpen by boosting contrast at edges
      let nr = pixelatedData[i];
      let ng = pixelatedData[i + 1];
      let nb = pixelatedData[i + 2];

      if (brightness > 128) {
        // Lighten bright edge regions
        nr = Math.min(255, nr + factor * 50);
        ng = Math.min(255, ng + factor * 50);
        nb = Math.min(255, nb + factor * 50);
      } else {
        // Darken dark edge regions
        nr = Math.max(0, nr - factor * 50);
        ng = Math.max(0, ng - factor * 50);
        nb = Math.max(0, nb - factor * 50);
      }

      result[i] = nr;
      result[i + 1] = ng;
      result[i + 2] = nb;
      result[i + 3] = 255;
    } else {
      result[i] = pixelatedData[i];
      result[i + 1] = pixelatedData[i + 1];
      result[i + 2] = pixelatedData[i + 2];
      result[i + 3] = 255;
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Main AI Pixelation function - Edge-preserving pixelation
 *
 * @param {HTMLCanvasElement} canvas - Source canvas with image
 * @param {number} targetSize - Target pixel size (e.g., 64 for 64x64)
 * @param {number} numColors - Number of colors in palette
 * @param {number} edgeStrength - Edge enhancement strength (0-100)
 * @param {Array} palette - Optional palette array (if null, will be auto-generated)
 * @returns {ImageData} Pixelated image data with edge enhancement
 */
function aiPixelate(canvas, targetSize, numColors, edgeStrength = 50, palette = null) {
  const ctx = canvas.getContext('2d');
  const srcWidth = canvas.width;
  const srcHeight = canvas.height;

  // Step 1: Get source image data
  const srcData = ctx.getImageData(0, 0, srcWidth, srcHeight);

  // Step 2: Apply bilateral filter for noise reduction while preserving edges
  const filtered = bilateralFilter(srcData, 5, 25, 25);

  // Step 3: Sobel edge detection on filtered image
  const edgeMap = sobelEdgeDetect(filtered);

  // Step 4: Edge-aware downsampling to target size
  const downsampled = edgeAwareDownsample(filtered.data, srcWidth, srcHeight, targetSize, targetSize, edgeMap);

  // Step 5: Generate palette if not provided
  const finalPalette = palette || medianCutQuantize(downsampled.data, numColors);

  // Step 6: Quantize to palette with edge guidance
  const quantized = quantizeToPalette(downsampled, finalPalette, edgeMap, edgeStrength);

  // Step 7: Apply edge overlay for sharper edges
  const final = applyEdgeOverlay(quantized.data, edgeMap, targetSize, targetSize, edgeStrength);

  return final;
}

/**
 * Apply AI pixelation to a canvas and return the result as a new canvas
 */
function applyAiPixelateToCanvas(srcCanvas, targetSize, numColors, edgeStrength) {
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = targetSize;
  resultCanvas.height = targetSize;
  const ctx = resultCanvas.getContext('2d');

  const result = aiPixelate(srcCanvas, targetSize, numColors, edgeStrength);
  ctx.putImageData(result, 0, 0);

  return resultCanvas;
}

// ========== F31: AI TWEENING (OPTICAL FLOW INTERPOLATION) ==========

/**
 * Compute optical flow between two frames using simplified Lucas-Kanade method
 * @param {ImageData} frameA - First frame image data
 * @param {ImageData} frameB - Second frame image data
 * @returns {Object} Flow field with x and y components
 */
function computeOpticalFlow(frameA, frameB) {
  const { data: dataA, width, height } = frameA;
  const { data: dataB } = frameB;

  const flowX = new Float32Array(width * height);
  const flowY = new Float32Array(width * height);
  const magnitude = new Float32Array(width * height);

  // Convert to grayscale
  const grayA = new Uint8Array(width * height);
  const grayB = new Uint8Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    grayA[i] = dataA[idx] * 0.299 + dataA[idx + 1] * 0.587 + dataA[idx + 2] * 0.114;
    grayB[i] = dataB[idx] * 0.299 + dataB[idx + 1] * 0.587 + dataB[idx + 2] * 0.114;
  }

  // Compute flow using block matching with pyramid approach (simplified)
  const blockSize = 8;
  const searchRange = 4;

  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      let bestDx = 0, bestDy = 0;
      let minSAD = Infinity;

      // Search in surrounding area
      for (let dy = -searchRange; dy <= searchRange; dy += 2) {
        for (let dx = -searchRange; dx <= searchRange; dx += 2) {
          let sad = 0;
          let count = 0;

          // Compare blocks
          for (let by = 0; by < blockSize && y + by < height; by++) {
            for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
              const srcY = y + by;
              const srcX = x + bx;
              const refY = Math.min(height - 1, Math.max(0, y + by + dy));
              const refX = Math.min(width - 1, Math.max(0, x + bx + dx));

              const srcIdx = srcY * width + srcX;
              const refIdx = refY * width + refX;

              sad += Math.abs(grayA[srcIdx] - grayB[refIdx]);
              count++;
            }
          }

          if (count > 0) {
            sad /= count;
            if (sad < minSAD) {
              minSAD = sad;
              bestDx = dx;
              bestDy = dy;
            }
          }
        }
      }

      // Assign flow to all pixels in block
      const mag = Math.sqrt(bestDx * bestDx + bestDy * bestDy);
      for (let by = 0; by < blockSize && y + by < height; by++) {
        for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
          const idx = (y + by) * width + (x + bx);
          flowX[idx] = bestDx;
          flowY[idx] = bestDy;
          magnitude[idx] = mag;
        }
      }
    }
  }

  // Smooth the flow field with Gaussian blur
  const smoothFlowX = gaussianBlur(flowX, width, height, 2);
  const smoothFlowY = gaussianBlur(flowY, width, height, 2);
  const smoothMag = gaussianBlur(magnitude, width, height, 2);

  return { flowX: smoothFlowX, flowY: smoothFlowY, magnitude: smoothMag, width, height };
}

/**
 * Simple Gaussian blur for flow smoothing
 */
function gaussianBlur(data, width, height, radius) {
  const result = new Float32Array(width * height);
  const kernelSize = radius * 2 + 1;
  const kernel = [];

  // Create Gaussian kernel
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    const value = Math.exp(-(i * i) / (2 * radius * radius));
    kernel.push(value);
    sum += value;
  }
  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= sum;
  }

  // Apply blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let val = 0;
      for (let k = -radius; k <= radius; k++) {
        const nx = Math.min(width - 1, Math.max(0, x + k));
        val += data[y * width + nx] * kernel[k + radius];
      }
      result[y * width + x] = val;
    }
  }

  // Vertical pass
  const temp = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let val = 0;
      for (let k = -radius; k <= radius; k++) {
        const ny = Math.min(height - 1, Math.max(0, y + k));
        val += result[ny * width + x] * kernel[k + radius];
      }
      temp[y * width + x] = val;
    }
  }

  return temp;
}

/**
 * Warp a frame based on optical flow at time t (0-1)
 * @param {ImageData} frame - Source frame
 * @param {Object} flow - Optical flow field
 * @param {number} t - Interpolation parameter (0-1)
 * @returns {ImageData} Warped frame
 */
function warpFrame(frame, flow, t) {
  const { data, width, height } = frame;
  const { flowX, flowY } = flow;
  const result = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const resultIdx = idx * 4;

      // Get flow vector at this pixel
      const dx = flowX[idx] * t;
      const dy = flowY[idx] * t;

      // Source coordinates (backward warping)
      const srcX = Math.min(width - 1, Math.max(0, Math.round(x - dx)));
      const srcY = Math.min(height - 1, Math.max(0, Math.round(y - dy)));
      const srcIdx = srcY * width + srcX;

      // Copy pixel
      result[resultIdx] = data[srcIdx * 4];
      result[resultIdx + 1] = data[srcIdx * 4 + 1];
      result[resultIdx + 2] = data[srcIdx * 4 + 2];
      result[resultIdx + 3] = 255;
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Blend two frames with crossfade
 */
function blendFrames(frameA, frameB, t) {
  const { data: dataA, width, height } = frameA;
  const { data: dataB } = frameB;
  const result = new Uint8ClampedArray(dataA.length);

  for (let i = 0; i < dataA.length; i += 4) {
    result[i] = Math.round(dataA[i] * (1 - t) + dataB[i] * t);
    result[i + 1] = Math.round(dataA[i + 1] * (1 - t) + dataB[i + 1] * t);
    result[i + 2] = Math.round(dataA[i + 2] * (1 - t) + dataB[i + 2] * t);
    result[i + 3] = 255;
  }

  return new ImageData(result, width, height);
}

/**
 * Generate intermediate frames between existing frames using optical flow
 * @param {Array} frames - Array of frame ImageData objects
 * @param {number} targetCount - Target total frame count
 * @param {number} strength - Interpolation strength (0-100)
 * @returns {Array} Interpolated frames
 */
function interpolateFrames(frames, targetCount, strength = 50) {
  if (frames.length < 2) {
    // If only 1 frame, duplicate it
    return [frames[0], frames[0]];
  }

  const strengthFactor = strength / 100;
  const result = [];

  // Always keep the first frame
  result.push(frames[0]);

  // Calculate how many frames to add between each pair
  const totalSlots = targetCount - 1;
  const framesPairs = frames.length - 1;
  const framesPerPair = Math.floor(totalSlots / framesPairs);

  for (let pairIdx = 0; pairIdx < framesPairs; pairIdx++) {
    const frameA = frames[pairIdx];
    const frameB = frames[pairIdx + 1];

    // Compute optical flow
    const flow = computeOpticalFlow(frameA, frameB);

    // Determine how many intermediate frames to create
    const numTweens = Math.max(1, Math.floor(framesPerPair * strengthFactor));

    for (let i = 1; i <= numTweens; i++) {
      const t = i / (numTweens + 1);

      // Blend-based intermediate frame
      const blended = blendFrames(frameA, frameB, t);

      // Apply flow warping for motion-compensated interpolation
      if (strengthFactor > 0.3) {
        const warpedA = warpFrame(frameA, flow, t * strengthFactor);
        const warpedB = warpFrame(frameB, flow, (1 - t) * strengthFactor);
        const warpedBlend = blendFrames(warpedA, warpedB, 0.5);

        // Mix blended and flow-compensated based on strength
        const flowWeight = strengthFactor * 0.7;
        const mixed = blendFrames(blended, warpedBlend, flowWeight);
        result.push(mixed);
      } else {
        result.push(blended);
      }
    }

    // Keep the next original frame (unless it's the last pair)
    if (pairIdx < framesPairs - 1) {
      result.push(frameB);
    }
  }

  // Always keep the last frame
  if (result[result.length - 1] !== frames[frames.length - 1]) {
    result.push(frames[frames.length - 1]);
  }

  return result;
}

/**
 * Apply AI tweening to a set of canvas frames
 * @param {Array} canvasFrames - Array of {imgEl, name, duration} objects
 * @param {number} targetCount - Target frame count (4, 8, or 16)
 * @param {number} strength - Interpolation strength (0-100)
 * @returns {Promise<Array>} New frames with interpolated ones added
 */
async function applyAiTweening(canvasFrames, targetCount, strength) {
  if (canvasFrames.length === 0) return [];

  // If only 1 frame, duplicate it first
  let sourceFrames = canvasFrames;
  if (canvasFrames.length === 1) {
    sourceFrames = [canvasFrames[0], canvasFrames[0]];
  }

  // Convert canvas images to ImageData
  const frameDataArray = [];
  for (const frame of sourceFrames) {
    const imgEl = frame.imgEl;
    const canvas = document.createElement('canvas');
    canvas.width = imgEl.width;
    canvas.height = imgEl.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0);
    frameDataArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  // Interpolate
  const interpolated = interpolateFrames(frameDataArray, targetCount, strength);

  // Convert back to image elements
  const resultFrames = [];
  for (let i = 0; i < interpolated.length; i++) {
    const imgData = interpolated[i];
    const canvas = document.createElement('canvas');
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imgData, 0, 0);

    const newImgEl = new Image();
    await new Promise(resolve => {
      newImgEl.onload = resolve;
      newImgEl.src = canvas.toDataURL();
    });

    resultFrames.push({
      id: Date.now() + Math.random(),
      imgEl: newImgEl,
      name: `tween_${i + 1}`,
      duration: sourceFrames[0]?.duration || 100
    });
  }

  return resultFrames;
}

// ========== F32: AI STYLE TRANSFER ==========

/**
 * Style transfer presets configuration
 */
const STYLE_PRESETS = {
  retro: { contrast: 1.2, saturation: 0.8, sharpness: 1.5, palette: 'NES' },
  cyberpunk: { contrast: 1.5, saturation: 1.8, glow: 0.5, edgeGlow: 0.8 },
  cartoon: { edgeStrength: 0.8, flatten: 0.6, saturationBoost: 1.2 },
  pixelArt: { palette: 'PICO-8', dithering: 0.3, colors: 16 }
};

/**
 * Style names for display
 */
const STYLE_NAMES = {
  retro: 'Retro 8-bit',
  cyberpunk: 'Cyberpunk',
  cartoon: 'Cartoon',
  pixelArt: 'Pixel Art'
};

/**
 * Apply contrast adjustment to RGB
 */
function applyContrast(r, g, b, factor) {
  const factor255 = (259 * (factor * 255 + 255)) / (255 * (259 - factor * 255));
  return [
    Math.min(255, Math.max(0, factor255 * (r - 128) + 128)),
    Math.min(255, Math.max(0, factor255 * (g - 128) + 128)),
    Math.min(255, Math.max(0, factor255 * (b - 128) + 128))
  ];
}

/**
 * Apply saturation adjustment to RGB
 */
function applySaturation(r, g, b, factor) {
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  return [
    Math.min(255, Math.max(0, gray + factor * (r - gray))),
    Math.min(255, Math.max(0, gray + factor * (g - gray))),
    Math.min(255, Math.max(0, gray + factor * (b - gray)))
  ];
}

/**
 * Simple ordered dithering (4x4 Bayer matrix)
 */
function orderedDither(x, y, threshold) {
  const bayerMatrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];
  const val = bayerMatrix[y % 4][x % 4] / 16;
  return threshold + (val - 0.5) * 0.3;
}

/**
 * Floyd-Steinberg dithering error diffusion
 */
function floydSteinbergDither(pixels, width, height, palette, errorAccum) {
  const result = new Uint8ClampedArray(pixels.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Get original pixel with accumulated error
      let r = Math.min(255, Math.max(0, pixels[idx] + (errorAccum[idx] || 0)));
      let g = Math.min(255, Math.max(0, pixels[idx + 1] + (errorAccum[idx + 1] || 0)));
      let b = Math.min(255, Math.max(0, pixels[idx + 2] + (errorAccum[idx + 2] || 0)));

      // Find nearest palette color
      let best = palette[0] || [0, 0, 0], bestDist = Infinity;
      for (const c of palette) {
        const d = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;
        if (d < bestDist) { bestDist = d; best = c; }
      }

      // Set result
      result[idx] = best[0];
      result[idx + 1] = best[1];
      result[idx + 2] = best[2];
      result[idx + 3] = 255;

      // Calculate quantization error
      const errR = r - best[0];
      const errG = g - best[1];
      const errB = b - best[2];

      // Distribute error to neighbors (Floyd-Steinberg)
      const diffuse = [
        [1, 0, 7/16],
        [-1, 1, 3/16],
        [0, 1, 5/16],
        [1, 1, 1/16]
      ];

      for (const [dx, dy, factor] of diffuse) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = (ny * width + nx) * 4;
          errorAccum[nidx] = (errorAccum[nidx] || 0) + errR * factor;
          errorAccum[nidx + 1] = (errorAccum[nidx + 1] || 0) + errG * factor;
          errorAccum[nidx + 2] = (errorAccum[nidx + 2] || 0) + errB * factor;
        }
      }
    }
  }

  return result;
}

/**
 * Convert palette hex strings to RGB arrays
 */
function getPaletteRGBs(paletteName) {
  const palettes = {
    'PICO-8': [[0,0,0],[29,43,83],[126,37,83],[0,135,81],[171,82,54],[95,87,79],[194,195,199],[255,241,232],[255,0,77],[255,163,0],[255,236,39],[0,228,54],[41,173,255],[131,118,156],[255,119,168],[255,204,170]],
    'NES': [[0,0,0],[252,252,252],[248,248,248],[188,188,188],[124,124,124],[164,228,252],[60,188,252],[0,120,248],[0,0,252],[184,184,248],[104,136,252],[0,88,248],[0,0,188],[216,184,248],[152,120,248],[104,68,252],[68,40,188],[248,184,248],[248,120,248],[216,0,204],[148,0,132],[248,164,192],[248,88,152],[228,0,88],[168,0,32],[240,208,176],[248,120,88],[248,56,0],[168,16,0],[252,224,168],[252,160,68],[228,92,16],[136,20,0],[248,216,120],[248,184,0],[172,124,0],[80,48,0],[216,248,120],[184,248,24],[0,184,0],[0,120,0],[184,248,184],[88,216,84],[0,168,0],[0,104,0],[184,248,216],[88,248,152],[0,168,68],[0,88,0],[0,252,252],[0,232,216],[0,136,136],[0,64,88],[248,216,248],[120,120,120]],
    'GameBoy': [[15,56,15],[48,98,48],[139,172,15],[155,188,15]]
  };

  const palette = palettes[paletteName] || palettes['PICO-8'];
  return palette.map(c => Array.isArray(c) ? c : [
    parseInt(c.slice(1, 3), 16),
    parseInt(c.slice(3, 5), 16),
    parseInt(c.slice(5, 7), 16)
  ]);
}

/**
 * Sobel edge detection returning edge map
 */
function sobelEdgeMap(imageData) {
  const { data, width, height } = imageData;
  const edges = new Uint8ClampedArray(width * height);

  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          const ki = (ky + 1) * 3 + (kx + 1);
          gx += gray * sobelX[ki];
          gy += gray * sobelY[ki];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, magnitude);
    }
  }

  return edges;
}

/**
 * Apply Retro 8-bit style
 * - Limited color palette (NES style)
 * - Slight contrast boost
 * - Dithering for smooth gradients
 */
function applyRetroStyle(imageData, preset) {
  const { data, width, height } = imageData;
  const paletteRGBs = getPaletteRGBs(preset.palette || 'NES');

  // Apply contrast and saturation adjustments
  const adjusted = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    let [r, g, b] = applyContrast(data[i], data[i + 1], data[i + 2], preset.contrast - 1);
    [r, g, b] = applySaturation(r, g, b, preset.saturation);

    // Quantize to reduce color depth (simulate retro hardware)
    const quant = 4;
    r = Math.round(r / quant) * quant;
    g = Math.round(g / quant) * quant;
    b = Math.round(b / quant) * quant;

    adjusted[i] = r;
    adjusted[i + 1] = g;
    adjusted[i + 2] = b;
    adjusted[i + 3] = 255;
  }

  // Apply ordered dithering and quantize to palette
  const result = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Get adjusted pixel
      let r = adjusted[idx];
      let g = adjusted[idx + 1];
      let b = adjusted[idx + 2];

      // Dithering threshold based on position
      const threshold = orderedDither(x, y, 0);

      // Find nearest palette color
      let best = paletteRGBs[0], bestDist = Infinity;
      for (const c of paletteRGBs) {
        const brightness = (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) / 255;
        const adjustedBrightness = brightness + threshold - 0.5;
        const d = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;
        const dist = d + (adjustedBrightness < 0 ? -adjustedBrightness * 50 : adjustedBrightness * 20);
        if (dist < bestDist) { bestDist = dist; best = c; }
      }

      result[idx] = best[0];
      result[idx + 1] = best[1];
      result[idx + 2] = best[2];
      result[idx + 3] = 255;
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Apply Cyberpunk style
 * - High contrast and saturation
 * - Neon color mapping (shift towards cyan/magenta)
 * - Edge glow effect
 */
function applyCyberpunkStyle(imageData, preset) {
  const { data, width, height } = imageData;
  const edgeMap = sobelEdgeMap(imageData);

  const result = new Uint8ClampedArray(data.length);

  // Neon color targets for cyberpunk effect
  const neonCyans = [[0, 255, 255], [0, 200, 255], [0, 150, 255]];
  const neonMagentas = [[255, 0, 255], [255, 0, 200], [255, 50, 150]];
  const neonYellows = [[255, 255, 0], [255, 200, 0]];

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply high contrast
    [r, g, b] = applyContrast(r, g, b, preset.contrast);

    // Apply high saturation
    [r, g, b] = applySaturation(r, g, b, preset.saturation);

    // Calculate brightness and hue
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const [h, s, l] = rgbToHsl(r, g, b);

    // Edge glow effect
    const pixelIdx = i / 4;
    const edgeVal = edgeMap[pixelIdx] / 255;

    if (edgeVal > 0.3) {
      // This is an edge pixel - apply neon glow
      const glowIntensity = edgeVal * preset.edgeGlow;

      // Determine if this edge should be cyan or magenta based on original hue
      const isWarmEdge = h < 180;

      if (brightness > 0.5) {
        // Bright edge - cyan glow
        const neonColor = neonCyans[Math.floor(brightness * 2.99)];
        r = Math.round(r + (neonColor[0] - r) * glowIntensity);
        g = Math.round(g + (neonColor[1] - g) * glowIntensity);
        b = Math.round(b + (neonColor[2] - b) * glowIntensity);
      } else {
        // Dark edge - magenta glow
        const neonColor = neonMagentas[Math.floor(brightness * 2.99)];
        r = Math.round(r + (neonColor[0] - r) * glowIntensity * 0.7);
        g = Math.round(g + (neonColor[1] - g) * glowIntensity * 0.7);
        b = Math.round(b + (neonColor[2] - b) * glowIntensity * 0.7);
      }
    } else {
      // Non-edge pixel - apply color shift towards neon palette
      if (s > 50 && brightness > 0.4) {
        // High saturation bright areas - shift towards neon
        if (h > 180 && h < 300) {
          // Purple/blue range -> more cyan
          const shift = Math.min(0.3, (s / 100) * 0.3);
          b = Math.min(255, b + shift * 50);
          g = Math.min(255, g + shift * 30);
        } else if (h > 0 && h < 60) {
          // Red/yellow range -> more magenta/yellow
          const shift = Math.min(0.2, (s / 100) * 0.2);
          r = Math.min(255, r + shift * 30);
          b = Math.min(255, b + shift * 40);
        }
      }

      // Boost shadows to deep purple/blue
      if (brightness < 0.2) {
        const shadowFactor = (0.2 - brightness) / 0.2;
        r = Math.max(0, r - shadowFactor * 20);
        g = Math.max(0, g - shadowFactor * 10);
        b = Math.min(255, b + shadowFactor * 30);
      }
    }

    // Clamp values
    result[i] = Math.min(255, Math.max(0, r));
    result[i + 1] = Math.min(255, Math.max(0, g));
    result[i + 2] = Math.min(255, Math.max(0, b));
    result[i + 3] = 255;
  }

  return new ImageData(result, width, height);
}

/**
 * Apply Cartoon style
 * - Edge detection for outlines
 * - Flatten colors (reduce gradients)
 * - Boost saturation slightly
 */
function applyCartoonStyle(imageData, preset) {
  const { data, width, height } = imageData;
  const edgeMap = sobelEdgeMap(imageData);

  const result = new Uint8ClampedArray(data.length);

  // First pass: flatten colors by quantizing to fewer levels
  const levels = 6; // Reduce to 6 levels per channel

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply saturation boost
    [r, g, b] = applySaturation(r, g, b, preset.saturationBoost);

    // Flatten: quantize to fewer levels
    const factor = 255 / levels;
    r = Math.round(Math.round(r / factor) * factor);
    g = Math.round(Math.round(g / factor) * factor);
    b = Math.round(Math.round(b / factor) * factor);

    result[i] = r;
    result[i + 1] = g;
    result[i + 2] = b;
    result[i + 3] = 255;
  }

  // Second pass: apply edge outlines
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const edgeVal = edgeMap[idx] / 255;

      if (edgeVal > preset.edgeStrength * 0.5) {
        // Draw dark outline
        const outlineIntensity = Math.min(1, (edgeVal - preset.edgeStrength * 0.5) / 0.3);
        const darkenFactor = 1 - outlineIntensity * 0.7;

        result[idx] = Math.round(result[idx] * darkenFactor);
        result[idx + 1] = Math.round(result[idx + 1] * darkenFactor);
        result[idx + 2] = Math.round(result[idx + 2] * darkenFactor);
      }
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Apply Pixel Art style
 * - Adaptive palette (PICO-8 style)
 * - Floyd-Steinberg dithering
 * - Sharp pixel look
 */
function applyPixelArtStyle(imageData, preset) {
  const { data, width, height } = imageData;
  const paletteRGBs = getPaletteRGBs(preset.palette || 'PICO-8');

  // Quantize input colors first
  const adjusted = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    // Slight contrast boost for punchier colors
    let [r, g, b] = applyContrast(data[i], data[i + 1], data[i + 2], 1.1);

    adjusted[i] = r;
    adjusted[i + 1] = g;
    adjusted[i + 2] = b;
    adjusted[i + 3] = 255;
  }

  // Apply Floyd-Steinberg dithering
  const errorAccum = new Float32Array(data.length);
  const dithered = floydSteinbergDither(adjusted, width, height, paletteRGBs, errorAccum);

  return new ImageData(dithered, width, height);
}

/**
 * Main style transfer function
 * @param {ImageData} imageData - Source image data
 * @param {string} style - Style name ('retro', 'cyberpunk', 'cartoon', 'pixelArt')
 * @returns {ImageData} Styled image data
 */
function applyStyleTransfer(imageData, style) {
  const preset = STYLE_PRESETS[style];
  if (!preset) {
    console.error('Unknown style:', style);
    return imageData;
  }

  switch (style) {
    case 'retro':
      return applyRetroStyle(imageData, preset);
    case 'cyberpunk':
      return applyCyberpunkStyle(imageData, preset);
    case 'cartoon':
      return applyCartoonStyle(imageData, preset);
    case 'pixelArt':
      return applyPixelArtStyle(imageData, preset);
    default:
      return imageData;
  }
}

/**
 * Apply style transfer to canvas and return result canvas
 * @param {HTMLCanvasElement} srcCanvas - Source canvas
 * @param {string} style - Style name
 * @returns {HTMLCanvasElement} Result canvas with styled image
 */
function applyStyleTransferToCanvas(srcCanvas, style) {
  const ctx = srcCanvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const styledData = applyStyleTransfer(imageData, style);

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = srcCanvas.width;
  resultCanvas.height = srcCanvas.height;
  const resultCtx = resultCanvas.getContext('2d');
  resultCtx.putImageData(styledData, 0, 0);

  return resultCanvas;
}

// ========== F34: SKETCH TO PIXEL ART ==========

/**
 * Adaptive threshold binarization
 * Converts grayscale image to binary (black/white) based on local neighborhood
 */
function adaptiveThreshold(imageData, blockSize = 11, c = 2) {
  const { data, width, height } = imageData;
  const gray = new Uint8Array(width * height);
  const result = new Uint8ClampedArray(data.length);

  // Convert to grayscale
  for (let i = 0; i < width * height; i++) {
    gray[i] = data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114;
  }

  // For each pixel, compute local mean and apply threshold
  const half = Math.floor(blockSize / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0, count = 0;

      // Compute local mean
      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          sum += gray[ny * width + nx];
          count++;
        }
      }

      const localMean = sum / count;
      const idx = (y * width + x) * 4;
      const val = gray[y * width + x] > localMean - c ? 255 : 0;

      result[idx] = val;
      result[idx + 1] = val;
      result[idx + 2] = val;
      result[idx + 3] = 255;
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Simple global threshold binarization
 */
function globalThreshold(imageData, threshold) {
  const { data, width, height } = imageData;
  const result = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const val = gray > threshold ? 255 : 0;
    result[i] = val;
    result[i + 1] = val;
    result[i + 2] = val;
    result[i + 3] = 255;
  }

  return new ImageData(result, width, height);
}

/**
 * Morphological dilation - expands white regions
 */
function morphologyDilate(binaryData, width, height, iterations = 1) {
  let data = new Uint8Array(binaryData);

  for (let iter = 0; iter < iterations; iter++) {
    const newData = new Uint8Array(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (data[idx] === 255) {
          // Set all neighbors to white
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              newData[(y + dy) * width + (x + dx)] = 255;
            }
          }
        }
      }
    }

    data = newData;
  }

  return data;
}

/**
 * Morphological erosion - shrinks white regions
 */
function morphologyErode(binaryData, width, height, iterations = 1) {
  let data = new Uint8Array(binaryData);

  for (let iter = 0; iter < iterations; iter++) {
    const newData = new Uint8Array(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        // Check if all neighbors (including center) are white
        let allWhite = true;
        for (let dy = -1; dy <= 1 && allWhite; dy++) {
          for (let dx = -1; dx <= 1 && allWhite; dx++) {
            if (data[(y + dy) * width + (x + dx)] !== 255) {
              allWhite = false;
            }
          }
        }

        newData[idx] = allWhite ? 255 : 0;
      }
    }

    data = newData;
  }

  return data;
}

/**
 * Morphological opening - erosion followed by dilation (removes noise)
 */
function morphologyOpen(binaryData, width, height, kernelSize = 2) {
  const eroded = morphologyErode(binaryData, width, height, kernelSize);
  const opened = morphologyDilate(eroded, width, height, kernelSize);
  return opened;
}

/**
 * Morphological closing - dilation followed by erosion (fills gaps)
 */
function morphologyClose(binaryData, width, height, kernelSize = 2) {
  const dilated = morphologyDilate(binaryData, width, height, kernelSize);
  const closed = morphologyErode(dilated, width, height, kernelSize);
  return closed;
}

/**
 * Zhang-Suen thinning algorithm for skeletonization
 * Reduces thick lines to single-pixel width
 */
function thinLine(binaryData, width, height) {
  // Create a copy as Uint8Array for easier manipulation
  let data = new Uint8Array(binaryData.length / 4);
  for (let i = 0; i < data.length; i++) {
    data[i] = binaryData[i * 4] > 128 ? 1 : 0; // 1 = white, 0 = black
  }

  const neighbors = (i) => {
    const y = Math.floor(i / width);
    const x = i % width;
    return [
      y > 0 ? data[i - width] : 0,           // p1 - north
      y > 0 && x < width - 1 ? data[i - width + 1] : 0, // p2 - northeast
      x < width - 1 ? data[i + 1] : 0,       // p3 - east
      y < height - 1 && x < width - 1 ? data[i + width + 1] : 0, // p4 - southeast
      y < height - 1 ? data[i + width] : 0,   // p5 - south
      y < height - 1 && x > 0 ? data[i + width - 1] : 0, // p6 - southwest
      x > 0 ? data[i - 1] : 0,               // p7 - west
      y > 0 && x > 0 ? data[i - width - 1] : 0  // p8 - northwest
    ];
  };

  const countNonZero = (arr) => arr.reduce((a, b) => a + b, 0);

  // Iterate until no changes
  let changed = true;
  let iterations = 0;
  const maxIterations = 50;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Two sub-iterations
    for (let subIter = 0; subIter < 2; subIter++) {
      const toRemove = [];

      for (let i = 0; i < data.length; i++) {
        if (data[i] !== 1) continue; // Only thin white pixels

        const [p1, p2, p3, p4, p5, p6, p7, p8] = neighbors(i);
        const BC = countNonZero([p2, p3, p4, p5, p6, p7, p8]);
        const A = [p2, p3, p4, p5, p6, p7, p8, p2]; // for checking transitions

        // Count transitions from 0 to 1 in the sequence p2,p3,p4,p5,p6,p7,p8,p2
        let A_count = 0;
        for (let j = 0; j < 8; j++) {
          if (A[j] === 0 && A[(j + 1) % 8] === 1) A_count++;
        }

        // Zhang-Suen conditions
        const cond1 = BC >= 2 && BC <= 6;
        const cond2 = A_count === 1;

        let cond3, cond4;
        if (subIter === 0) {
          cond3 = p2 * p4 * p6 === 0;
          cond4 = p4 * p6 * p8 === 0;
        } else {
          cond3 = p2 * p4 * p8 === 0;
          cond4 = p2 * p6 * p8 === 0;
        }

        if (cond1 && cond2 && cond3 && cond4) {
          toRemove.push(i);
        }
      }

      // Remove pixels in batch
      for (const i of toRemove) {
        data[i] = 0;
        changed = true;
      }
    }
  }

  // Convert back to binary image data
  const result = new Uint8ClampedArray(data.length * 4);
  for (let i = 0; i < data.length; i++) {
    const val = data[i] ? 255 : 0;
    result[i * 4] = val;
    result[i * 4 + 1] = val;
    result[i * 4 + 2] = val;
    result[i * 4 + 3] = 255;
  }

  return new ImageData(result, width, height);
}

/**
 * Detect if sketch is white-on-black or black-on-white
 * Returns 'normal' for white-on-black (dark lines on light bg)
 * Returns 'inverted' for black-on-white (light lines on dark bg)
 */
function detectSketchMode(imageData) {
  const { data, width, height } = imageData;

  // Sample a border region to determine background
  let borderSum = 0;
  let borderCount = 0;
  const borderWidth = Math.max(3, Math.floor(Math.min(width, height) * 0.05));

  // Top and bottom rows
  for (let x = 0; x < width; x++) {
    for (let b = 0; b < borderWidth; b++) {
      const idx = (b * width + x) * 4;
      borderSum += data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      borderCount++;
    }
    for (let b = 0; b < borderWidth; b++) {
      const idx = ((height - 1 - b) * width + x) * 4;
      borderSum += data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      borderCount++;
    }
  }

  // Left and right columns (excluding corners already counted)
  for (let y = borderWidth; y < height - borderWidth; y++) {
    for (let b = 0; b < borderWidth; b++) {
      const idx = (y * width + b) * 4;
      borderSum += data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      borderCount++;
    }
    for (let b = 0; b < borderWidth; b++) {
      const idx = (y * width + (width - 1 - b)) * 4;
      borderSum += data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      borderCount++;
    }
  }

  const avgBorder = borderSum / borderCount;

  // If border is light (avg > 127), it's white background -> dark lines
  // If border is dark (avg <= 127), it's black background -> light lines
  return avgBorder > 127 ? 'normal' : 'inverted';
}

/**
 * Invert binary image
 */
function invertBinary(binaryData) {
  const result = new Uint8ClampedArray(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    result[i] = 255 - binaryData[i];
  }
  return result;
}

/**
 * Pixelate the skeletonized sketch
 * @param {ImageData} imageData - Binary skeletonized image
 * @param {number} pixelSize - Size of each "pixel" block
 * @param {number} lineColor - RGB array for line color [r, g, b]
 * @param {number} bgColor - RGB array for background color [r, g, b]
 */
function pixelateSketch(imageData, pixelSize, lineColor, bgColor) {
  const { data, width, height } = imageData;
  const result = new Uint8ClampedArray(data.length);

  // Initialize with background
  for (let i = 0; i < result.length; i += 4) {
    result[i] = bgColor[0];
    result[i + 1] = bgColor[1];
    result[i + 2] = bgColor[2];
    result[i + 3] = 255;
  }

  // Downsample and assign colors
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Check if this block contains any white pixels (lines)
      let hasLine = false;
      let count = 0;

      for (let py = 0; py < pixelSize && y + py < height; py++) {
        for (let px = 0; px < pixelSize && x + px < width; px++) {
          const idx = ((y + py) * width + (x + px)) * 4;
          if (data[idx] > 128) {
            hasLine = true;
          }
          count++;
        }
      }

      // Fill this block with line color if it contains a line
      const fillColor = hasLine ? lineColor : bgColor;

      for (let py = 0; py < pixelSize && y + py < height; py++) {
        for (let px = 0; px < pixelSize && x + px < width; px++) {
          const idx = ((y + py) * width + (x + px)) * 4;
          result[idx] = fillColor[0];
          result[idx + 1] = fillColor[1];
          result[idx + 2] = fillColor[2];
          result[idx + 3] = 255;
        }
      }
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Apply sketch line thickness by dilation
 * @param {Uint8Array} binaryData - Binary image data (as processed array)
 * @param {number} width
 * @param {number} height
 * @param {number} thickness - Line thickness in pixels (1-5)
 */
function applyLineThickness(binaryData, width, height, thickness) {
  if (thickness <= 1) return binaryData;

  const binaryImgData = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const val = binaryData[i] ? 255 : 0;
    binaryImgData[i * 4] = val;
    binaryImgData[i * 4 + 1] = val;
    binaryImgData[i * 4 + 2] = val;
    binaryImgData[i * 4 + 3] = 255;
  }

  const dilated = morphologyDilate(binaryImgData, width, height, thickness - 1);

  // Convert back to 1-channel
  const result = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    result[i] = dilated[i * 4] > 128 ? 255 : 0;
  }

  return result;
}

/**
 * Main sketch-to-pixel-art conversion function
 *
 * @param {HTMLCanvasElement} canvas - Source canvas with sketch image
 * @param {Object} options - Conversion options
 * @param {number} options.pixelSize - Size of output pixels (e.g., 4, 8)
 * @param {number} options.lineThickness - Line thickness 1-5
 * @param {number} options.smoothing - Noise reduction strength 0-100
 * @param {string} options.lineColor - Hex color for lines
 * @param {string} options.bgColor - Hex color for background
 * @returns {ImageData} Pixelated sketch image data
 */
function sketchToPixelArt(canvas, options = {}) {
  const {
    pixelSize = 4,
    lineThickness = 2,
    smoothing = 50,
    lineColor = '#000000',
    bgColor = '#ffffff'
  } = options;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);

  // Step 1: Detect sketch mode (white-on-black or black-on-white)
  const mode = detectSketchMode(imageData);

  // Step 2: Convert to grayscale and binarize
  const blockSize = Math.max(3, Math.floor(Math.min(width, height) / 30));
  blockSize + (blockSize % 2 === 0 ? 1 : 0); // Ensure odd
  const binaryData = adaptiveThreshold(imageData, blockSize || 11, 3);

  // Step 3: Invert if black-on-white mode
  let processed = binaryData.data;
  if (mode === 'inverted') {
    processed = invertBinary(processed);
  }

  // Step 4: Morphological operations to clean up
  const kernelSize = Math.max(1, Math.floor(smoothing / 33)); // 0-100 -> 0-3
  if (kernelSize > 0) {
    processed = morphologyOpen(processed, width, height, kernelSize);
    processed = morphologyClose(processed, width, height, kernelSize);
  }

  // Step 5: Thinning/skeletonization
  const thinData = thinLine(processed, width, height);

  // Step 6: Apply line thickness
  const thickData = applyLineThickness(
    new Uint8Array(thinData.data.buffer),
    width,
    height,
    lineThickness
  );

  // Step 7: Pixelate with colors
  const lineRGB = hexToRgb(lineColor);
  const bgRGB = hexToRgb(bgColor);

  const pixelated = pixelateSketch(
    new ImageData(new Uint8ClampedArray(thickData.buffer), width, height),
    pixelSize,
    lineRGB,
    bgRGB
  );

  return {
    imageData: pixelated,
    mode,
    width: Math.floor(width / pixelSize),
    height: Math.floor(height / pixelSize)
  };
}

/**
 * Convert hex color to RGB array
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

/**
 * Apply sketch-to-pixel-art to canvas, returns new canvas
 * @param {HTMLCanvasElement} srcCanvas - Source canvas with sketch
 * @param {Object} options - Conversion options
 * @returns {HTMLCanvasElement} Pixelated sketch canvas
 */
function applySketchToPixelArt(srcCanvas, options) {
  const result = sketchToPixelArt(srcCanvas, options);

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = result.width;
  resultCanvas.height = result.height;
  const ctx = resultCanvas.getContext('2d');
  ctx.putImageData(result.imageData, 0, 0);

  return resultCanvas;
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    recommendPalette, classifyScene, PALETTE_PRESETS, aiPixelate, applyAiPixelateToCanvas,
    applyAiTweening, interpolateFrames, computeOpticalFlow,
    applyStyleTransfer, applyStyleTransferToCanvas, STYLE_PRESETS, STYLE_NAMES,
    sketchToPixelArt, applySketchToPixelArt, detectSketchMode
  };
}