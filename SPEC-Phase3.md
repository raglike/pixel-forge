# PixelForge Phase 3: 3D预览版 规格文档

> 版本：1.0
> 创建：2026-04-11
> 状态：开发中
> 负责：@开

---

## 一、Phase 3 功能清单

| 功能 | 编号 | 描述 | 技术方案 |
|------|------|------|---------|
| 3D场景预览 | F20 | 将像素Sprite放入3D场景 | Three.js Scene + CanvasTexture |
| 自由视角 | F21 | 鼠标拖拽旋转+滚轮缩放 | OrbitControls |
| 固定视角 | F22 | 正面/侧面/背面/顶视一键切换 | OrthographicCamera |
| 光照调节 | F23 | 环境光+平行光强度控制 | AmbientLight + DirectionalLight |
| Billboard Sprite | F24 | 2D像素图3D化展示 | THREE.Sprite |

---

## 二、技术架构

### 2.1 依赖
- Three.js (CDN): `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js`
- OrbitControls (CDN): `https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js`

### 2.2 新增Tab结构
```jsx
const [activeTab, setActiveTab] = useState('main');
// tabs: 'main' | '3dpreview'

// 3D Preview Tab JSX结构
<div className="tab-content" data-tab="3dpreview">
  <div className="flex gap-4 h-full">
    {/* 左侧：3D画布 */}
    <div className="flex-1 relative">
      <canvas id="three-canvas" className="w-full h-full rounded" />
      {/* 视角切换按钮 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button data-view="front">正面</button>
        <button data-view="side">侧面</button>
        <button data-view="back">背面</button>
        <button data-view="top">顶视</button>
        <button data-view="free">自由</button>
      </div>
    </div>
    {/* 右侧：控制面板 */}
    <div className="w-64 flex flex-col gap-4">
      {/* 背景设置 */}
      <div className="panel">
        <h4>背景</h4>
        <div className="flex gap-2">
          <button data-bg="solid">纯色</button>
          <button data-bg="checker">棋盘格</button>
          <button data-bg="custom">自定义</button>
        </div>
        <input type="color" id="bg-color" value="#1a1a2e" />
      </div>
      {/* 光照设置 */}
      <div className="panel">
        <h4>光照</h4>
        <label>环境光</label>
        <input type="range" id="ambient-light" min="0" max="1" step="0.1" value="0.5" />
        <label>平行光</label>
        <input type="range" id="directional-light" min="0" max="2" step="0.1" value="1" />
        <label>平行光方向</label>
        <div className="flex gap-1">
          <input type="range" id="light-x" min="-1" max="1" step="0.1" value="1" />
          <input type="range" id="light-y" min="-1" max="1" step="0.1" value="1" />
          <input type="range" id="light-z" min="-1" max="1" step="0.1" value="1" />
        </div>
      </div>
      {/* Sprite属性 */}
      <div className="panel">
        <h4>缩放</h4>
        <input type="range" id="sprite-scale" min="0.1" max="5" step="0.1" value="1" />
        <span id="scale-value">1.0x</span>
      </div>
    </div>
  </div>
</div>
```

### 2.3 Three.js 初始化流程
```
1. 创建Scene
2. 创建PerspectiveCamera (FOV=60)
3. 创建WebGLRenderer (antialias=false，像素风格)
4. 创建CanvasTexture (当前帧canvas)
5. 创建THREE.Sprite (用Texture)
6. 创建AmbientLight + DirectionalLight
7. 初始化OrbitControls
8. 监听窗口resize
9. 动画循环 renderer.render(scene, camera)
```

### 2.4 相机预设
| 视角 | position | up |
|------|----------|-----|
| 正面 | (0, 0, 5) | (0,1,0) |
| 侧面 | (5, 0, 0) | (0,1,0) |
| 背面 | (0, 0, -5) | (0,1,0) |
| 顶视 | (0, 5, 0) | (0,0,-1) |

---

## 三、样式要求

### 3.1 CSS变量（复用现有）
```css
/* 复用 PixelForge 暗色主题 */
--bg-primary: #0d0d0d;
--bg-secondary: #1a1a1a;
--accent: #00ff88;
```

### 3.2 Tab按钮
在现有 tab-bar 中新增：
```jsx
<button className={`tab-btn ${activeTab === '3dpreview' ? 'active' : ''}`} 
        onClick={() => setActiveTab('3dpreview')}>
  3D预览
</button>
```

### 3.3 3D画布容器
```css
#three-canvas {
  background: #1a1a2e;
  border-radius: 8px;
  cursor: grab;
}
#three-canvas:active { cursor: grabbing; }
```

---

## 四、核心实现细节

### 4.1 Canvas到Three.js纹理
```js
// 当前帧canvas转为Three.js纹理
const canvas = exportFrameAsCanvas(currentFrameIndex);
const texture = new THREE.CanvasTexture(canvas);
texture.minFilter = THREE.NearestFilter;  // 像素风格
texture.magFilter = THREE.NearestFilter;
const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
const sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(scale, scale, 1);
scene.add(sprite);
```

### 4.2 像素风格渲染
```js
renderer.setPixelRatio(1);  // 不缩放
gl.disable(gl.ANTIALIAS);   // 禁用抗锯齿
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
```

### 4.3 OrbitControls配置
```js
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.minDistance = 1;
controls.maxDistance = 20;
```

### 4.4 帧切换同步
- 当用户在2D标签页切换帧时，3D预览同步更新纹理
- 监听 `currentFrame` 变化，重新生成 CanvasTexture

---

## 五、背景设置

| 类型 | 实现 |
|------|------|
| 纯色 | `scene.background = new THREE.Color(color)` |
| 棋盘格 | 生成 16x16 重复纹理，禁用抗锯齿 |
| 自定义图片 | 用户上传图片作为背景 |

---

## 六、交付检查清单

- [ ] 3D预览Tab存在且可切换
- [ ] Three.js场景正常渲染
- [ ] 当前帧像素图作为Billboard显示
- [ ] 自由视角可旋转缩放
- [ ] 四个固定视角一键切换正常
- [ ] 环境光强度可调
- [ ] 平行光强度和方向可调
- [ ] 背景颜色可换
- [ ] Sprite缩放有效
- [ ] 帧切换后3D预览同步更新
- [ ] 像素边缘保持清晰（无抗锯齿）

---

## 七、文件位置
- 代码文件：`/root/.openclaw/workspace/projects/pixel-animation-tool/index.html`
- 本规格：`/root/.openclaw/workspace/projects/pixel-animation-tool/SPEC-Phase3.md`
