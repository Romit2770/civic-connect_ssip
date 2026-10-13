const { execSync } = require('child_process');

try {
  const output = execSync('netstat -ano | findstr :5001 | findstr LISTENING', { encoding: 'utf8' });
  const lines = output.trim().split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0') {
      console.log(`Killing process ${pid} on port 5001`);
      try {
        execSync(`taskkill /F /PID ${pid}`);
      } catch (e) {}
    }
  }
} catch (e) {
  console.log('Port 5001 is completely free! No process is listening.');
}

try {
  const output = execSync('netstat -ano | findstr :5173 | findstr LISTENING', { encoding: 'utf8' });
  const lines = output.trim().split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0') {
      console.log(`Killing process ${pid} on port 5173`);
      try {
        execSync(`taskkill /F /PID ${pid}`);
      } catch (e) {}
    }
  }
} catch (e) {
  console.log('Port 5173 is completely free! No process is listening.');
}
