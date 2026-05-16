import { create } from 'zustand';

/**
 * ReviewStore: Quản lý trạng thái các bản review và lịch sử commit
 */
export const useReviewStore = create((set) => ({
  reviews: [],
  activeReview: null,
  isLoading: false,

  // Giả lập load dữ liệu (Sau này sẽ gọi tới API NodeJS)
  fetchReviews: async () => {
    set({ isLoading: true });
    try {
      // Demo data
      const demoData = [
        {
          id: '1',
          repo: 'TrungPhuNA/tool-review-gate',
          commitHash: '7c92f1a3',
          author: 'phuphan',
          message: '[FEAT] Setup review gate engine',
          status: 'accepted',
          timestamp: new Date().toISOString(),
          projectType: 'nodejs',
          groups: {
            security: { valid: true, issues: [] },
            standard: { valid: true, issues: [] }
          }
        },
        {
          id: '2',
          repo: 'TrungPhuNA/laravel-web',
          commitHash: 'a1b2c3d4',
          author: 'dev02',
          message: 'update .env file',
          status: 'rejected',
          timestamp: new Date().toISOString(),
          projectType: 'php-laravel',
          groups: {
            security: { 
              valid: false, 
              issues: [{ rule: 'No .env file allowed', error: 'Phát hiện file .env trong commit' }] 
            }
          }
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ reviews: demoData });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveReview: (review) => set({ activeReview: review }),
}));
