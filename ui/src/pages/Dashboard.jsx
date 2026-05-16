import { useState, useEffect } from 'react';
import { useReviewStore } from '../store/review.store';
import { CheckCircle2, XCircle, Clock, ChevronRight, Activity, GitCommit, AlertTriangle, ShieldCheck, X } from 'lucide-react';

function Dashboard() {
  const { reviews, isLoading, fetchReviews } = useReviewStore();
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const stats = [
    { label: 'Total Reviews', value: reviews.length, icon: GitCommit, color: 'text-ink' },
    { label: 'Passed', value: reviews.filter(r => r.status === 'accepted').length, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Rejected', value: reviews.filter(r => r.status === 'rejected').length, icon: XCircle, color: 'text-accent' },
    { label: 'Security Alerts', value: reviews.filter(r => r.groups.security?.issues?.length > 0).length, icon: ShieldCheck, color: 'text-amber-500' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="type-title-md tracking-tight">System Overview</h2>
          <p className="type-body text-muted">Bảng điều khiển tập trung cho tất cả các dự án của bạn.</p>
        </div>
        <button 
          onClick={() => fetchReviews()}
          className="px-5 py-2.5 bg-ink text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Refresh Data
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
              [1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-surfaceSoft rounded-2xl animate-pulse border border-line" />
              ))
            ) : reviews.length === 0 ? (
              <div className="card-premium p-12 text-center">
                <p className="text-muted font-medium">Chưa có dữ liệu review nào. Hãy thực hiện commit đầu tiên!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div 
                  key={review.id} 
                  onClick={() => setSelectedReview(review)}
                  className="card-premium flex items-center justify-between group cursor-pointer hover:border-electric/30"
                >
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
                 Hệ thống đang bảo vệ các repositories của bạn. Mọi commit không đạt chuẩn sẽ bị chặn ngay tại cửa.
               </p>
             </div>
             <ShieldCheck size={120} className="absolute -bottom-8 -right-8 opacity-10" />
          </div>
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-2xl rounded-card-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-line flex justify-between items-center bg-surfaceSoft/50">
              <div>
                <h3 className="type-title-sm">Review Details</h3>
                <p className="text-xs text-muted font-mono mt-0.5">{selectedReview.repo} @ {selectedReview.commitHash}</p>
              </div>
              <button 
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-softRose rounded-full transition-colors text-muted hover:text-accent"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
              {/* Summary */}
              <div className="flex items-center gap-6 p-4 bg-surfaceSoft rounded-2xl border border-line">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  selectedReview.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {selectedReview.status === 'accepted' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                </div>
                <div>
                  <p className="type-label uppercase tracking-widest opacity-50">Status</p>
                  <p className={`type-title-sm ${selectedReview.status === 'accepted' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Commit {selectedReview.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </p>
                </div>
              </div>

              {/* Group Results */}
              <div className="space-y-4">
                <h4 className="type-label text-muted uppercase tracking-wider">Reports by Groups</h4>
                {Object.keys(selectedReview.groups).map(groupName => {
                  const group = selectedReview.groups[groupName];
                  return (
                    <div key={groupName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="type-label capitalize">{groupName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          group.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {group.valid ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      
                      {!group.valid && (
                        <div className="space-y-2">
                          {group.issues.map((issue, idx) => (
                            <div key={idx} className="p-3 bg-softRose/30 border border-rose-100 rounded-xl text-sm text-rose-800">
                              <p className="font-bold flex items-center gap-2">
                                <AlertTriangle size={14} />
                                {issue.rule}
                              </p>
                              <p className="mt-1 opacity-80 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                                {issue.error}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 border-t border-line bg-surfaceSoft/30 flex justify-end">
              <button 
                onClick={() => setSelectedReview(null)}
                className="px-6 py-2.5 bg-ink text-white rounded-xl font-bold text-sm shadow-lg shadow-ink/20"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
