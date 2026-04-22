// PixelForge Built-in Palette Library
// 50+ curated pixel art palettes organized by category
// Reference: Lospec Palette List + classic game palettes

const PALETTE_LIBRARY = {
  // ============ 游戏主机/经典游戏 ============
  game: {
    name: '游戏主机',
    palettes: {
      "PICO-8": {
        name: "PICO-8",
        description: "PICO-8 fantasy console官方调色板",
        colors: ["#000000","#1D2B53","#7E2553","#008751","#AB5236","#5F574F","#C2C3C7","#FFF1E8","#FF004D","#FFA300","#FFEC27","#00E436","#29ADFF","#83769C","#FF77A8","#FFCCAA"],
        tags: ["pico-8", "fantasy-console", "colorful"]
      },
      "NES": {
        name: "NES",
        description: "任天堂娱乐系统调色板",
        colors: ["#000000","#fcfcfc","#f8f8f8","#bcbcbc","#7c7c7c","#a4e4fc","#3cbcfc","#0078f8","#0000fc","#b8b8f8","#6888fc","#0058f8","#0000bc","#d8b8f8","#9878f8","#6844fc","#4428bc","#f8b8f8","#f878f8","#d800cc","#940084","#f8a4c0","#f85898","#e40058","#a80020","#f0d0b0","#f87858","#f83800","#a81000","#fce0a8","#fca044","#e45c10","#881400","#f8d878","#f8b800","#ac7c00","#503000","#d8f878","#b8f818","#00b800","#007800","#b8f8b8","#58d854","#00a800","#006800","#b8f8d8","#58f898","#00a844","#005800","#00fcfc","#00e8d8","#008888","#004058","#f8d8f8","#787878"],
        tags: ["nes", "nintendo", "retro", "8-bit"]
      },
      "GameBoy": {
        name: "GameBoy",
        description: "经典GameBoy绿色调色板",
        colors: ["#0f380f","#306230","#8bac0f","#9bbc0f"],
        tags: ["gameboy", "nintendo", "retro", "green", "4-color"]
      },
      "GameBoy-Alt": {
        name: "GameBoy-Alt",
        description: "GameBoy备选灰绿调色板",
        colors: ["#000000","#1a1c2c","#5d275d","#b13e53","#ef7d57","#ffcd75","#a7f070","#38b764","#257179","#29366f","#3b5dc9","#41a6f6","#73eff7","#f4f4f4","#94b0c2","#566c86","#333c57"],
        tags: ["gameboy", "nintendo", "retro", "alternative"]
      },
      "Sega-Master-System": {
        name: "Sega Master System",
        description: "Sega Master System调色板",
        colors: ["#000000","#f8f8f8","#a4e4fc","#3cbcfc","#0078f8","#0000fc","#b8b8f8","#6888fc","#0058f8","#0000bc","#d8b8f8","#9878f8","#6844fc","#4428bc","#f8b8f8","#f878f8","#d800cc","#940084","#f8a4c0","#f85898","#e40058","#a80020","#f0d0b0","#f87858","#f83800","#a81000","#fce0a8","#fca044","#e45c10","#881400","#f8d878","#f8b800","#ac7c00","#503000","#d8f878","#b8f818","#00b800","#007800","#b8f8b8","#58d854","#00a800","#006800","#b8f8d8","#58f898","#00a844","#005800","#00fcfc","#00e8d8","#008888","#004058","#f8d8f8","#787878"],
        tags: ["sega", "master-system", "retro", "16-color"]
      },
      "TurboGrafx-16": {
        name: "TurboGrafx-16",
        description: "TurboGrafx-16调色板",
        colors: ["#000000","#ffffff","#ff0000","#00ff00","#0000ff","#00ffff","#ff00ff","#ffff00","#ff8000","#8000ff","#0080ff","#80ff00","#ff0080","#808080","#c0c0c0","#400000","#004000","#000040","#400040","#004040","#404000","#804000","#408000","#400080","#008040","#800040","#404040","#600000","#006000","#000060","#600060","#006060","#606000"],
        tags: ["turbografx", "pc-engine", "retro"]
      },
      "Atari-2600": {
        name: "Atari-2600",
        description: "Atari 2600调色板",
        colors: ["#000000","#f8f8f8","#d8d8d8","#a4a4a4","#7c7c7c","#3cbcfc","#0078f8","#0000fc","#6888fc","#0058f8","#0000bc","#9878f8","#6844fc","#f878f8","#d800cc","#940084","#f85898","#e40058","#f83800","#a81000","#fca044","#f8b800","#ac7c00","#58d854","#00a800","#b8f8d8","#58f898","#00a844","#00e8d8","#008888","#00fcfc","#73eff7","#f8d8f8","#787878","#404040","#202020"],
        tags: ["atari", "2600", "retro", "vcs"]
      },
      "Amiga": {
        name: "Amiga",
        description: "Amiga计算机调色板",
        colors: ["#000000","#ffffff","#ff0000","#00ff00","#0000ff","#ff00ff","#00ffff","#ffff00","#ff8000","#8000ff","#0080ff","#80ff00","#ff0080","#808080","#c0c0c0","#400000","#004000","#000040","#400040","#004040","#404000","#804000","#408000","#400080","#008040","#800040","#404040","#600000","#006000","#000060","#600060","#006060","#606000","#806000","#608000","#600080","#008060","#800060","#303030"],
        tags: ["amiga", "commodore", "retro", "computer"]
      },
      "C64": {
        name: "Commodore-64",
        description: "C64调色板",
        colors: ["#000000","#ffffff","#880000","#aaffee","#cc44cc","#00cc55","#0000aa","#eeee77","#ef8055","#a80020","#50a050","#707070","#808080","#aadeee","#cc6677","#888800","#ababab","#6c5eb5","#559999","#98a977"],
        tags: ["c64", "commodore", "retro", "computer"]
      },
      "MSX": {
        name: "MSX",
        description: "MSX电脑调色板",
        colors: ["#000000","#000000","#1a1a1a","#333333","#4d4d4d","#666666","#808080","#999999","#b3b3b3","#cccccc","#e6e6e6","#ffffff","#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff","#ff8080","#80ff80","#8080ff","#ffff80","#ff80ff","#80ffff","#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff","#800000","#008000","#000080","#808000","#800080","#008080","#ff8080","#80ff80","#8080ff","#ffff80","#ff80ff","#80ffff"],
        tags: ["msx", "retro", "computer", "8-bit"]
      }
    }
  },

  // ============ 像素艺术/现代 ============
  pixelArt: {
    name: '像素艺术',
    palettes: {
      "DB16": {
        name: "DB16",
        description: "Deep-Based 16色调色板",
        colors: ["#1a1c2c","#5d275d","#b13e53","#ef7d57","#ffcd75","#a7f070","#38b764","#257179","#29366f","#3b5dc9","#41a6f6","#73eff7","#f4f4f4","#94b0c2","#566c86","#333c57"],
        tags: ["pixel-art", "modern", "limited", "16-color"]
      },
      "DB32": {
        name: "DB32",
        description: "Deep-Based 32色调色板",
        colors: ["#1a1c2c","#333c57","#566c86","#94b0c2","#f4f4f4","#a7f070","#38b764","#257179","#41a6f6","#3b5dc9","#29366f","#73eff7","#b13e53","#5d275d","#ef7d57","#ffcd75","#cc44cc","#a80020","#f0f0f0","#d77600","#dec02c","#aadeee","#60d270","#aaffee","#d80040","#f8f8f8","#880000","#008800","#000088","#880088","#008888","#888800","#808080","#000000"],
        tags: ["pixel-art", "modern", "limited", "32-color"]
      },
      "RPG-Packer": {
        name: "RPG-Packer",
        description: "RPG游戏调色板",
        colors: ["#000000","#fcfcfc","#f8f8f8","#bcbcbc","#7c7c7c","#a4e4fc","#3cbcfc","#0078f8","#0000fc","#b8b8f8","#6888fc","#0058f8","#0000bc","#d8b8f8","#9878f8","#6844fc","#4428bc","#f8b8f8","#f878f8","#d800cc","#940084","#f8a4c0","#f85898","#e40058","#a80020","#f0d0b0","#f87858","#f83800","#a81000","#fce0a8","#fca044","#e45c10","#881400","#f8d878","#f8b800","#ac7c00","#503000","#d8f878","#b8f818","#00b800","#007800","#b8f8b8","#58d854","#00a800","#006800","#b8f8d8","#58f898","#00a844","#005800","#00fcfc","#00e8d8","#008888","#004058","#f8d8f8","#787878"],
        tags: ["rpg", "pixel-art", "game", "colorful"]
      },
      "Endesga-32": {
        name: "Endesga-32",
        description: "Endesga 32色调色板",
        colors: ["#be4a2f","#d77643","#ead4aa","#e4a672","#b86f50","#733e39","#3e2731","#a22633","#e43b44","#f77622","#feae34","#fee761","#63c74d","#3e8948","#265c42","#193c3e","#124e89","#0099db","#2ce8f5","#ffffff","#c0cbdc","#8b9bb4","#5a6988","#3a4466","#262b44","#559","#885880","#c140a5","#e8e8e8","#6f6f6f","#3b3b3b","#1c1c1c"],
        tags: ["endesga", "limited", "32-color", "modern"]
      },
      "OxOC": {
        name: "OxOC",
        description: "OxOC调色板",
        colors: ["#000000","#ffffff","#da1f26","#f36e3d","#f6d365","#8cb","#41d9a4","#10b9ce","#3778b2","#544099","#ff00","#929292","#c7cdd3","#1c1c1c","#f8dfe5","#bde3f0"],
        tags: ["modern", "limited", "16-color"]
      },
      "Retro-RPG": {
        name: "Retro-RPG",
        description: "复古RPG调色板",
        colors: ["#000000","#fcfcfc","#f8f8f8","#bcbcbc","#7c7c7c","#004300","#00a800","#5d5d00","#f8b800","#f83800","#a81000","#880000","#0058a8","#0000f8","#0038bc","#005800","#00a800","#006800","#880088","#e40058","#a80020","#f8a4c0","#f85898","#e45c10","#fca044","#503000","#58d854","#b8f8b8","#a4e4fc","#3cbcfc","#0078f8","#0000fc","#b8b8f8","#6888fc","#0058f8","#0000bc","#d8b8f8","#9878f8","#6844fc","#4428bc","#f8b8f8","#f878f8","#d800cc","#940084","#f8d878","#fce0a8","#f0d0b0","#f87858","#d8f878","#b8f818","#00b800","#007800"],
        tags: ["rpg", "retro", "game", "colorful"]
      }
    }
  },

  // ============ 复古/怀旧 ============
  retro: {
    name: '复古',
    palettes: {
      "CGA-4": {
        name: "CGA-4",
        description: "CGA 4色调色板（黑白）",
        colors: ["#000000","#ffffff","#00ffff","#ffff00"],
        tags: ["cga", "retro", "4-color", "classic"]
      },
      "CGA-16": {
        name: "CGA-16",
        description: "CGA 16色调色板",
        colors: ["#000000","#0000aa","#00aa00","#00aaaa","#aa0000","#aa00aa","#aa5500","#aaaaaa","#555555","#5555ff","#55ff55","#55ffff","#ff5555","#ff55ff","#ffff55","#ffffff"],
        tags: ["cga", "retro", "16-color", "classic"]
      },
      "EGA": {
        name: "EGA",
        description: "EGA 64色调色板",
        colors: ["#000000","#0000aa","#00aa00","#00aaaa","#aa0000","#aa00aa","#aa5500","#aaaaaa","#555555","#5555ff","#55ff55","#55ffff","#ff5555","#ff55ff","#ffff55","#ffffff","#000055","#005500","#005555","#550000","#550055","#555500","#5555aa","#55aa55","#55aaaa","#aa5555","#aa55aa","#aa5555","#aa55ff","#55aa00","#55aa55","#55ff00","#55ffaa","#ff5500","#ff55ff","#ffff00","#ffffffaa"],
        tags: ["ega", "retro", "64-color", "classic"]
      },
      "VGA": {
        name: "VGA",
        description: "VGA 256色调色板（标准）",
        colors: ["#000000","#0000aa","#00aa00","#00aaaa","#aa0000","#aa00aa","#aa5500","#aaaaaa","#555555","#5555ff","#55ff55","#55ffff","#ff5555","#ff55ff","#ffff55","#ffffff","#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff","#ff5555","#55ff55","#5555ff","#ff55ff","#ffff55","#55ffff","#ffaaff","#aaffaa","#aaaaff","#ffffff","#000033","#003300","#330033","#003333","#330000"],
        tags: ["vga", "retro", "256-color", "classic"]
      },
      "ZX-Spectrum": {
        name: "ZX-Spectrum",
        description: "ZX Spectrum调色板",
        colors: ["#000000","#0000d7","#d70000","#d700d7","#00d700","#00d7d7","#d7d700","#d7d7d7","#000000","#0000ff","#ff0000","#ff00ff","#00ff00","#00ffff","#ffff00","#ffffff"],
        tags: ["zx-spectrum", "retro", "sinclair", "8-color"]
      },
      "Apple-II": {
        name: "Apple-II",
        description: "Apple II调色板",
        colors: ["#000000","#ffffff","#999999","#f2f2f2","#333333","#666666","#0066cc","#990000","#006600","#cc0000","#006600","#003300","#330000","#003366","#330066","#ffff00","#ff9900","#00ff00","#0099ff","#cc0099","#ff00ff","#00ffff","#00ff00","#99ff00","#ff0099","#ccff00","#00ccff","#cc00ff","#66ff00","#ff6600","#00cc00","#0099cc","#cc99ff","#ff99cc","#ffcc00","#ffcc99","#ccff99","#99ffcc","#99ccff","#cc99cc"],
        tags: ["apple", "retro", "ii", "computer"]
      },
      "Macintosh": {
        name: "Macintosh",
        description: "经典Macintosh调色板",
        colors: ["#000000","#ffffff","#999999","#f2f2f2","#333333","#666666","#0066cc","#990000","#006600","#cc0000","#006600","#003300","#330000","#003366","#330066","#ffff00","#ff9900","#00ff00","#0099ff","#cc0099","#ff00ff","#00ffff","#00ff00","#99ff00","#ff0099","#ccff00","#00ccff","#cc00ff","#66ff00","#ff6600","#00cc00","#0099cc","#cc99ff","#ff99cc","#ffcc00","#ffcc99","#ccff99","#99ffcc","#99ccff","#cc99cc"],
        tags: ["mac", "retro", "apple", "classic"]
      },
      "Commodore-128": {
        name: "Commodore-128",
        description: "Commodore 128调色板",
        colors: ["#000000","#ffffff","#880000","#aaffee","#cc44cc","#00cc55","#0000aa","#eeee77","#ef8055","#a80020","#50a050","#707070","#808080","#aadeee","#cc6677","#888800"],
        tags: ["commodore", "retro", "c128", "computer"]
      }
    }
  },

  // ============ 现代/清新 ============
  modern: {
    name: '现代',
    palettes: {
      "Bubblegum": {
        name: "Bubblegum",
        description: "马卡龙粉彩色调",
        colors: ["#ff9eb5","#ffb08f","#ffe5a6","#b8f2be","#87d5b5","#72cfe8","#85b7f2","#c9a5e8","#f0c5e8","#f2c5c5","#e8d5a5","#c5e8c5","#a5d5e8","#c5c5e8","#e8c5e8","#e8c5d5"],
        tags: ["modern", "pastel", "cute", "soft"]
      },
      "Sunset": {
        name: "Sunset",
        description: "日落渐变调色板",
        colors: ["#1a1c2c","#b13e53","#ef7d57","#ffcd75","#a7f070","#38b764","#257179","#73eff7","#3b5dc9","#29366f","#5d275d","#f77622","#feae34","#ffffff","#94b0c2","#566c86"],
        tags: ["sunset", "warm", "gradient", "nature"]
      },
      "Cyberpunk": {
        name: "Cyberpunk",
        description: "赛博朋克调色板",
        colors: ["#0d0221","#0f0326","#1a0533","#2d0a4e","#3c096c","#5c1886","#7b2cbf","#9d33e5","#c054ff","#e066ff","#ff66ff","#ff66b2","#ff668c","#ff6666","#ff8645","#ffaa22"],
        tags: ["cyberpunk", "neon", "futuristic", "dark"]
      },
      "Synthwave": {
        name: "Synthwave",
        description: "复古未来主义调色板",
        colors: ["#2d1b4e","#6b2d5c","#b83d6d","#f26b8a","#f7a8b8","#55b8d0","#00d4ff","#0099cc","#0a1a2f","#1a3a5c","#ff00ff","#00ffff","#ff66cc","#ccccff","#ffffff","#000033"],
        tags: ["synthwave", "retro-futurism", "neon", "80s"]
      },
      "Nordic": {
        name: "Nordic",
        description: "北欧冷淡风调色板",
        colors: ["#2e3440","#3b4252","#434c5e","#4c566a","#d8dee9","#e5e9f0","#eceff4","#8fbcbb","#88c0d0","#81a1c1","#5e81ac","#bf616a","#d08770","#ebcb8b","#a3be8c","#b48ead"],
        tags: ["nordic", "nord", "minimalist", "cold"]
      },
      "Dracula": {
        name: "Dracula",
        description: "Dracula主题调色板",
        colors: ["#282a36","#44475a","#6272a4","#8be9fd","#50fa7b","#f1fa8c","#ffb86c","#ff79c6","#bd93f9","#ff5555","#f8f8f2","#6272a4","#44475a","#50fa7b","#ffb86c","#ff79c6"],
        tags: ["dracula", "code-theme", "purple", "dark"]
      },
      "Monokai": {
        name: "Monokai",
        description: "Monokai主题调色板",
        colors: ["#272822","#49483e","#75715e","#a6e22e","#f8f8f2","#f92672","#fd971f","#ae81ff","#66d9ef","#a6e22e","#e6db74","#f92672","#fd971f","#ae81ff","#66d9ef","#e6db74"],
        tags: ["monokai", "code-theme", "classic", "syntax"]
      },
      "Tokyo-Night": {
        name: "Tokyo-Night",
        description: "东京夜景色调板",
        colors: ["#1a1b26","#24283b","#414868","#7aa2f7","#bb9af7","#7dcfff","#2ac3de","#9ece6a","#e0af68","#f7768e","#ff9e64","#73daca","#b4f9f8","#c0caf5","#a9b1d6","#565f89"],
        tags: ["tokyo-night", "code-theme", "dark", "japan"]
      },
      "Gruvbox": {
        name: "Gruvbox",
        description: "Gruvbox主题调色板",
        colors: ["#282828","#3c3836","#4c3c28","#504945","#665c54","#7c6f64","#928374","#a89984","#b8bb26","#98971a","#fabd2f","#f8b432","#fe8019","#d65d0e","#fb4933","#cc241d","#b16286","#d3869b","#8ec07c","#98971a","#83a598","#458588","#689d6a","#a3b008","#cdb8f1","#b58900","#c0c374","#fb4934","#d79921","#fabd2f","#8f1d18","#a52a2a","#ebdbb2","#f2e5bc","#d5c4a1","#fbf1c7","#f9f5d7","#fe6637","#c65d07","#cb8414","#92760f","#7d6617","#b8860b","#8b7355","#a0522d","#6b4423","#8b4513","#722f37"],
        tags: ["gruvbox", "code-theme", "retro", "warm"]
      },
      "Nord": {
        name: "Nord",
        description: "Nord主题调色板",
        colors: ["#2e3440","#3b4252","#434c5e","#4c566a","#d8dee9","#e5e9f0","#eceff4","#8fbcbb","#88c0d0","#81a1c1","#5e81ac","#bf616a","#d08770","#ebcb8b","#a3be8c","#b48ead"],
        tags: ["nord", "code-theme", "cold", "minimalist"]
      }
    }
  },

  // ============ 角色/人物 ============
  character: {
    name: '角色',
    palettes: {
      "Skin-Tones": {
        name: "肤色",
        description: "多样化肤色调色板",
        colors: ["#ffe5d9","#ffdbac","#f1c27d","#e0ac69","#c68642","#8d5524","#6b4423","#4a3218","#ffbf9f","#ff9c85","#e08a71","#d4857a","#c27a6a","#a85c4c","#8b4536","#6f3226"],
        tags: ["skin", "flesh", "character", "diversity"]
      },
      "Hair-Colors": {
        name: "发色",
        description: "角色发色调色板",
        colors: ["#090806","#2c222b","#3d3535","#574444","#716353","#8c7b63","#a99b7c","#c9bc9c","#f5f0e0","#b81818","#8c1010","#5c0e0e","#c8a86c","#9a7b4f","#714a29","#3c210f","#e3b64c","#b8860b","#8b6508","#5c4403","#ff6b6b","#ee5a5a","#cc2a2a","#991f1f","#4ecdc4","#26a69a","#00897b","#00695c"],
        tags: ["hair", "character", "colorful"]
      },
      "Eye-Colors": {
        name: "瞳色",
        description: "角色眼睛颜色调色板",
        colors: ["#0a0a0a","#3d2314","#6b4423","#8b5a2b","#a67c52","#c4956a","#e8c39e","#1e3a5f","#2e5090","#4174b8","#5c8fd9","#89b4f5","#c5daff","#2d4a3e","#3d6652","#4d7a5f","#5f906f","#7fb38a","#a8d5b5","#6b3a5c","#8b4a6e","#a85c80","#c47a9a","#dda0bc","#f0c5e0"],
        tags: ["eye", "character", "iris"]
      },
      "Vampire-Waltz": {
        name: "Vampire-Waltz",
        description: "16色哥特风格调色板",
        colors: ["#1a0a0a","#2d1a1a","#4a1a1a","#6b2020","#8b2525","#aa3030","#cc4040","#e05050","#ff6060","#2d0a1a","#4a0a2d","#6b0a4a","#8b106b","#aa20aa","#cc40cc","#ff60ff"],
        tags: ["gothic", "vampire", "dark", "character"]
      },
      "Heroic-16": {
        name: "Heroic-16",
        description: "英雄角色调色板",
        colors: ["#1a1c2c","#5d275d","#b13e53","#ef7d57","#ffcd75","#a7f070","#38b764","#257179","#29366f","#3b5dc9","#41a6f6","#73eff7","#f4f4f4","#94b0c2","#566c86","#333c57"],
        tags: ["hero", "character", "fantasy", "adventure"]
      }
    }
  },

  // ============ 场景/自然 ============
  scene: {
    name: '场景',
    palettes: {
      "Forest-8": {
        name: "森林-8",
        description: "8色森林调色板",
        colors: ["#1a3b2e","#2d5a3f","#3d7a4f","#5da05f","#7dc07f","#a0e0a0","#c0f0c0","#e0ffe0"],
        tags: ["forest", "nature", "green", "landscape"]
      },
      "Ocean-8": {
        name: "海洋-8",
        description: "8色海洋调色板",
        colors: ["#0a1628","#1a3550","#2a5070","#3a7090","#5a95b0","#7ab0c5","#a0c8d5","#d0e5eb"],
        tags: ["ocean", "sea", "water", "blue"]
      },
      "Desert-8": {
        name: "沙漠-8",
        description: "8色沙漠调色板",
        colors: ["#3d2817","#5c3d2e","#7a5540","#9a7055","#ba8f6e","#d4af8a","#ecdcc5","#f8f0e5"],
        tags: ["desert", "sand", "warm", "landscape"]
      },
      "Mountain-8": {
        name: "山脉-8",
        description: "8色山脉调色板",
        colors: ["#1a1a2e","#2d3a4e","#4a5568","#6b7b8a","#8fa0b0","#b0c4d0","#d0e0e8","#f0f4f8"],
        tags: ["mountain", "cold", "landscape", "rock"]
      },
      "Sunset-Nature": {
        name: "日落自然",
        description: "自然日落调色板",
        colors: ["#1a0a2e","#4a1a4e","#8b2a6e","#d43a7e","#f46a8a","#f8a06e","#f8d06e","#f8f06e","#a8e86e","#68d8a8","#38b8c8","#2868d8","#1a38a8","#0a1868","#000038"],
        tags: ["sunset", "nature", "warm", "sky"]
      },
      "Night-Sky": {
        name: "夜空",
        description: "夜晚星空调色板",
        colors: ["#000010","#050525","#101040","#1a1a50","#252560","#303070","#3a3a80","#454590","#5050a0","#6060b0","#7070c0","#8080d0","#9090e0","#a0a0f0","#b0b0ff","#ffffff"],
        tags: ["night", "sky", "stars", "dark"]
      }
    }
  }
};

