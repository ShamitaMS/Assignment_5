require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// HTML form template
app.get('/', (req, res) => {
    res.render('index', { summary: null });
});

app.post('/', async (req, res) => {
    const repoUrl = req.body.repo_url;
    const { owner, repo } = parseRepoUrl(repoUrl);
    const commits = await fetchCommits(owner, repo);
    const summary = await summarizeCommits(commits);
    res.render('index', { summary });
});

// Parse GitHub repo URL
function parseRepoUrl(url) {
    const parts = url.replace(/\/$/, '').split('/');
    return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
}

// Fetch commits from GitHub
async function fetchCommits(owner, repo) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;
    const headers = {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
    };

    try {
        const response = await axios.get(apiUrl, { headers });
        console.log(`Fetching commits from: ${apiUrl}`);
        if (response.status === 200) {
            console.log(`Successfully fetched ${response.data.length} commits.`);
            return response.data.slice(0, 5).map(commit => commit.commit.message);
        }
        return [];
    } catch (error) {
        console.error(`Error fetching commits: ${error.response?.status || error.message}`);
        return [];
    }
}

// Summarize commits by calling the Python script
async function summarizeCommits(commits) {
    if (!commits.length) {
        return "No commits found.";
    }

    // Spawn the Python process
    const pythonProcess = spawn('python', ['summarize_commits.py', commits.join('|')]);

    return new Promise((resolve, reject) => {
        let output = '';

        // Capture stdout and stderr
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error: ${data.toString()}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output.trim());
            } else {
                reject(`Python process exited with code ${code}`);
            }
        });
    });
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
