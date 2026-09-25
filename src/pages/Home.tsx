import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Share2, CheckCircle2, ChevronRight, UploadCloud, MonitorCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 text-white py-20 px-4 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-blue-500/30 backdrop-blur-md rounded-full text-sm font-semibold mb-6 border border-white/20">
              Công nghệ AI dành cho giáo dục 4.0
            </span>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Biến tài liệu giấy thành <br />
              <span className="text-yellow-400">Vở bài tập tương tác</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-lg leading-relaxed">
              Tải lên tài liệu PDF, DOCX hoặc ảnh chụp. AI sẽ tự động phân tích và tạo bài tập trực tuyến chuyên nghiệp chỉ trong vài giây.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                Bắt đầu ngay <ChevronRight />
              </button>
              <button className="bg-transparent border-2 border-white/40 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Xem hướng dẫn
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Digital Education" 
                className="rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 text-slate-800">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Tự động chấm điểm</p>
                  <p className="text-2xl font-bold text-slate-800">Chính xác 99%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Quy trình đơn giản, hiệu quả</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">Hỗ trợ giáo viên tối ưu hóa thời gian soạn bài và quản lý kết quả học tập của học sinh.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              icon: <UploadCloud className="w-10 h-10 text-blue-600" />, 
              title: "Tải tài liệu", 
              desc: "Hỗ trợ PDF, DOCX và ảnh chụp đề bài từ sách giáo khoa." 
            },
            { 
              icon: <Sparkles className="w-10 h-10 text-purple-600" />, 
              title: "AI Phân tích", 
              desc: "Tự động nhận diện câu hỏi, đáp án và môn học một cách thông minh." 
            },
            { 
              icon: <Share2 className="w-10 h-10 text-green-600" />, 
              title: "Chia sẻ Link", 
              desc: "Gửi link bài tập cho học sinh qua Zalo, Facebook hoặc Messenger." 
            },
            { 
              icon: <MonitorCheck className="w-10 h-10 text-orange-600" />, 
              title: "Theo dõi kết quả", 
              desc: "Xem bảng điểm, thống kê các câu sai để hỗ trợ học sinh kịp thời." 
            }
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
              <div className="mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <h2 className="text-3xl font-bold mb-6">Bạn đã sẵn sàng nâng cấp lớp học?</h2>
          <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto">
            Hàng nghìn giáo viên đang sử dụng Vở Bài Tập Thông Minh để tiết kiệm 80% thời gian soạn bài.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-10 py-4 rounded-xl font-bold text-xl transition-all shadow-lg"
          >
            Tạo bài tập ngay miễn phí
          </button>
        </div>
      </section>
    </div>
  );
}
