// Test script for analyzing templates
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to test
const testPath = path.join(__dirname, 'temp', 'test-webgl', 'index.html');

// Simple implementation of the analyzeTemplate function
async function analyzeTemplate(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const features = [];
    const recommendations = [];
    let templateName = 'Unknown Template';
    
    // Check for Better Minimal WebGL Template
    if (content.includes('BetterMinimal') || 
        (content.includes('scaleToFit') && content.includes('data-pixel-art'))) {
      
      templateName = 'Better Minimal WebGL Template';
      
      // Detect features
      if (content.includes('scaleToFit')) features.push('Canvas Scaling');
      if (content.includes('data-pixel-art="true"')) features.push('Pixel Art Optimization');
      if (content.includes('progressHandler')) features.push('Loading Progress Bar');
      if (content.includes('iPhone|iPad|iPod|Android')) features.push('Mobile Detection');
      
      // Check for potential improvements
      if (!content.includes('progressHandler')) {
        recommendations.push('Add loading progress indicator for better user experience');
      }
      
      if (!content.includes('data-pixel-art')) {
        recommendations.push('Consider adding pixel art optimization for pixel art games');
      }
      
      if (!content.includes('window.focus()')) {
        recommendations.push('Add window.focus() after resize to ensure keyboard input works correctly');
      }
    } 
    // Unity Default Template
    else if (content.includes('UnityLoader') || content.includes('unityInstance')) {
      templateName = 'Unity Default Template';
      
      recommendations.push('Consider using the Better Minimal WebGL Template for improved performance and user experience');
      recommendations.push('Better Minimal WebGL Template provides automatic canvas scaling for different screen sizes');
      recommendations.push('Better Minimal WebGL Template includes mobile optimizations and loading progress visualization');
    } 
    // Unknown Template
    else {
      recommendations.push('Using an unknown template. Consider adopting Better Minimal WebGL Template for optimal WebGL performance');
    }
    
    return { templateName, features, recommendations };
  } catch (error) {
    console.error('Error analyzing template:', error);
    return {
      templateName: 'Error',
      features: [],
      recommendations: [`Error analyzing template: ${error.message}`]
    };
  }
}

// Run the test
async function runTest() {
  console.log(`Testing template analysis for: ${testPath}`);
  console.log(`File exists: ${fs.existsSync(testPath)}`);
  
  try {
    const result = await analyzeTemplate(testPath);
    console.log('Analysis result:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest(); 