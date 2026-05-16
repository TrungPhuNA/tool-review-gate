import { ShieldCheck, Code2, AlertCircle, CheckCircle } from 'lucide-react';

const RULE_GROUPS = [
  {
    lang: 'Common',
    rules: [
      { name: 'Commit Message Format', desc: 'Kiểm tra cấu trúc [TAG] hoặc tag: trong commit message.', severity: 'Error' }
    ]
  },
  {
    lang: 'NodeJS / ReactJS',
    rules: [
      { name: 'ESLint Standard', desc: 'Kiểm tra lỗi biến chưa khai báo, biến không dùng và trùng lặp.', severity: 'Error' },
      { name: 'No eval()', desc: 'Chặn hoàn toàn việc sử dụng hàm eval() để đảm bảo bảo mật.', severity: 'Error' },
      { name: 'No console.log', desc: 'Cảnh báo khi code sản phẩm còn sót console.log.', severity: 'Warning' }
    ]
  },
  {
    lang: 'PHP Laravel',
    rules: [
      { name: 'No .env in commit', desc: 'Ngăn chặn việc commit file cấu hình nhạy cảm lên server.', severity: 'Error' },
      { name: 'No Debug Mode', desc: 'Đảm bảo APP_DEBUG=true không xuất hiện trong code sản phẩm.', severity: 'Error' }
    ]
  }
];

function GlobalRules() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="type-title-md tracking-tight">Global Rules Configuration</h2>
        <p className="type-body text-muted">Danh sách các quy chuẩn đang được áp dụng đồng nhất trên toàn hệ thống.</p>
      </header>

      <div className="space-y-12">
        {RULE_GROUPS.map((group, i) => (
          <section key={i} className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-surfaceSoft rounded-lg flex items-center justify-center">
                <Code2 size={18} className="text-electric" />
              </div>
              <h3 className="type-title-sm uppercase tracking-widest text-muted">{group.lang}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.rules.map((rule, idx) => (
                <div key={idx} className="card-premium flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${
                    rule.severity === 'Error' ? 'bg-softRose text-accent' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {rule.severity === 'Error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-ink">{rule.name}</h4>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        rule.severity === 'Error' ? 'bg-accent/10 text-accent' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {rule.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default GlobalRules;
