import { useReviewStore } from '../store/review.store';
import { FolderCode, ShieldCheck, ExternalLink } from 'lucide-react';

function Projects() {
  const { reviews } = useReviewStore();
  
  // Lấy danh sách các repo duy nhất từ dữ liệu reviews
  const repos = [...new Set(reviews.map(r => r.repo))].map(repoName => ({
    name: repoName,
    lastActivity: reviews.find(r => r.repo === repoName)?.timestamp,
    status: reviews.find(r => r.repo === repoName)?.status,
    projectType: reviews.find(r => r.repo === repoName)?.projectType
  }));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="type-title-md tracking-tight">Active Projects</h2>
        <p className="type-body text-muted">Danh sách các kho mã nguồn đang được hệ thống bảo vệ.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.length === 0 ? (
          <div className="col-span-full card-premium p-12 text-center">
            <FolderCode size={48} className="mx-auto text-line mb-4" />
            <p className="text-muted">Chưa có dự án nào được đăng ký.</p>
          </div>
        ) : (
          repos.map((repo, i) => (
            <div key={i} className="card-premium group hover:border-electric/30">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-softBlue text-electric rounded-2xl flex items-center justify-center">
                  <FolderCode size={24} />
                </div>
                <span className={`type-caption px-3 py-1 rounded-full font-bold uppercase ${
                  repo.status === 'accepted' ? 'bg-softMint text-emerald-600' : 'bg-softRose text-accent'
                }`}>
                  {repo.status === 'accepted' ? 'Stable' : 'Warning'}
                </span>
              </div>
              
              <h3 className="type-title-sm mb-1">{repo.name}</h3>
              <p className="type-caption text-muted mb-6 uppercase font-bold tracking-wider">{repo.projectType}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-line">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>ReviewGate Active</span>
                </div>
                <button className="text-electric hover:underline text-sm font-bold flex items-center gap-1">
                  View Docs <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Projects;
