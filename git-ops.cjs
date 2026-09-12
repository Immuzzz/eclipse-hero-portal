const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');

async function stageAndCommit() {
  const dir = process.cwd();
  console.log('Inspecting file status matrix...');
  const status = await git.statusMatrix({ fs, dir });
  let addedCount = 0;
  for (const [filepath, headStatus, workdirStatus, stageStatus] of status) {
    if (workdirStatus !== 0) {
      await git.add({ fs, dir, filepath });
      addedCount++;
    }
  }
  console.log('Staged ' + addedCount + ' files.');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Developer',
      email: 'shieldxshield7@gmail.com'
    },
    message: 'Initial commit: ECLIPSE Superhero Showcase - Dual Mode Engine, Conversational Chatbot, and Automated Dispatch'
  });
  console.log('Committed successfully!');
  console.log('Commit SHA: ' + sha);
}

stageAndCommit().catch(err => console.error('Commit failed:', err));