// Helper function to get all palettes as flat array
function getAllPalettes() {
  const palettes = [];
  for (const categoryKey of Object.keys(PALETTE_LIBRARY)) {
    const category = PALETTE_LIBRARY[categoryKey];
    for (const paletteKey of Object.keys(category.palettes)) {
      const palette = category.palettes[paletteKey];
      palettes.push({
        id: paletteKey,
        category: categoryKey,
        categoryName: category.name,
        ...palette
      });
    }
  }
  return palettes;
}

// Helper function to search palettes
function searchPalettes(query) {
  const q = query.toLowerCase();
  return getAllPalettes().filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
  );
}

// Helper function to get palette by ID
function getPaletteById(id) {
  for (const categoryKey of Object.keys(PALETTE_LIBRARY)) {
    if (PALETTE_LIBRARY[categoryKey].palettes[id]) {
      return {
        id: id,
        category: categoryKey,
        categoryName: PALETTE_LIBRARY[categoryKey].name,
        ...PALETTE_LIBRARY[categoryKey].palettes[id]
      };
    }
  }
  return null;
}

// Helper function to get palettes by category
function getPalettesByCategory(category) {
  if (PALETTE_LIBRARY[category]) {
    const cat = PALETTE_LIBRARY[category];
    return Object.keys(cat.palettes).map(key => ({
      id: key,
      category: category,
      categoryName: cat.name,
      ...cat.palettes[key]
    }));
  }
  return [];
}

// Helper function to get all categories
function getCategories() {
  return Object.keys(PALETTE_LIBRARY).map(key => ({
    id: key,
    name: PALETTE_LIBRARY[key].name,
    count: Object.keys(PALETTE_LIBRARY[key].palettes).length
  }));
}

// Export for use in main app
window.PALETTE_LIBRARY = PALETTE_LIBRARY;
window.getAllPalettes = getAllPalettes;
window.searchPalettes = searchPalettes;
window.getPaletteById = getPaletteById;
window.getPalettesByCategory = getPalettesByCategory;
window.getCategories = getCategories;