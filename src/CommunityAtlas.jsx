import { useState, useEffect, createContext, useContext, useMemo } from "react";
import axios from "axios";
import { CiSearch,CiTrash } from "react-icons/ci";

// ─────────────────────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// Creates a single axios instance with the base URL pre-configured.
// The token interceptor automatically attaches Authorization: Bearer <token>
// to every request so you never have to pass the token manually.
// ─────────────────────────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: "https://community-atlas-backend-4a9r.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach token from localStorage on every call
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ca_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap data or return a clean error object
// This means every caller gets { success, data/user/token, message }
// without try/catch boilerplate everywhere.
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Server responded with a non-2xx status
    if (error.response) return error.response.data;
    // Network error / server unreachable
    return { success: false, message: "Cannot connect to server. Is the backend running on port 5000?" };
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, restore session from token stored in localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("ca_token");
      if (!token) { setLoading(false); return; }
      const data = await axiosInstance.get("/auth/me");
      if (data.success) setUser(data.user);
      else localStorage.removeItem("ca_token"); // token expired or invalid
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await axiosInstance.post("/auth/login", { email, password });
    if (data.success) {
      localStorage.setItem("ca_token", data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password, role, phone) => {
    const data = await axiosInstance.post("/auth/register", { name, email, password, role, phone });
    if (data.success) {
      localStorage.setItem("ca_token", data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("ca_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Health", "Education", "Business", "Organization"];
const COLORS = { Health: "#2D6A4F", Education: "#52B788", Business: "#D4A017", Organization: "#E07A5F" };
const ICONS  = { Health:"", Education: "", Business: "", Organization: "" };

const STATUS_STYLE = {
  approved: { bg: "#E8F5E9", color: "#2D6A4F", icon: "✅" },
  rejected: { bg: "#FEE2E2", color: "#DC2626", icon: "❌" },
  pending:  { bg: "#FFF8E1", color: "#D4A017", icon: "⏳" },
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --forest: #1A3C2A; --canopy: #2D6A4F; --leaf: #52B788; --mint: #95D5B2;
    --mist: #D8F3DC; --sand: #F5ECD7; --cream: #FAF7F0;
    --ink: #1A1A1A; --mid: #5A5A5A; --light: #9A9A9A;
    --amber: #D4A017; --coral: #E07A5F;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'DM Sans',sans-serif; background:var(--cream); color:var(--ink); }

  /* NAV */
  .nav { background:var(--forest); padding:0 2rem; display:flex; align-items:center; justify-content:space-between; height:64px; position:sticky; top:0; z-index:100; border-bottom:2px solid var(--canopy); }
  .logo { display:flex; align-items:center; gap:10px; cursor:pointer; }
  .logo-icon { width:36px; height:36px; background:var(--leaf); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; }
  .logo-text { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:700; color:var(--sand); }
  .logo-text span { color:var(--leaf); }
  .nav-links { display:flex; gap:6px; align-items:center; }
  .nav-btn { background:none; border:none; color:var(--mint); font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:500; padding:8px 16px; border-radius:6px; cursor:pointer; transition:all .2s; }
  .nav-btn:hover { background:rgba(82,183,136,.15); color:var(--sand); }
  .nav-btn.active { background:var(--canopy); color:var(--sand); }
  .nav-cta { background:var(--leaf); color:var(--forest); font-weight:700; border-radius:6px; padding:8px 18px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:.9rem; transition:all .2s; }
  .nav-cta:hover { background:var(--mint); }
  .nav-user { display:flex; align-items:center; gap:10px; }
  .role-badge { background:rgba(82,183,136,.2); color:var(--leaf); border:1px solid rgba(82,183,136,.3); border-radius:12px; padding:4px 12px; font-size:.78rem; font-weight:600; }
  .nav-user-name { color:var(--mint); font-size:.88rem; font-weight:500; }
  .logout-btn { background:none; border:1px solid rgba(82,183,136,.3); color:var(--mint); border-radius:6px; padding:6px 12px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:.82rem; transition:all .2s; }
  .logout-btn:hover { background:rgba(224,122,95,.2); color:#ff9980; border-color:rgba(224,122,95,.4); }

  /* HERO */
  .hero { background:var(--forest); overflow:hidden; padding:80px 2rem 100px; text-align:center; position:relative; }
  .hero::before { content:''; position:absolute; top:-60px; right:-80px; width:400px; height:400px; background:radial-gradient(circle, rgba(82,183,136,.15), transparent 70%); border-radius:50%; }
  .hero-badge { display:inline-block; background:rgba(82,183,136,.2); color:var(--leaf); border:1px solid rgba(82,183,136,.3); border-radius:20px; padding:6px 16px; font-size:.8rem; font-weight:600; letter-spacing:1px; text-transform:uppercase; margin-bottom:24px; }
  .hero-title { font-family:'Playfair Display',serif; font-size:clamp(2.4rem,5vw,3.8rem); font-weight:700; color:var(--sand); line-height:1.15; margin-bottom:20px; position:relative; z-index:1; }
  .hero-title em { font-style:italic; color:var(--leaf); }
  .hero-sub { color:var(--mint); font-size:1.05rem; font-weight:300; max-width:520px; margin:0 auto 40px; line-height:1.7; position:relative; z-index:1; }
  .search-bar { display:flex; max-width:520px; margin:0 auto 40px; background:white; border-radius:12px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,.3); position:relative; z-index:1; }
  .search-bar input { flex:1; padding:16px 20px; border:none; outline:none; font-family:'DM Sans',sans-serif; font-size:.95rem; color:var(--ink); }
  .search-bar input::placeholder { color:var(--light); }
  .search-bar button { background:var(--canopy); color:white; border:none; padding:0 28px; font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer; transition:background .2s; }
  .search-bar button:hover { background:var(--forest); }
  .hero-stats { display:flex; gap:40px; justify-content:center; position:relative; z-index:1; }
  .stat-num { font-family:'Playfair Display',serif; font-size:2rem; font-weight:700; color:var(--sand); }
  .stat-lbl { font-size:.78rem; color:var(--mint); font-weight:500; letter-spacing:.5px; text-transform:uppercase; margin-top:2px; }

  /* LAYOUT */
  .container { max-width:1200px; margin:0 auto; padding:40px 2rem; }
  .page-row { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:16px; }
  .section-title { font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:700; color:var(--forest); }
  .section-title span { color:var(--canopy); }
  .section-sub { color:var(--light); font-size:.88rem; margin-top:4px; }

  /* FILTERS */
  .filters { display:flex; gap:8px; flex-wrap:wrap; }
  .pill { background:white; border:1.5px solid #E0DDD4; color:var(--mid); border-radius:20px; padding:7px 16px; font-size:.85rem; font-weight:500; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
  .pill:hover { border-color:var(--leaf); color:var(--canopy); }
  .pill.active { background:var(--canopy); border-color:var(--canopy); color:white; }

  /* CARDS */
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
  .card { background:white; border-radius:14px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.07); transition:all .25s; cursor:pointer; border:1.5px solid transparent; }
  .card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(45,106,79,.15); border-color:var(--mint); }
  .card-stripe { height:6px; }
  .card-body { padding:20px 22px 22px; }
  .card-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10px; }
  .card-icon { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .cat-badge { font-size:.72rem; font-weight:600; letter-spacing:.5px; text-transform:uppercase; padding:4px 10px; border-radius:10px; }
  .card-name { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:600; color:var(--forest); margin-bottom:6px; line-height:1.35; }
  .card-loc { font-size:.82rem; color:var(--light); margin-bottom:10px; font-weight:500; }
  .card-desc { font-size:.87rem; color:var(--mid); line-height:1.6; margin-bottom:14px; }
  .card-contact { font-size:.82rem; color:var(--canopy); font-weight:600; }
  .card-foot { border-top:1px solid #F0EDE6; padding:12px 22px; }
  .link-btn { font-size:.82rem; font-weight:600; color:var(--canopy); background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:color .2s; }
  .link-btn:hover { color:var(--forest); }

  /* AUTH MODAL */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); }
  .auth-box { background:white; border-radius:20px; overflow:hidden; max-width:440px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,.25); animation:popIn .25s ease; }
  @keyframes popIn { from{transform:scale(.95) translateY(10px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
  .auth-head { background:var(--forest); padding:28px 32px 24px; }
  .auth-head h2 { font-family:'Playfair Display',serif; font-size:1.6rem; color:var(--sand); margin-bottom:4px; }
  .auth-head p { color:var(--mint); font-size:.88rem; }
  .auth-body { padding:28px 32px; }
  .auth-tabs { display:flex; background:#F0EDE6; border-radius:10px; padding:4px; margin-bottom:24px; }
  .auth-tab { flex:1; background:none; border:none; padding:9px; border-radius:8px; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600; font-size:.88rem; color:var(--mid); transition:all .2s; }
  .auth-tab.active { background:white; color:var(--forest); box-shadow:0 1px 6px rgba(0,0,0,.1); }
  .field { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
  .field label { font-size:.78rem; font-weight:600; color:var(--mid); text-transform:uppercase; letter-spacing:.5px; }
  .field input, .field select { border:1.5px solid #E0DDD4; border-radius:8px; padding:11px 14px; font-family:'DM Sans',sans-serif; font-size:.9rem; color:var(--ink); outline:none; transition:border-color .2s; }
  .field input:focus, .field select:focus { border-color:var(--leaf); }
  .error-box { background:#FEE2E2; color:#DC2626; border-radius:8px; padding:10px 14px; font-size:.85rem; margin-bottom:12px; }
  .primary-btn { width:100%; background:var(--canopy); color:white; border:none; border-radius:10px; padding:13px; font-family:'DM Sans',sans-serif; font-weight:600; font-size:.95rem; cursor:pointer; transition:background .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .primary-btn:hover { background:var(--forest); }
  .primary-btn:disabled { background:var(--light); cursor:not-allowed; }
  .ghost-btn { display:block; width:100%; background:none; border:none; color:var(--light); font-size:.85rem; cursor:pointer; padding:12px; font-family:'DM Sans',sans-serif; }
  .ghost-btn:hover { color:var(--mid); }

  /* SERVICE DETAIL MODAL */
  .svc-modal { background:white; border-radius:20px; overflow:hidden; max-width:520px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,.25); animation:popIn .25s ease; }
  .svc-stripe { height:8px; }
  .svc-body { padding:28px; }
  .svc-cat-row { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .svc-cat-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; }
  .svc-name { font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:700; color:var(--forest); margin-bottom:8px; line-height:1.2; }
  .svc-loc { color:var(--light); font-size:.85rem; margin-bottom:16px; font-weight:500; }
  .svc-desc { font-size:.93rem; color:var(--mid); line-height:1.7; margin-bottom:20px; padding:14px; background:var(--cream); border-radius:10px; border-left:3px solid var(--leaf); }
  .contact-label { font-size:.78rem; font-weight:600; color:var(--light); text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
  .contact-val { font-size:1rem; color:var(--canopy); font-weight:600; margin-bottom:4px; }
  .svc-footer { padding:16px 28px; border-top:1px solid #F0EDE6; }
  .close-btn { width:100%; background:var(--cream); color:var(--mid); border:none; border-radius:8px; padding:12px; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600; font-size:.9rem; }
  .close-btn:hover { background:#EAE7E0; }

  /* SUBMIT FORM */
  .form-section { background:var(--forest); border-radius:20px; padding:48px; margin-bottom:40px; position:relative; overflow:hidden; }
  .form-section::before { content:''; position:absolute; top:-80px; right:-80px; width:280px; height:280px; background:radial-gradient(circle,rgba(82,183,136,.15),transparent 70%); border-radius:50%; }
  .form-2col { display:grid; grid-template-columns:1fr 1fr; gap:32px; position:relative; z-index:1; }
  .form-info h2 { font-family:'Playfair Display',serif; font-size:2rem; font-weight:700; color:var(--sand); margin-bottom:12px; line-height:1.2; }
  .form-info h2 em { color:var(--leaf); font-style:italic; }
  .form-info p { color:var(--mint); font-size:.95rem; line-height:1.7; margin-bottom:24px; }
  .checklist { list-style:none; }
  .checklist li { display:flex; align-items:center; gap:10px; color:var(--mist); font-size:.9rem; margin-bottom:10px; }
  .check-dot { width:20px; height:20px; background:var(--leaf); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:10px; }
  .form-card { background:white; border-radius:14px; padding:28px; display:flex; flex-direction:column; gap:14px; }
  .form-card h3 { font-family:'Playfair Display',serif; font-size:1.2rem; color:var(--forest); }
  .form-2row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .f-field { display:flex; flex-direction:column; gap:5px; }
  .f-field.span2 { grid-column:1/-1; }
  .f-field label { font-size:.78rem; font-weight:600; color:var(--mid); text-transform:uppercase; letter-spacing:.5px; }
  .f-field input, .f-field select, .f-field textarea { border:1.5px solid #E0DDD4; border-radius:8px; padding:10px 14px; font-family:'DM Sans',sans-serif; font-size:.9rem; color:var(--ink); outline:none; transition:border-color .2s; resize:vertical; }
  .f-field input:focus, .f-field select:focus, .f-field textarea:focus { border-color:var(--leaf); }
  .submit-btn { background:var(--canopy); color:white; border:none; border-radius:10px; padding:14px; font-family:'DM Sans',sans-serif; font-weight:600; font-size:.95rem; cursor:pointer; transition:background .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .submit-btn:hover { background:var(--forest); }
  .submit-btn:disabled { background:var(--light); cursor:not-allowed; }

  /* MY LISTINGS / ADMIN TABLE */
  .table-box { background:white; border-radius:14px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.07); margin-top:32px; }
  .table-head { padding:18px 24px; border-bottom:1px solid #F0EDE6; display:flex; align-items:center; justify-content:space-between; }
  .table-head span { font-family:'Playfair Display',serif; font-weight:600; color:var(--forest); }
  .t-row { padding:14px 24px; border-bottom:1px solid #F8F5EF; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .t-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .t-info { flex:1; min-width:160px; }
  .t-name { font-weight:600; font-size:.9rem; color:var(--ink); }
  .t-sub { font-size:.78rem; color:var(--light); margin-top:2px; }
  .s-badge { font-size:.75rem; font-weight:600; padding:3px 10px; border-radius:10px; white-space:nowrap; }
  .action-btn { border:none; border-radius:6px; padding:6px 12px; font-size:.78rem; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600; transition:opacity .2s; }
  .action-btn:hover { opacity:.85; }

  /* ADMIN STAT CARDS */
  .stat-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-bottom:28px; }
  .stat-card { background:white; border-radius:12px; padding:20px 22px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
  .s-num { font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:700; color:var(--forest); margin:6px 0 2px; }
  .s-lbl { font-size:.82rem; color:var(--light); font-weight:500; text-transform:uppercase; letter-spacing:.5px; }

  /* MAP */
  .map-wrap { background:white; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.07); margin-bottom:40px; }
  .map-bar { padding:18px 24px; border-bottom:1px solid #F0EDE6; display:flex; align-items:center; justify-content:space-between; }
  .map-bar span { font-family:'Playfair Display',serif; font-weight:600; color:var(--forest); }
  .map-area { height:380px; background:#E8F5E9; position:relative; overflow:hidden; }
  .map-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(45,106,79,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(45,106,79,.08) 1px,transparent 1px); background-size:40px 40px; }
  .road-h { position:absolute; left:0; right:0; height:3px; background:rgba(45,106,79,.25); }
  .road-v { position:absolute; top:0; bottom:0; width:3px; background:rgba(45,106,79,.25); }
  .pin { position:absolute; transform:translate(-50%,-100%); display:flex; flex-direction:column; align-items:center; cursor:pointer; }
  .pin-dot { width:36px; height:36px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,.2); font-size:14px; }
  .pin-dot span { transform:rotate(45deg); display:block; }
  .pin-label { background:white; border-radius:6px; padding:3px 8px; font-size:.7rem; font-weight:600; color:var(--forest); margin-top:28px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,.15); }
  .map-legend { padding:14px 24px; display:flex; gap:20px; flex-wrap:wrap; }

  /* MISC */
  .banner { background:rgba(212,160,23,.12); border:1px solid rgba(212,160,23,.3); border-radius:12px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
  .banner p { color:#8B5E3C; font-size:.9rem; font-weight:500; }
  .banner button { background:var(--amber); color:white; border:none; border-radius:8px; padding:8px 18px; font-family:'DM Sans',sans-serif; font-weight:600; font-size:.88rem; cursor:pointer; }
  .spinner { display:inline-block; width:18px; height:18px; border:2px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; }
  .spinner.dark { border-color:rgba(45,106,79,.2); border-top-color:var(--canopy); width:32px; height:32px; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .centered { display:flex; align-items:center; justify-content:center; min-height:300px; flex-direction:column; gap:12px; }
  .empty { grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--light); }
  .empty-icon { font-size:3rem; margin-bottom:12px; }
  .empty h3 { font-family:'Playfair Display',serif; color:var(--mid); margin-bottom:6px; }
  .toast { position:fixed; bottom:24px; right:24px; background:var(--canopy); color:white; padding:14px 22px; border-radius:10px; font-size:.9rem; font-weight:500; box-shadow:0 8px 24px rgba(0,0,0,.2); z-index:300; animation:toastIn .3s ease, toastOut .3s ease 2.7s forwards; }
  @keyframes toastIn { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes toastOut { to{transform:translateY(20px);opacity:0} }
  .footer { background:var(--forest); color:var(--mint); padding:40px 2rem 24px; margin-top:48px; }
  .footer-grid { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:2fr 1fr 1fr; gap:40px; margin-bottom:32px; }
  .footer-brand h3 { font-family:'Playfair Display',serif; font-size:1.3rem; color:var(--sand); margin-bottom:10px; }
  .footer-brand h3 span { color:var(--leaf); }
  .footer-brand p { font-size:.88rem; line-height:1.7; max-width:280px; }
  .footer-col h4 { font-size:.78rem; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:var(--sand); margin-bottom:14px; }
  .footer-col a { display:block; color:var(--mint); font-size:.88rem; text-decoration:none; margin-bottom:8px; cursor:pointer; transition:color .2s; }
  .footer-col a:hover { color:var(--sand); }
  .footer-bottom { max-width:1200px; margin:0 auto; border-top:1px solid rgba(82,183,136,.2); padding-top:20px; display:flex; justify-content:space-between; font-size:.82rem; color:var(--light); }
  .footer-bottom span { color:var(--leaf); }
  @media(max-width:768px) { .form-2col,.form-2row,.footer-grid{grid-template-columns:1fr} .nav-links{display:none} .hero-stats{gap:20px} .form-section{padding:28px 20px} }
`;

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Spinner = ({ dark }) => <span className={`spinner${dark ? " dark" : ""}`} />;

const Toast = ({ msg }) => msg ? <div className="toast">{msg}</div> : null;

const ServiceCard = ({ s, onClick }) => {
  const color = COLORS[s.category];
  return (
    <div className="card" onClick={() => onClick(s)}>
      <div className="card-stripe" style={{ background: color }} />
      <div className="card-body">
        <div className="card-head">
          <div className="card-icon" style={{ background: color + "22" }}>{ICONS[s.category]}</div>
          <span className="cat-badge" style={{ background: color + "18", color }}>{s.category}</span>
        </div>
        <div className="card-name">{s.name}</div>
        <div className="card-loc">📍 {s.location?.address || "—"}</div>
        <div className="card-desc">{(s.description || "").slice(0, 90)}...</div>
        {s.contact?.phone && <div className="card-contact">📞 {s.contact.phone}</div>}
      </div>
      <div className="card-foot"><button className="link-btn">View details →</button></div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────────────────────────────────────────
const AuthModal = ({ onClose, showToast }) => {
  const { login, register } = useAuth();
  const [tab, setTab]       = useState("login");
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState("");
  const [f, setF] = useState({ name: "", email: "", password: "", role: "community_member", phone: "" });

  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setError(""); };

  const submit = async () => {
    if (!f.email || !f.password) { setError("Email and password are required."); return; }
    setBusy(true); setError("");
    const res = tab === "login"
      ? await login(f.email, f.password)
      : await register(f.name, f.email, f.password, f.role, f.phone);
    setBusy(false);
    if (res.success) { showToast(`👋 Welcome${res.user?.name ? ", " + res.user.name.split(" ")[0] : ""}!`); onClose(); }
    else setError(res.message || "Something went wrong.");
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="auth-box" onClick={e => e.stopPropagation()}>
        <div className="auth-head">
          <h2>🗺️ CommunityAtlas</h2>
          <p>{tab === "login" ? "Sign in to manage your service listings" : "Create your account"}</p>
        </div>
        <div className="auth-body">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Sign In</button>
            <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>Register</button>
          </div>
          {error && <div className="error-box">⚠️ {error}</div>}
          {tab === "register" && (
            <>
              <div className="field"><label>Full Name</label><input placeholder="Amina Uwase" value={f.name} onChange={e => set("name", e.target.value)} /></div>
              <div className="field">
                <label>I want to...</label>
                <select value={f.role} onChange={e => set("role", e.target.value)}>
                  <option value="community_member">Browse services (Community Member)</option>
                  <option value="service_provider">List a service (Service Provider)</option>
                </select>
              </div>
              <div className="field"><label>Phone (optional)</label><input placeholder="+250 7XX XXX XXX" value={f.phone} onChange={e => set("phone", e.target.value)} /></div>
            </>
          )}
          <div className="field"><label>Email</label><input type="email" placeholder="you@example.com" value={f.email} onChange={e => set("email", e.target.value)} /></div>
          <div className="field"><label>Password</label><input type="password" placeholder="••••••••" value={f.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} /></div>
          <button className="primary-btn" onClick={submit} disabled={busy}>
            {busy ? <Spinner /> : tab === "login" ? "Sign In →" : "Create Account →"}
          </button>
          <button className="ghost-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
const ServiceModal = ({ s, onClose }) => {
  if (!s) return null;
  const color = COLORS[s.category];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="svc-modal" onClick={e => e.stopPropagation()}>
        <div className="svc-stripe" style={{ background: color }} />
        <div className="svc-body">
          <div className="svc-cat-row">
            <div className="svc-cat-icon" style={{ background: color + "20" }}>{ICONS[s.category]}</div>
            <span style={{ fontSize: ".8rem", fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color }}>{s.category}</span>
          </div>
          <div className="svc-name">{s.name}</div>
          <div className="svc-loc">📍 {s.location?.address}</div>
          <div className="svc-desc">{s.description}</div>
          <div className="contact-label">Contact</div>
          {s.contact?.phone && <div className="contact-val">📞 {s.contact.phone}</div>}
          {s.contact?.email && <div className="contact-val">✉️ {s.contact.email}</div>}
        </div>
        <div className="svc-footer"><button className="close-btn" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
const PIN_POSITIONS = [
  { left: "28%", top: "38%" }, { left: "62%", top: "28%" }, { left: "45%", top: "58%" },
  { left: "70%", top: "55%" }, { left: "38%", top: "42%" }, { left: "22%", top: "62%" },
  { left: "55%", top: "72%" }, { left: "80%", top: "38%" },
];

const EMPTY_FORM = { name: "", category: "Health", address: "", sector: "Gasabo", phone: "", email: "", description: "" };

function AppInner() {
  const { user, logout, loading: authLoading } = useAuth();

  const [page, setPage]             = useState("home");
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState("All");
  const [services, setServices]     = useState([]);
  const [fetching, setFetching]     = useState(true);
  const [picked, setPicked]         = useState(null);   // service detail modal
  const [toast, setToast]           = useState(null);
  const [showAuth, setShowAuth]     = useState(false);
  const [myList, setMyList]         = useState([]);
  const [adminData, setAdminData]   = useState({ counts: {}, data: [] });
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ── Fetch public services ───────────────────────────────────────────────
  const loadServices = async () => {
    setFetching(true);
    const params = {};
    if (filter !== "All") params.category = filter;
    if (search.trim()) params.search = search.trim();
    const res = await axiosInstance.get("/services", { params });
    setServices(res.success ? res.data : []);
    setFetching(false);
  };

  useEffect(() => { loadServices(); }, [filter]);     // re-run when filter changes
  // Note: search only fires on Enter/button click to avoid hammering the API

  // ── My Listings (service provider) ─────────────────────────────────────
  const loadMyListings = async () => {
    const res = await axiosInstance.get("/services/my/listings");
    if (res.success) setMyList(res.data);
  };

  useEffect(() => {
    if (page === "submit" && (user?.role === "service_provider" || user?.role === "admin")) {
      loadMyListings();
    }
  }, [page, user]);

  // ── Admin data ──────────────────────────────────────────────────────────
  const loadAdmin = async () => {
    const res = await axiosInstance.get("/admin/services");
    if (res.success) setAdminData(res);
    else showToast("❌ " + res.message);
  };

  useEffect(() => {
    if (page === "admin" && user?.role === "admin") loadAdmin();
  }, [page, user]);

  // ── Submit service ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim()) { showToast("⚠️ Name and address are required"); return; }
    setSubmitting(true);
    const res = await axiosInstance.post("/services", {
      name: form.name, category: form.category, description: form.description,
      address: form.address, sector: form.sector,
      phone: form.phone, email: form.email,
      latitude: -1.9517, longitude: 30.0588,  // default Kigali coords
    });
    setSubmitting(false);
    if (res.success) {
      showToast("✅ Submitted! Awaiting moderator review.");
      setForm(EMPTY_FORM);
      loadMyListings();
    } else {
      showToast("❌ " + (res.message || "Submission failed"));
    }
  };

  // ── Admin actions ───────────────────────────────────────────────────────
  const approve = async (id, name) => {
    const res = await axiosInstance.put(`/admin/services/${id}/approve`, { note: "Approved" });
    if (res.success) { showToast(`"${name}" approved`); loadAdmin(); loadServices(); }
    else showToast("❌ " + res.message);
  };
  const reject = async (id, name) => {
    const res = await axiosInstance.put(`/admin/services/${id}/reject`, { note: "Does not meet guidelines" });
    if (res.success) { showToast(`"${name}" rejected`); loadAdmin(); }
    else showToast("❌ " + res.message);
  };
  const remove = async (id, name) => {
    const res = await axiosInstance.delete(`/admin/services/${id}`);
    if (res.success) { showToast(
    <span>
      <CiTrash style={{ marginRight: "6px" }} />
      "{name}" deleted
    </span>
  );
  loadAdmin(); }
    else showToast("❌ " + res.message);
  };

  // ── Navigation guard ────────────────────────────────────────────────────
  const goTo = (p) => {
    if (p === "submit" && !user) { setShowAuth(true); return; }
    if (p === "admin" && user?.role !== "admin") { showToast("⛔ Admin access only"); return; }
    setPage(p);
  };

  if (authLoading) return (
    <div className="centered" style={{ minHeight: "100vh" }}>
      <Spinner dark /><span style={{ color: "var(--mid)", fontSize: ".9rem" }}>Loading...</span>
    </div>
  );

  const canSubmit = user?.role === "service_provider" || user?.role === "admin";

  return (
    <>
      <style>{styles}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="logo" onClick={() => setPage("home")}>
          <div className="logo-icon">🗺️</div>
          <div className="logo-text">Community<span>Atlas</span></div>
        </div>
        <div className="nav-links">
          <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>Explore</button>
          <button className={`nav-btn ${page === "map"  ? "active" : ""}`} onClick={() => setPage("map")}>Map</button>
          <button className={`nav-btn ${page === "submit" ? "active" : ""}`} onClick={() => goTo("submit")}>Add Service</button>
          {user?.role === "admin" && <button className={`nav-btn ${page === "admin" ? "active" : ""}`} onClick={() => goTo("admin")}>Dashboard</button>}
        </div>
        {user ? (
          <div className="nav-user">
            <span className="role-badge">{user.role === "admin" ? "🛡️ Admin" : user.role === "service_provider" ? "🏪 Provider" : "👤 Member"}</span>
            <span className="nav-user-name">{user.name.split(" ")[0]}</span>
            <button className="logout-btn" onClick={() => { logout(); showToast("👋 Signed out"); setPage("home"); }}>Sign out</button>
          </div>
        ) : (
          <button className="nav-cta" onClick={() => setShowAuth(true)}>Sign In</button>
        )}
      </nav>

      {/* ─────────── HOME ─────────── */}
      {page === "home" && (
        <>
          <div className="hero">
            <div className="hero-badge">🌍 Gasabo District, Kigali</div>
            <h1 className="hero-title">Find Local Services<br /><em>Built by your community</em></h1>
            <p className="hero-sub">Discover health centers, schools, local businesses, and community organizations near you.</p>
            <div className="search-bar">
              <input
                placeholder="Search health, education, markets..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadServices()}
              />
              <button onClick={loadServices}>Search</button>
            </div>
            <div className="hero-stats">
              <div><div className="stat-num">{services.length}</div><div className="stat-lbl">Services</div></div>
              <div><div className="stat-num">4</div><div className="stat-lbl">Categories</div></div>
              <div><div className="stat-num">1</div><div className="stat-lbl">Sector</div></div>
            </div>
          </div>

          <div className="container">
            {!user && (
              <div className="banner">
                <p><strong>Service Providers:</strong> Sign in to list your service and reach the community.</p>
                <button onClick={() => setShowAuth(true)}>Sign In / Register</button>
              </div>
            )}
            <div className="page-row">
              <div>
                <div className="section-title">Local <span>Services</span></div>
                <div className="section-sub">{services.length} approved listing{services.length !== 1 ? "s" : ""}</div>
              </div>
              <div className="filters">
                {CATEGORIES.map(c => <button key={c} className={`pill ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c !== "All" && ICONS[c] + " "}{c}</button>)}
              </div>
            </div>
            {fetching
              ? <div className="centered"><Spinner dark /></div>
              : <div className="grid">
                  {services.length === 0 && <div className="empty"><div className="empty-icon"><CiSearch /></div><h3>No services found</h3><p>Try a different filter or search term</p></div>}
                  {services.map(s => <ServiceCard key={s._id} s={s} onClick={setPicked} />)}
                </div>
            }
          </div>
        </>
      )}

      {/* ─────────── MAP ─────────── */}
      {page === "map" && (
        <div className="container">
          <div className="page-row" style={{ marginTop: 8 }}>
            <div className="section-title">Interactive <span>Map</span></div>
            <div className="filters">
              {CATEGORIES.map(c => <button key={c} className={`pill ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c !== "All" && ICONS[c] + " "}{c}</button>)}
            </div>
          </div>
          <div className="map-wrap">
            <div className="map-bar">
              <span>🗺️ Gasabo Sector — Service Locations</span>
              <span style={{ fontSize: ".8rem", color: "var(--light)" }}>Click a pin to view details</span>
            </div>
            <div className="map-area">
              <div className="map-grid" />
              <div className="road-h" style={{ top: "35%" }} /><div className="road-h" style={{ top: "65%" }} />
              <div className="road-v" style={{ left: "30%" }} /><div className="road-v" style={{ left: "60%" }} />
              {services.map((s, i) => {
                const color = COLORS[s.category];
                const pos = PIN_POSITIONS[i % PIN_POSITIONS.length];
                return (
                  <div key={s._id} className="pin" style={pos} onClick={() => setPicked(s)}>
                    <div className="pin-dot" style={{ background: color }}><span>{ICONS[s.category]}</span></div>
                    <div className="pin-label">{s.name.split(" ").slice(0, 2).join(" ")}</div>
                  </div>
                );
              })}
            </div>
            <div className="map-legend">
              {Object.entries(COLORS).map(([cat, color]) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: ".82rem", color: "var(--mid)", fontWeight: 500 }}>{ICONS[cat]} {cat}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid">
            {services.map(s => <ServiceCard key={s._id} s={s} onClick={setPicked} />)}
          </div>
        </div>
      )}

      {/* ─────────── SUBMIT ─────────── */}
      {page === "submit" && (
        <div className="container">
          {!canSubmit ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
              <h2 style={{ fontFamily: "Playfair Display,serif", color: "var(--forest)", marginBottom: 10 }}>Service Providers Only</h2>
              <p style={{ color: "var(--mid)", marginBottom: 24 }}>Register as a Service Provider to list your service.</p>
              <button className="nav-cta" style={{ padding: "12px 28px" }} onClick={() => setShowAuth(true)}>Register as Provider</button>
            </div>
          ) : (
            <>
              <div className="form-section">
                <div className="form-2col">
                  <div className="form-info">
                    <h2>List Your<br /><em>Service</em></h2>
                    <p>Help your community discover what you offer. Listings are reviewed within 24–48 hours.</p>
                    <ul className="checklist">
                      {["Free to list your service", "Verified by community admins", "Reach hundreds of residents", "Easy to update anytime"].map(t => (
                        <li key={t}><div className="check-dot">✓</div>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="form-card">
                    <h3>Service Details</h3>
                    <div className="form-2row">
                      <div className="f-field"><label>Service Name *</label><input placeholder="e.g. Kigali Dental Clinic" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                      <div className="f-field"><label>Category *</label><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}><option>Health</option><option>Education</option><option>Business</option><option>Organization</option></select></div>
                      <div className="f-field"><label>Address *</label><input placeholder="e.g. Remera, Gasabo" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
                      <div className="f-field"><label>Sector</label><input placeholder="e.g. Remera" value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))} /></div>
                      <div className="f-field"><label>Phone</label><input placeholder="+250 7XX XXX XXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                      <div className="f-field"><label>Email</label><input placeholder="contact@service.rw" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                      <div className="f-field span2"><label>Description</label><textarea rows={3} placeholder="What does your service offer to the community?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                    </div>
                    <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? <><Spinner /> Submitting...</> : "Submit for Review →"}
                    </button>
                  </div>
                </div>
              </div>

              {myList.length > 0 && (
                <div className="table-box">
                  <div className="table-head"><span>My Listings</span><span style={{ fontSize: ".82rem", color: "var(--light)" }}>{myList.length} total</span></div>
                  {myList.map(s => {
                    const st = STATUS_STYLE[s.status] || STATUS_STYLE.pending;
                    const color = COLORS[s.category];
                    return (
                      <div key={s._id} className="t-row">
                        <div className="t-icon" style={{ background: color + "20" }}>{ICONS[s.category]}</div>
                        <div className="t-info">
                          <div className="t-name">{s.name}</div>
                          <div className="t-sub">📍 {s.location?.address}</div>
                        </div>
                        <span className="s-badge" style={{ background: st.bg, color: st.color }}>{st.icon} {s.status}</span>
                        {s.moderationNote && <span style={{ fontSize: ".8rem", color: "var(--light)", fontStyle: "italic" }}>{s.moderationNote}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ─────────── ADMIN ─────────── */}
      {page === "admin" && user?.role === "admin" && (
        <div className="container">
          <div style={{ marginBottom: 28, marginTop: 8 }}>
            <div className="section-title">Admin <span>Dashboard</span></div>
            <div className="section-sub">Moderate and manage all community service listings</div>
          </div>
          <div className="stat-row">
            {[
              { lbl: "Total",    val: adminData.counts?.total    ?? "—", icon: "", c: "#2D6A4F" },
              { lbl: "Pending",  val: adminData.counts?.pending  ?? "—", icon: "", c: "#D4A017" },
              { lbl: "Approved", val: adminData.counts?.approved ?? "—", icon: "", c: "#52B788" },
              { lbl: "Rejected", val: adminData.counts?.rejected ?? "—", icon: "", c: "#E07A5F" },
            ].map(s => (
              <div key={s.lbl} className="stat-card" style={{ borderTop: `4px solid ${s.c}` }}>
                <div style={{ fontSize: "1.5rem" }}>{s.icon}</div>
                <div className="s-num">{s.val}</div>
                <div className="s-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
          <div className="table-box">
            <div className="table-head"><span>All Service Listings</span></div>
            {(adminData.data || []).length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--light)" }}>No listings yet.</div>}
            {(adminData.data || []).map(s => {
              const color = COLORS[s.category];
              const st = STATUS_STYLE[s.status] || STATUS_STYLE.pending;
              return (
                <div key={s._id} className="t-row">
                  <div className="t-icon" style={{ background: color + "20" }}>{ICONS[s.category]}</div>
                  <div className="t-info">
                    <div className="t-name">{s.name}</div>
                    <div className="t-sub">by {s.submittedBy?.name || "Unknown"} · {s.location?.address}</div>
                  </div>
                  <span className="s-badge" style={{ background: color + "18", color }}>{s.category}</span>
                  <span className="s-badge" style={{ background: st.bg, color: st.color }}>{st.icon} {s.status}</span>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {s.status !== "approved" && <button className="action-btn" style={{ background: "var(--leaf)", color: "white" }} onClick={() => approve(s._id, s.name)}>Approve</button>}
                    {s.status !== "rejected" && <button className="action-btn" style={{ background: "#FFF8E1", color: "#D4A017" }} onClick={() => reject(s._id, s.name)}>Reject</button>}
                    <button className="action-btn" style={{ background: "#FEE2E2", color: "#DC2626" }} onClick={() => remove(s._id, s.name)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Community<span>Atlas</span></h3>
            <p>A community-driven digital map connecting Rwandan residents with local services, businesses, and organizations.</p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <a onClick={() => setPage("home")}>All Services</a>
            <a onClick={() => setPage("map")}>Map View</a>
            <a onClick={() => goTo("submit")}>Add a Service</a>
          </div>
          <div className="footer-col">
            <h4>Categories</h4>
            {Object.entries(ICONS).map(([cat, icon]) => (
              <a key={cat} onClick={() => { setFilter(cat); setPage("home"); }}>{icon} {cat}</a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CommunityAtlas · Built for <span>Rwandan Communities</span></span>
          <span>African Leadership University</span>
        </div>
      </footer>

      {/* ── MODALS ── */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} showToast={showToast} />}
      {picked    && <ServiceModal s={picked} onClose={() => setPicked(null)} />}
      <Toast msg={toast} />
    </>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
