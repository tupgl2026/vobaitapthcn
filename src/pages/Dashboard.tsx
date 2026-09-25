import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { 
  Plus, 
  FileText, 
  Share2, 
  Trash2, 
  ExternalLink, 
  Users, 
  BarChart3, 
  Clock, 
  Settings, 
  AlertCircle,
  Copy,
  CheckCircle,
  Search
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  grade: string;
  status: 'draft' | 'published' | 'closed';
  createdAt: Timestamp;
  studentCount?: number;
}

export default function Dashboard({ user }: { user: User | null }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchAssignments = async () => {
      try {
        const q = query(collection(db, 'assignments'), where('teacherId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const list: Assignment[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Assignment);
        });
        setAssignments(list.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      try {
        await deleteDoc(doc(db, 'assignments', id));
        setAssignments(assignments.filter(a => a.id !== id));
      } catch (error) {
        console.error("Error deleting assignment:", error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'closed' : 'published';
    try {
      await updateDoc(doc(db, 'assignments', id), { status: newStatus });
      setAssignments(assignments.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/assignment/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chào mừng, {user?.displayName}!</h1>
          <p className="text-slate-500 mt-1">Quản lý các bài tập và theo dõi tiến độ của học sinh.</p>
        </div>
        <button 
          onClick={() => navigate('/editor')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
        >
          <Plus size={24} />
          Tạo bài tập mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Tổng bài tập</p>
            <p className="text-3xl font-bold text-slate-900">{assignments.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl text-green-600">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Đang hoạt động</p>
            <p className="text-3xl font-bold text-slate-900">{assignments.filter(a => a.status === 'published').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Lượt làm bài</p>
            <p className="text-3xl font-bold text-slate-900">--</p>
          </div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">Danh sách bài tập</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài tập..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredAssignments.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Tên bài tập</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Học sinh</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{assignment.title}</span>
                        <span className="text-xs text-slate-500">{assignment.subject} • {assignment.grade}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        assignment.status === 'published' ? 'bg-green-100 text-green-700' :
                        assignment.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {assignment.status === 'published' ? 'Đang mở' : assignment.status === 'draft' ? 'Bản nháp' : 'Đã đóng'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users size={16} />
                        <span>0</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {assignment.createdAt.toDate().toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-3">
                        <button 
                          onClick={() => copyLink(assignment.id)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Sao chép link"
                        >
                          {copiedId === assignment.id ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} />}
                        </button>
                        <Link 
                          to={`/editor/${assignment.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Settings size={18} />
                        </Link>
                        <button 
                          onClick={() => handleToggleStatus(assignment.id, assignment.status)}
                          className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                          title={assignment.status === 'published' ? 'Đóng bài' : 'Mở bài'}
                        >
                          {assignment.status === 'published' ? <AlertCircle size={18} /> : <ExternalLink size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(assignment.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Chưa có bài tập nào</h3>
              <p className="text-slate-500 mb-6">Hãy tạo bài tập đầu tiên bằng cách tải lên tài liệu.</p>
              <button 
                onClick={() => navigate('/editor')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all"
              >
                Bắt đầu ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
