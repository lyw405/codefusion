const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToIco() {
  try {
    const svgPath = path.join(__dirname, '../app/favicon.svg');
    const icoPath = path.join(__dirname, '../app/favicon.ico');
    
    // 读取 SVG 文件
    const svgBuffer = fs.readFileSync(svgPath);
    
    // 转换为 PNG (ICO 实际上是 PNG 格式)
    const pngBuffer = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    // 写入 ICO 文件
    fs.writeFileSync(icoPath, pngBuffer);
    
    console.log('✅ favicon.ico 生成成功！');
  } catch (error) {
    console.error('❌ 转换失败:', error);
  }
}

convertSvgToIco();
