const simpleGit = require('simple-git');
const { Octokit } = require('@octokit/rest');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function uploadToGitHub() {
  try {
    console.log('🚀 Computer Syana - GitHub Upload\n');

    // Get GitHub token
    const token = await question('GitHub Personal Access Token: ');
    if (!token) {
      console.log('❌ Token پێویستە!');
      process.exit(1);
    }

    // Get repo details
    const repoName = await question('Repository Name (default: computer-syana): ') || 'computer-syana';
    const repoDescription = await question('Description (optional): ') || 'Computer Inventory Management System with Firebase';
    const isPrivate = (await question('Private repo? (y/n, default: n): ')).toLowerCase() === 'y';

    console.log('\n📦 Creating GitHub repository...');

    // Create GitHub repo using Octokit
    const octokit = new Octokit({ auth: token });
    
    let repo;
    try {
      const response = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: repoDescription,
        private: isPrivate,
        auto_init: false,
      });
      repo = response.data;
      console.log(`✅ Repository created: ${repo.html_url}`);
    } catch (error) {
      if (error.status === 422) {
        console.log('⚠️  Repository already exists, using existing one...');
        const { data } = await octokit.repos.get({
          owner: (await octokit.users.getAuthenticated()).data.login,
          repo: repoName,
        });
        repo = data;
      } else {
        throw error;
      }
    }

    console.log('\n📝 Initializing git...');
    const git = simpleGit();
    
    // Check if git is initialized
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
      console.log('✅ Git initialized');
    }

    // Add all files
    console.log('📂 Adding files...');
    await git.add('./*');
    console.log('✅ Files added');

    // Commit
    console.log('💾 Creating commit...');
    await git.commit('Initial commit - Computer Syana Inventory System\n\n- Firebase Authentication & Firestore\n- Realtime Database Logging\n- Asset Management\n- Transfer System with Receipt Printing\n- Location Management\n- Maintenance Tracking');
    console.log('✅ Commit created');

    // Add remote
    console.log('🔗 Adding remote...');
    const remotes = await git.getRemotes();
    if (!remotes.find(r => r.name === 'origin')) {
      await git.addRemote('origin', repo.clone_url.replace('https://', `https://${token}@`));
      console.log('✅ Remote added');
    } else {
      console.log('⚠️  Remote already exists');
    }

    // Push
    console.log('⬆️  Pushing to GitHub...');
    await git.push('origin', 'master', ['--set-upstream']);
    console.log('✅ Pushed to GitHub!');

    console.log(`\n🎉 Success! Repository URL: ${repo.html_url}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Details:', error.response.data);
    }
  } finally {
    rl.close();
  }
}

uploadToGitHub();
