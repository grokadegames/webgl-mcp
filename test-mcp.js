// Test script for webgl-mcp
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to test
const testPath = path.join(__dirname, 'temp', 'test-webgl');

// Create log file for debugging
const logFile = fs.createWriteStream('mcp-test.log');
logFile.write(`Testing MCP with path: ${testPath}\n`);

// Log if path exists
logFile.write(`Path exists: ${fs.existsSync(testPath)}\n`);
logFile.write(`Contents: ${fs.readdirSync(testPath).join(', ')}\n`);

// Start the MCP server process
const mcp = spawn('node', ['webgl-mcp.mjs'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle server output
mcp.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Server output:');
  console.log(output);
  logFile.write(`STDOUT: ${output}\n`);
  
  try {
    // Try to parse JSON output
    const json = JSON.parse(output);
    logFile.write(`Parsed JSON: ${JSON.stringify(json)}\n`);
    if (json.type === 'response' && json.content) {
      console.log('Analysis result:');
      console.log(json.content[0].text);
      logFile.write(`Analysis result:\n${json.content[0].text}\n`);
      console.log('\nTest PASSED: Server responded with analysis');
    }
  } catch (e) {
    // Not JSON or other issue
    console.log('Could not parse output as JSON:', e.message);
    logFile.write(`Parse error: ${e.message}\n`);
  }
});

mcp.stderr.on('data', (data) => {
  const errOutput = data.toString();
  console.error(`Server log: ${errOutput}`);
  logFile.write(`STDERR: ${errOutput}\n`);
});

// Wait for server to start
setTimeout(() => {
  console.log('Sending analysis request...');
  logFile.write('Sending analysis request...\n');
  
  // Send a test message to analyze the WebGL path
  const message = {
    type: 'message',
    id: 'test',
    message: `analyze-webgl(path: "${testPath}")`
  };
  
  const messageJson = JSON.stringify(message);
  logFile.write(`Sending: ${messageJson}\n`);
  mcp.stdin.write(messageJson + '\n');
  
  // Wait longer for analysis to complete
  setTimeout(() => {
    console.log('Test completed, killing server');
    logFile.write('Test completed, killing server\n');
    mcp.kill();
    logFile.end();
  }, 5000); // Give it 5 seconds to process
}, 1000);

// Handle process exit
mcp.on('close', (code) => {
  console.log(`MCP server exited with code ${code}`);
  fs.appendFileSync('mcp-test.log', `MCP server exited with code ${code}\n`);
}); 