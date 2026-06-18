const { execSync } = require('child_process');
execSync('git checkout -- c:/chaai/components/chat/ChatWindow.js', { cwd: 'c:/chaai' });
console.log('Restored ChatWindow.js');
