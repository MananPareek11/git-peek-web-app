/**
 * Generate and download a formatted PDF resume/summary of a GitHub profile.
 * Dynamically imports jsPDF and html2canvas on demand for maximum performance.
 * @param {Object} userData - User profile object from GitHub / Backend
 * @param {Array} reposData - List of user repositories
 */
export const generateGithubPdf = async (userData, reposData = []) => {
  if (!userData) return;

  // Dynamically load PDF libraries on demand (code-splitting heavy dependencies)
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // 1. Calculate Language Breakdown
  const languageStats = {};
  let totalLangRepos = 0;

  reposData.forEach((repo) => {
    if (repo.language) {
      languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      totalLangRepos++;
    }
  });

  const sortedLanguages = Object.entries(languageStats)
    .map(([lang, count]) => ({
      name: lang,
      count,
      percentage: ((count / Math.max(totalLangRepos, 1)) * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);

  // 2. Calculate Total Stars & Forks
  const totalStars = reposData.reduce((acc, r) => acc + (r.stargazers_count || r.starsCount || 0), 0);
  const totalForks = reposData.reduce((acc, r) => acc + (r.forks_count || r.forksCount || 0), 0);

  // 3. Sort top 6 repositories
  const topRepos = [...reposData]
    .sort((a, b) => (b.stargazers_count || b.starsCount || 0) - (a.stargazers_count || a.starsCount || 0))
    .slice(0, 6);

  // Create temporary offscreen container for clean rendering
  const pdfElement = document.createElement('div');
  pdfElement.id = 'temp-pdf-export';
  pdfElement.style.position = 'absolute';
  pdfElement.style.left = '-9999px';
  pdfElement.style.top = '-9999px';
  pdfElement.style.width = '800px';
  pdfElement.style.background = '#0f172a';
  pdfElement.style.color = '#f8fafc';
  pdfElement.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  pdfElement.style.padding = '35px 40px';
  pdfElement.style.boxSizing = 'border-box';

  pdfElement.innerHTML = `
    <div style="border-bottom: 2px solid #334155; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 20px;">
        <img src="${userData.avatar_url || userData.avatar}" style="width: 85px; height: 85px; border-radius: 50%; border: 3px solid #22c55e;" />
        <div>
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff;">${userData.name || userData.login || 'GitHub Developer'}</h1>
          <div style="font-size: 16px; color: #22c55e; font-weight: 600; margin-top: 2px;">@${userData.login || userData.username}</div>
          <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">${userData.bio || 'GitHub Developer Profile Report'}</div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; display: inline-block;">
          GitPeek Summary Report
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Generated: ${new Date().toLocaleDateString()}</div>
      </div>
    </div>

    <!-- Quick Info & Stats Row -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
      <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; padding: 12px; border-radius: 10px; text-align: center;">
        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Public Repos</div>
        <div style="font-size: 20px; font-weight: 800; color: #38bdf8; margin-top: 4px;">${userData.public_repos || userData.publicRepos || reposData.length}</div>
      </div>
      <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; padding: 12px; border-radius: 10px; text-align: center;">
        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Total Stars</div>
        <div style="font-size: 20px; font-weight: 800; color: #eab308; margin-top: 4px;">${totalStars}</div>
      </div>
      <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; padding: 12px; border-radius: 10px; text-align: center;">
        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Total Forks</div>
        <div style="font-size: 20px; font-weight: 800; color: #a855f7; margin-top: 4px;">${totalForks}</div>
      </div>
      <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; padding: 12px; border-radius: 10px; text-align: center;">
        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Followers</div>
        <div style="font-size: 20px; font-weight: 800; color: #4ade80; margin-top: 4px;">${userData.followers || 0}</div>
      </div>
    </div>

    <!-- Languages Breakdown Section -->
    <div style="margin-bottom: 25px; background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; padding: 18px; border-radius: 12px;">
      <h3 style="margin: 0 0 12px 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8;">Top Programming Languages</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${sortedLanguages.slice(0, 5).map(lang => `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
              <span style="font-weight: 600; color: #e2e8f0;">${lang.name}</span>
              <span style="color: #94a3b8;">${lang.count} repos (${lang.percentage}%)</span>
            </div>
            <div style="width: 100%; height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
              <div style="width: ${lang.percentage}%; height: 100%; background: linear-gradient(90deg, #22c55e, #3b82f6); border-radius: 3px;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Top Repositories Grid -->
    <div style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 14px 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8;">Featured Projects & Repositories</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        ${topRepos.map(repo => `
          <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; padding: 14px; border-radius: 10px;">
            <div style="font-weight: 700; font-size: 14px; color: #ffffff; margin-bottom: 4px;">${repo.name}</div>
            <div style="font-size: 11px; color: #94a3b8; height: 28px; overflow: hidden; text-overflow: ellipsis; margin-bottom: 8px;">
              ${repo.description || 'No description provided.'}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px;">
              <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 8px; border-radius: 6px; font-weight: 600;">
                ${repo.language || 'Code'}
              </span>
              <span>⭐ ${repo.stargazers_count || repo.starsCount || 0} &nbsp; 🍴 ${repo.forks_count || repo.forksCount || 0}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #334155; padding-top: 12px; text-align: center; font-size: 11px; color: #64748b;">
      Report compiled automatically by <strong>GitPeek</strong> — Developer GitHub Intelligence & Analytics
    </div>
  `;

  document.body.appendChild(pdfElement);

  try {
    const canvas = await html2canvas(pdfElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0f172a',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${userData.login || userData.username || 'github'}_profile_summary.pdf`);
  } catch (error) {
    console.error('PDF Generation Failed:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    document.body.removeChild(pdfElement);
  }
};
