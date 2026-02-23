const fs = require('fs');
const path = 'orchestration/index.js';
let content = fs.readFileSync(path, 'utf8');

const target = "app.post('/mcp/execute', validateRequest(mcpExecuteSchema), async (req, res) => {";
if (content.indexOf(target) !== -1) {
    const getHandler = `
// GET handler to provide helpful information and avoid 404s
app.get('/mcp/execute', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'Method Not Allowed. This endpoint requires POST.',
    usage: {
      method: 'POST',
      url: '/mcp/execute',
      body: {
        tool: 'tool_name',
        parameters: { arg1: 'val1' }
      }
    },
    discover_tools: 'GET /mcp/tools'
  });
});

`;
    content = content.replace(target, getHandler + target);
    fs.writeFileSync(path, content);
    console.log('Successfully added GET handler to /mcp/execute');
} else {
    console.log('Target string not found in orchestration/index.js');
}
