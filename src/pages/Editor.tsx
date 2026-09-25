import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { 
  Upload, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  FileText, 
  Settings as SettingsIcon, 
  Eye, 
  HelpCircle,
  GripVertical,
  Type,
  CheckSquare,
  AlignLeft,
  PenTool,
  Hash,
  Link2
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'matching' | 'short-answer' | 'essay' | 'math';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
  matchingPairs?: { left: string; right: string }[];
}

interface AssignmentData {
  title: string;
  subject: string;
  grade: string;
  questions: Question[];
  status: 'draft' | 'published' | 'closed';
  settings: {
    showResults: boolean;
    shuffleQuestions: boolean;
    timeLimit?: number;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function Editor({ user }: { user: User | null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AssignmentData>({
    title: 'Bài tập mới',
    subject: '',
    grade: '',
    questions: [],
    status: 'draft',
    settings: {
      showResults: true,
      shuffleQuestions: false
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (id) {
      const fetchAssignment = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, 'assignments', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setData(docSnap.data() as AssignmentData);
          }
        } catch (error) {
          console.error("Error fetching assignment:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAssignment();
    }
  }, [id, user, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const response = await fetch('/api/analyze-assignment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            fileType: file.type
          })
        });

        if (response.ok) {
          const result = await response.json();
          setData(prev => ({
            ...prev,
            title: result.title || prev.title,
            subject: result.subject || prev.subject,
            grade: result.grade || prev.grade,
            questions: [...prev.questions, ...result.questions.map((q: any) => ({ ...q, id: Math.random().toString(36).substr(2, 9) }))]
          }));
        }
      };
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Có lỗi xảy ra khi phân tích tài liệu.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async (isPublish = false) => {
    if (!user) return;
    setSaving(true);
    try {
      const assignmentData = {
        ...data,
        teacherId: user.uid,
        status: isPublish ? 'published' : data.status,
        updatedAt: Timestamp.now(),
        createdAt: data.createdAt || Timestamp.now()
      };

      if (id) {
        await updateDoc(doc(db, 'assignments', id), assignmentData);
      } else {
        const newDocRef = await addDoc(collection(db, 'assignments'), assignmentData);
        navigate(`/editor/${newDocRef.id}`, { replace: true });
      }
      alert(isPublish ? "Đã xuất bản bài tập!" : "Đã lưu bản nháp.");
    } catch (error) {
      console.error("Save error:", error);
      alert("Lỗi khi lưu dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      question: 'Câu hỏi mới',
      points: 1,
      options: type === 'multiple-choice' ? ['Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3', 'Lựa chọn 4'] : undefined
    };
    setData({ ...data, questions: [...data.questions, newQuestion] });
  };

  const removeQuestion = (qid: string) => {
    setData({ ...data, questions: data.questions.filter(q => q.id !== qid) });
  };

  const updateQuestion = (qid: string, updates: Partial<Question>) => {
    setData({
      ...data,
      questions: data.questions.map(q => q.id === qid ? { ...q, ...updates } : q)
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Editor Header */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-40 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex-grow">
              <input 
                type="text" 
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="text-xl font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button 
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              <span className="hidden sm:inline">Lưu nháp</span>
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
            >
              <Sparkles size={20} />
              <span>Xuất bản</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Settings & Tools */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <SettingsIcon size={16} /> Thiết lập bài tập
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Môn học</label>
                <input 
                  type="text" 
                  value={data.subject}
                  onChange={(e) => setData({ ...data, subject: e.target.value })}
                  placeholder="Ví dụ: Toán, Tiếng Việt..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Khối lớp</label>
                <input 
                  type="text" 
                  value={data.grade}
                  onChange={(e) => setData({ ...data, grade: e.target.value })}
                  placeholder="Ví dụ: Lớp 5, 12A1..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-slate-700">Hiện kết quả sau khi nộp</span>
                <input 
                  type="checkbox" 
                  checked={data.settings.showResults}
                  onChange={(e) => setData({ ...data, settings: { ...data.settings, showResults: e.target.checked } })}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus size={16} /> Thêm câu hỏi
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'multiple-choice', icon: <CheckSquare size={18} />, label: 'Trắc nghiệm' },
                { type: 'true-false', icon: <HelpCircle size={18} />, label: 'Đúng/Sai' },
                { type: 'fill-in-blank', icon: <Type size={18} />, label: 'Điền từ' },
                { type: 'matching', icon: <Link2 size={18} />, label: 'Nối cặp' },
                { type: 'short-answer', icon: <AlignLeft size={18} />, label: 'Trả lời ngắn' },
                { type: 'essay', icon: <PenTool size={18} />, label: 'Tự luận' },
                { type: 'math', icon: <Hash size={18} />, label: 'Toán học' }
              ].map((tool) => (
                <button 
                  key={tool.type}
                  onClick={() => addQuestion(tool.type as any)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-slate-600"
                >
                  <div className="mb-2">{tool.icon}</div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* AI Upload Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10 max-w-lg">
              <h2 className="text-2xl font-bold mb-2">Tạo bài tập bằng AI</h2>
              <p className="text-blue-100 mb-6">Tải lên file PDF, ảnh đề bài hoặc tài liệu. Gemini sẽ tự động bóc tách câu hỏi cho bạn.</p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="application/pdf,image/*,.docx"
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-md disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600"></div>
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Tải tài liệu ngay
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {data.questions.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>Chưa có câu hỏi nào. Hãy tải tài liệu hoặc thêm câu hỏi thủ công.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.questions.map((q, index) => (
                  <motion.div 
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-300 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-500 cursor-grab active:cursor-grabbing">
                          <GripVertical size={20} />
                        </div>
                        <span className="font-bold text-slate-400">Câu {index + 1}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded leading-tight">
                          {q.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={q.points}
                          onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-sm font-bold focus:outline-none"
                        />
                        <span className="text-xs text-slate-400 font-bold">Điểm</span>
                        <button 
                          onClick={() => removeQuestion(q.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <textarea 
                        value={q.question}
                        onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium leading-relaxed resize-none"
                        rows={2}
                        placeholder="Nhập nội dung câu hỏi..."
                      />

                      {/* Options for Multiple Choice */}
                      {q.type === 'multiple-choice' && q.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 focus-within:border-blue-300 transition-all">
                              <input 
                                type="radio" 
                                name={`correct-${q.id}`}
                                checked={q.correctAnswer === opt}
                                onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                                className="w-5 h-5 text-blue-600"
                              />
                              <input 
                                type="text" 
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...q.options!];
                                  newOpts[oIdx] = e.target.value;
                                  updateQuestion(q.id, { options: newOpts });
                                }}
                                className="bg-transparent w-full focus:outline-none text-sm font-medium"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* True/False */}
                      {q.type === 'true-false' && (
                        <div className="flex gap-4">
                          {['Đúng', 'Sai'].map((val) => (
                            <button
                              key={val}
                              onClick={() => updateQuestion(q.id, { correctAnswer: val })}
                              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                                q.correctAnswer === val ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Other simple types */}
                      {(q.type === 'fill-in-blank' || q.type === 'short-answer' || q.type === 'math') && (
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Đáp án đúng</label>
                          <input 
                            type="text" 
                            value={q.correctAnswer || ''}
                            onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                            placeholder="Nhập đáp án..."
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Giải thích (Tùy chọn)</label>
                        <textarea 
                          value={q.explanation || ''}
                          onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm italic text-slate-600 resize-none"
                          rows={1}
                          placeholder="Giải thích tại sao đáp án này đúng..."
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
