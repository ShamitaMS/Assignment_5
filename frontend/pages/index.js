import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/commits', { repoUrl });
      setSummary(response.data.summary);
    } catch (error) {
      setSummary('Error fetching commit summary');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>GitHub Commit Summarizer</h1>
      <form onSubmit={handleSubmit}>
        <label>
          GitHub Repo URL:
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Summary'}
        </button>
      </form>
      {summary && (
        <div>
          <h2>Commit Summary:</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
