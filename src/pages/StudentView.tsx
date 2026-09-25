import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { 
  BookOpen, 
  Send, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  GraduationCap,
  Info,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import DrawingCanvas from '../components/DrawingCanvas';

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  grade: string;
  questions: Question[];
  settings: {
    showResults: boolean;
  };
  status: string;
}

export default function StudentView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [studentInfo, setStudentInfo] = useState({ name: '', class: '' });
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'assignments', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().status === 'published') {
          setAssignment({ id: docSnap.id, ...docSnap.data() } as Assignment);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [id]);

  const handleStart = () => {
    if (studentInfo.name.trim() === '') {
      alert("Vui lòng nhập họ tên của em.");
      return;
    }
    setIsStarted(true);
  };

  const handleAnswerChange = (qid: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (!assignment) return;
    
    const confirmSubmit = window.confirm("Em có chắc chắn muốn nộp bài không?");
    if (!confirmSubmit) return;

    setSubmitting(true);
    try {
      // Calculate score
      let correctCount = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      assignment.questions.forEach(q => {
        totalPoints += q.points;
        const studentAnswer = answers[q.id];
        
        // Basic auto-grading for simple types
        if (['multiple-choice', 'true-false', 'fill-in-blank', 'short-answer', 'math'].includes(q.type)) {
          if (studentAnswer && studentAnswer.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase()) {
            correctCount++;
            earnedPoints += q.points;
          }
        }
      });

      const submissionData = {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        studentName: studentInfo.name,
        studentClass: studentInfo.class,
        answers: Object.entries(answers).map(([qid, val]) => ({ qid, val })),
        score: Math.round((earnedPoints / totalPoints) * 10),
        correctCount,
        totalQuestions: assignment.questions.length,
        submittedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'submissions'), submissionData);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });

      navigate(`/result/${docRef.id}`);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Lỗi khi nộp bài. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!assignment) return (
    <div className="max-w-xl mx-auto mt-20 px-4 text-center">
      <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
        <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy bài tập</h2>
        <p className="text-slate-600 mb-6">Link bài tập có thể đã hết hạn hoặc bị giáo viên đóng.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 font-bold hover:underline">Về trang chủ</button>
      </div>
    </div>
  );

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl"
        >
          <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg">
            <GraduationCap size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2">{assignment.title}</h1>
          <div className="flex justify-center gap-4 mb-10">
            <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-bold text-slate-500">{assignment.subject}</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-bold text-slate-500">{assignment.grade}</span>
          </div>

          <div className="space-y-6 max-w-sm mx-auto">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên của em</label>
              <input 
                type="text" 
                placeholder="Nhập đầy đủ họ tên..."
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={studentInfo.name}
                onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Lớp / Mã số (Tùy chọn)</label>
              <input 
                type="text" 
                placeholder="Ví dụ: 5A, 12C2..."
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={studentInfo.class}
                onChange={(e) => setStudentInfo({ ...studentInfo, class: e.target.value })}
              />
            </div>
            <button 
              onClick={handleStart}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Bắt đầu làm bài <ChevronRight />
            </button>
          </div>

          <div className="mt-12 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800 text-sm">
            <Info size={20} className="flex-shrink-0" />
            <p><strong>Lưu ý:</strong> Em hãy kiểm tra kỹ các câu trả lời trước khi nhấn nút "Nộp bài". Chúc em làm bài tốt!</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-40 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-slate-800 truncate max-w-[200px] md:max-w-none">{assignment.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm font-semibold">
              <Clock size={16} />
              <span>Đang làm bài...</span>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={18} />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">
        {assignment.questions.map((q, index) => (
          <div 
            key={q.id}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative group overflow-hidden"
          >
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-[0.03] pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${answers[q.id] ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-400'}`}>
                  {index + 1}
                </div>
                <div className="h-px flex-grow bg-slate-100"></div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{q.points} điểm</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">{q.question}</h3>

              <div className="space-y-4">
                {/* Multiple Choice */}
                {q.type === 'multiple-choice' && q.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswerChange(q.id, opt)}
                        className={`p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center gap-3 ${
                          answers[q.id] === opt 
                            ? 'bg-blue-50 border-blue-500 text-blue-700' 
                            : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          answers[q.id] === opt ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {q.type === 'true-false' && (
                  <div className="flex gap-4">
                    {['Đúng', 'Sai'].map((val) => (
                      <button
                        key={val}
                        onClick={() => handleAnswerChange(q.id, val)}
                        className={`px-8 py-3 rounded-xl border-2 font-bold transition-all flex-grow ${
                          answers[q.id] === val 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02]' 
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}

                {/* Fill in Blank / Short Answer / Math */}
                {(q.type === 'fill-in-blank' || q.type === 'short-answer' || q.type === 'math') && (
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full p-4 bg-slate-50 border-b-2 border-slate-200 focus:border-blue-500 focus:outline-none text-lg font-medium transition-all"
                      placeholder="Nhập câu trả lời của em tại đây..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                      <GraduationCap size={24} />
                    </div>
                  </div>
                )}

                {/* Essay / Drawing Canvas */}
                {(q.type === 'essay' || q.type === 'drawing') && (
                  <div className="space-y-4">
                    <textarea 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-medium min-h-[120px]"
                      placeholder="Viết câu trả lời của em..."
                      value={answers[q.id]?.text || ''}
                      onChange={(e) => handleAnswerChange(q.id, { ...answers[q.id], text: e.target.value })}
                    />
                    <div className="bg-slate-100/50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Hoặc em có thể vẽ / viết tay trực tiếp bên dưới:</p>
                      <DrawingCanvas 
                        onSave={(data) => handleAnswerChange(q.id, { ...answers[q.id], canvas: data })}
                        initialData={answers[q.id]?.canvas}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="text-center pt-8">
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-extrabold text-xl hover:bg-blue-700 transition-all shadow-xl hover:scale-[1.05] active:scale-95 flex items-center gap-3 mx-auto disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                Đang nộp bài...
              </>
            ) : (
              <>
                <CheckCircle2 size={28} />
                NỘP BÀI / KIỂM TRA KẾT QUẢ
              </>
            )}
          </button>
          <p className="text-slate-400 mt-4 text-sm italic">"Em hãy chắc chắn đã làm hết tất cả các câu trước khi nộp nhé!"</p>
        </div>
      </div>

      {/* Progress Sidebar (Desktop) */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden lg:block space-y-2">
        {assignment.questions.map((q, idx) => (
          <button
            key={q.id}
            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${
              answers[q.id] ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
