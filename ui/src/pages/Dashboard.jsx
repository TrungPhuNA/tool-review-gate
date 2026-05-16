import { useEffect } from 'react';
import { useReviewStore } from '../store/review.store';
import { CheckCircle2, XCircle, Clock, ChevronRight, Activity, GitCommit, AlertTriangle } from 'lucide-react';

function Dashboard() {
  const { reviews, isLoading, fetchReviews } = useReviewStore();

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const stats = [
    { label: 'Total Reviews', value: '1,284', icon: GitCommit, color: 'text-ink' },
    { label: 'Rejected', value: '42', icon: XCircle, color: 'text-accent' },
    { label: 'Avg Time', value: '1.2s', icon: Clock, color: 'text-electric' },
    { label: 'Security Alerts', value: '0', icon: ShieldCheck, color: 'text-emerald-500' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="type-title-md tracking-tight">System Overview</h2>
          <p className="type-body text-muted">Chào mừng trở lại, đây là trạng thái review trong 24h qua.</p>
        </div>
        <button className="px-5 py-2.5 bg-ink text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
          View All Logs
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card-premium flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-surfaceSoft ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="type-caption font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="type-title-sm leading-none mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="type-title-sm">Recent Reviews</h3>
            <Activity size={18} className="text-muted" />
          </div>

          <div className="space-y-3">
            {isLoading ? (
              // Simple Skeleton simulation
              [1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-surfaceSoft rounded-2xl animate-pulse border border-line" />
              ))
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="card-premium flex items-center justify-between group cursor-pointer hover:border-electric/30">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      review.status === 'accepted' ? 'bg-softMint text-emerald-600' : 'bg-softRose text-accent'
                    }`}>
                      {review.status === 'accepted' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="type-label">{review.repo}</span>
                        <span className="type-caption font-mono bg-surfaceSoft px-2 py-0.5 rounded border border-line">
                          {review.commitHash}
                        </span>
                      </div>
                      <p className="text-sm text-ink/80 font-medium truncate max-w-xs">{review.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="type-caption font-bold capitalize">{review.projectType}</p>
                      <p className="text-[10px] text-muted">{new Date(review.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <ChevronRight size={18} className="text-line group-hover:text-electric transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <h3 className="type-title-sm">Status Info</h3>
          <div className="card-premium bg-electric text-white border-none shadow-xl shadow-electric/20 overflow-hidden relative">
             <div className="relative z-10">
               <p className="type-label opacity-80">Gate Protection</p>
               <p className="type-title-sm mt-1">Active & Shielding</p>
               <p className="text-xs mt-4 opacity-70 leading-relaxed">
                 Hệ thống đang bảo vệ 12 repositories. Đã tự động chặn 5 commits vi phạm chính sách bảo mật trong hôm nay.
               </p>
             </div>
             <ShieldCheck size={120} className="absolute -bottom-8 -right-8 opacity-10" />
          </div>

          <div className="card-premium">
            <h4 className="type-label flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-500" />
              Common Violations
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Wrong Commit Format</span>
                <span className="font-bold">65%</span>
              </div>
              <div className="w-full h-1.5 bg-surfaceSoft rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[65%]" />
              </div>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-muted">ESLint Errors</span>
                <span className="font-bold">20%</span>
              </div>
              <div className="w-full h-1.5 bg-surfaceSoft rounded-full overflow-hidden">
                <div className="h-full bg-electric w-[20%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
