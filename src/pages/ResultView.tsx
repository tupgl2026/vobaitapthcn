import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  Home, 
  RotateCcw, 
  Printer,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  answers: { qid: string; val: any }[];
  submittedAt: any;
}

interface Assignment {
  id: string;
  questions: any[];
  settings: {
    showResults: boolean;
  };
}

export default function ResultView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const subDoc = await getDoc(doc(db, 'submissions', id));
        if (subDoc.exists()) {
          const subData = { id: subDoc.id, ...subDoc.data() } as Submission;
          setSubmission(subData);

          const assDoc = await getDoc(doc(db, 'assignments', subData.assignmentId));
          if (assDoc.exists()) {
            setAssignment({ id: assDoc.id, ...assDoc.data() } as Assignment);
          }
        }
      } catch (error) {
        console.error("Error fetching result:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getMotivationalMessage = (score: number) => {
    if (score >= 9) return { text: "Xuất sắc! Em đã làm rất tốt!", color: "text-green-600", bg: "bg-green-50" };
    if (score >= 7) return { text: "Rất tốt! Hãy tiếp tục phát huy nhé!", color: "text-blue-600", bg: "bg-blue-50" };
    if (score >= 5) return { text: "Khá lắm! Cố gắng thêm chút nữa nhé!", color: "text-amber-600", bg: "bg-amber-50" };
    return { text: "Đừng buồn nhé! Cố gắng ôn tập và làm lại nào!", color: "text-slate-600", bg: "bg-slate-50" };
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!submission || !assignment) return (
    <div className="max-w-xl mx-auto mt-20 px-4 text-center">
      <div className="bg-red-50 p-8 rounded-3xl">
        <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy kết quả</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold">Về trang chủ</button>
      </div>
    </div>
  );

  const message = getMotivationalMessage(submission.score);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 mb-10"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-center text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy size={120} />
            </div>
            <h1 className="text-2xl font-bold mb-2">KẾT QUẢ BÀI LÀM</h1>
            <p className="text-blue-100 mb-8">{submission.assignmentTitle}</p>
            
            <div className="flex justify-center items-end gap-2 mb-4">
              <span className="text-7xl font-black text-yellow-400">{submission.score}</span>
              <span className="text-2xl font-bold text-blue-200 mb-2">/ 10</span>
            </div>
            
            <div className="flex justify-center gap-6 text-sm font-bold uppercase tracking-wider">
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="block text-blue-200 text-[10px]">Đúng</span>
                <span className="text-lg">{submission.correctCount} / {submission.totalQuestions}</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="block text-blue-200 text-[10px]">Thời gian</span>
                <span className="text-lg">--:--</span>
              </div>
            </div>
          </div>

          <div className={`p-8 text-center ${message.bg}`}>
            <p className={`text-2xl font-bold ${message.color}`}>{message.text}</p>
            <p className="text-slate-500 mt-2">Học sinh: <strong>{submission.studentName}</strong></p>
          </div>

          <div className="p-6 border-t border-slate-100 flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate(`/assignment/${submission.assignmentId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              <RotateCcw size={20} /> Làm lại bài
            </button>
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              onClick={() => window.print()}
            >
              <Printer size={20} /> In kết quả
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
            >
              <Home size={20} /> Về trang chủ
            </button>
          </div>
        </motion.div>

        {/* Detailed Feedback */}
        {assignment.settings.showResults && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={24} className="text-blue-600" /> Xem lại chi tiết
            </h2>
            
            {assignment.questions.map((q, index) => {
              const studentAnswer = submission.answers.find(a => a.qid === q.id)?.val;
              const isCorrect = q.type === 'essay' ? null : (studentAnswer?.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase());

              return (
                <div 
                  key={q.id}
                  className={`bg-white p-6 rounded-2xl border-l-8 shadow-sm ${
                    isCorrect === true ? 'border-green-500' : 
                    isCorrect === false ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-slate-400 uppercase text-xs">Câu {index + 1}</span>
                    {isCorrect === true && <span className="flex items-center gap-1 text-green-600 font-bold text-sm"><CheckCircle2 size={16} /> Chính xác</span>}
                    {isCorrect === false && <span className="flex items-center gap-1 text-red-600 font-bold text-sm"><XCircle size={16} /> Chưa đúng</span>}
                    {isCorrect === null && <span className="text-slate-400 font-bold text-sm italic">Đang chờ chấm</span>}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-4">{q.question}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Câu trả lời của em</p>
                      <p className={`font-bold ${isCorrect === true ? 'text-green-700' : isCorrect === false ? 'text-red-700' : 'text-slate-700'}`}>
                        {q.type === 'essay' && studentAnswer?.text ? studentAnswer.text : (studentAnswer || '(Trống)')}
                      </p>
                      {studentAnswer?.canvas && (
                        <img src={studentAnswer.canvas} alt="Student drawing" className="mt-2 rounded-lg border border-slate-200 bg-white max-h-40" />
                      )}
                    </div>
                    {isCorrect !== true && q.correctAnswer && (
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Đáp án đúng</p>
                        <p className="font-bold text-blue-800">{q.correctAnswer}</p>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                      <MessageCircle size={20} className="text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Lời giải chi tiết</p>
                        <p className="text-slate-600 text-sm italic">{q.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
