import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, googleProvider } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { BookOpen, User as UserIcon, LogOut, LayoutDashboard, PlusCircle, GraduationCap } from 'lucide-react';

// Pages (to be created)
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import StudentView from './pages/StudentView';
import ResultView from './pages/ResultView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Navigation */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 hidden sm:block">
                VỞ BÀI TẬP THÔNG MINH
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <LayoutDashboard size={20} />
                    <span className="hidden sm:inline">Quản lý</span>
                  </Link>
                  <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
                    <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-slate-200" />
                    <button 
                      onClick={handleLogout}
                      className="text-slate-500 hover:text-red-600 transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                >
                  <UserIcon size={20} />
                  <span>Đăng nhập Giáo viên</span>
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/editor/:id?" element={<Editor user={user} />} />
            <Route path="/assignment/:id" element={<StudentView />} />
            <Route path="/result/:id" element={<ResultView />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-8 px-4 mt-auto">
          <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
            <p>© 2026 VỞ BÀI TẬP THÔNG MINH – Giải pháp AI cho Giáo dục</p>
            <p className="mt-2 text-slate-400 italic">"Tải tài liệu – Tạo bài tập – Tự động chấm điểm"</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
