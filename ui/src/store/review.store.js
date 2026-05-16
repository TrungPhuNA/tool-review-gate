import { create } from 'zustand';

/**
 * ReviewStore: Quản lý trạng thái các bản review và lịch sử commit
 */
export const useReviewStore = create((set) => ({
  reviews: [],
  activeReview: null,
  isLoading: false,

  // Lấy dữ liệu thật từ API NodeJS
  fetchReviews: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('http://localhost:3000/api/reviews');
      const data = await response.json();
      
      // Chuyển đổi dữ liệu từ DB sang format của Store
      const formattedData = data.map(r => ({
        id: r.id.toString(),
        repo: r.repo,
        commitHash: r.commitHash.substring(0, 7),
        author: r.author,
        message: r.message,
        status: r.status,
        timestamp: r.createdAt,
        projectType: r.projectType,
        groups: r.details?.groups || {}
      }));

      set({ reviews: formattedData });
    } catch (error) {
      console.error('❌ Lỗi khi tải dữ liệu từ API:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveReview: (review) => set({ activeReview: review }),
}));
