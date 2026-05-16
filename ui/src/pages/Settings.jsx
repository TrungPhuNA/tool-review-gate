import { Settings as SettingsIcon, Shield, Bell, Database, Globe, Key } from 'lucide-react';

function Settings() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="type-title-md tracking-tight">System Settings</h2>
        <p className="type-body text-muted">Cấu hình các tham số vận hành cho ReviewGate.</p>
      </header>

      <div className="space-y-6">
        {/* General Config */}
        <section className="card-premium space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-line">
            <Globe size={20} className="text-electric" />
            <h3 className="type-title-sm">General Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="type-caption font-bold text-muted uppercase">System Name</label>
              <input type="text" defaultValue="ReviewGate Enterprise" className="w-full px-4 py-2.5 bg-surfaceSoft border border-line rounded-xl text-sm" />
            </div>
            <div className="space-y-2">
              <label className="type-caption font-bold text-muted uppercase">API Endpoint</label>
              <input type="text" defaultValue="http://localhost:3000" className="w-full px-4 py-2.5 bg-surfaceSoft border border-line rounded-xl text-sm" />
            </div>
          </div>
        </section>

        {/* Security Config */}
        <section className="card-premium space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-line">
            <Shield size={20} className="text-emerald-500" />
            <h3 className="type-title-sm">Security & Tokens</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surfaceSoft rounded-2xl border border-line">
              <div className="flex items-center gap-3">
                <Key size={18} className="text-muted" />
                <div>
                  <p className="type-label">GitHub Personal Access Token</p>
                  <p className="text-[10px] text-muted">Dùng để cập nhật Status Check trên GitHub PRs</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-ink text-white rounded-lg text-xs font-bold">Update Token</button>
            </div>

            <div className="flex items-center justify-between p-4 bg-surfaceSoft rounded-2xl border border-line">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-muted" />
                <div>
                  <p className="type-label">Webhook Secret</p>
                  <p className="text-[10px] text-muted">Dùng để xác thực tín hiệu gửi tới từ GitHub</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-surface border border-line text-ink rounded-lg text-xs font-bold">Reveal Secret</button>
            </div>
          </div>
        </section>

        {/* Database Config */}
        <section className="card-premium space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-line">
            <Database size={20} className="text-amber-500" />
            <h3 className="type-title-sm">Database Sync</h3>
          </div>
          
          <p className="text-xs text-muted leading-relaxed">
            Hệ thống đang sử dụng MySQL: <span className="font-mono text-ink">tool_review_gate</span>.
            Mọi dữ liệu được lưu trữ tập trung tại server local của bạn.
          </p>
        </section>
      </div>

      <div className="flex justify-end pt-8">
        <button className="px-8 py-3 bg-electric text-white rounded-xl font-bold text-sm shadow-xl shadow-electric/20">
          Save All Changes
        </button>
      </div>
    </div>
  );
}

export default Settings;
