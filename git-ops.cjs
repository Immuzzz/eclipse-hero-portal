const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const dir = process.cwd();
const command = process.argv[2] || 'status';
const arg1 = process.argv[3];
const arg2 = process.argv[4];

async function main() {
  if (command === 'log') {
    const commits = await git.log({ fs, dir, depth: 5 });
    console.log('Recent Commits:');
    commits.forEach(c => {
      console.log('- [' + c.oid.substring(0, 7) + '] ' + c.commit.message.split('\n')[0] + ' (' + c.commit.author.name + ')');
    });
  } else if (command === 'set-remote') {
    if (!arg1) {
      console.error('Usage: node git-ops.cjs set-remote <git-url>');
      process.exit(1);
    }
    try {
      await git.deleteRemote({ fs, dir, remote: 'origin' });
    } catch(e) {}
    await git.addRemote({ fs, dir, remote: 'origin', url: arg1 });
    console.log('Remote origin set to: ' + arg1);
  } else if (command === 'push') {
    const remoteUrl = arg1 || (await git.listRemotes({ fs, dir })).find(r => r.remote === 'origin')?.[1];
    const token = arg2 || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!remoteUrl) {
      console.error('No remote URL provided. Usage: node git-ops.cjs push <repo-url> [github-token]');
      process.exit(1);
    }
    console.log('Pushing main to: ' + remoteUrl);
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      url: remoteUrl,
      ref: 'main',
      onAuth: () => ({ username: token || 'x-access-token', password: '' })
    });
    console.log('Push succeeded!', pushResult);
  } else {
    const remotes = await git.listRemotes({ fs, dir });
    const commits = await git.log({ fs, dir, depth: 1 });
    console.log('Git Repository Status:');
    console.log('- Current Branch: main');
    console.log('- Latest Commit:  [' + commits[0].oid.substring(0, 7) + '] ' + commits[0].commit.message.split('\n')[0]);
    console.log('- Remotes:        ' + (remotes.length > 0 ? JSON.stringify(remotes) : 'None configured'));
  }
}

main().catch(err => console.error('Error:', err.message || err));
