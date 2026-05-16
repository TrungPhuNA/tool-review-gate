import { useReviewStore } from '../store/review.store';
import { History, CheckCircle2, XCircle, Search } from 'lucide-react';

function ReviewHistory() {
  const { reviews } = useReviewStore();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="type-title-md tracking-tight">Review History</h2>
          <p className="type-body text-muted">Toàn bộ lịch sử quét mã nguồn từ trước tới nay.</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search commits..." 
            className="pl-11 pr-4 py-2.5 bg-surfaceSoft border border-line rounded-xl text-sm focus:outline-none focus:border-electric w-64"
          />
        </div>
      </header>

      <div className="card-premium p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surfaceSoft/50 border-b border-line text-[10px] uppercase font-black text-muted tracking-widest">
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Repository</th>
              <th className="px-6 py-4">Commit / Message</th>
              <th className="px-6 py-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-surfaceSoft/30 transition-colors group">
                <td className="px-6 py-4">
                  {review.status === 'accepted' ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : (
                    <XCircle size={20} className="text-accent" />
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="type-label text-xs">{review.repo}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-electric mb-1">{review.commitHash}</span>
                    <span className="text-sm font-medium text-ink truncate max-w-md">{review.message}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-xs text-muted">
                  {new Date(review.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReviewHistory;
