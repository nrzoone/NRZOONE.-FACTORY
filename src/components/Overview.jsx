import React, { useMemo } from 'react';
import { Activity, Scissors, Layers, Hammer, Package, Truck, Users, Database, DollarSign, FileText, TrendingUp, AlertCircle, MessageSquare, LayoutGrid, Plus } from 'lucide-react';
import logoWhite from '../assets/logo_white.png';
import logoBlack from '../assets/logo_black.png';

const mockStats = {
    lowStock: [
        { name: 'HYDRAULIC PUMP', qty: 2 },
        { name: 'THERMAL SHIELD', qty: 5 },
        { name: 'CORE SENSOR', qty: 1 },
        { name: 'VALVE GASKET', qty: 3 },
        { name: 'POWER RELAY', qty: 4 }
    ]
};

const ProductionTrend = ({ data }) => {
    const safeData = (data && data.length > 0) ? data : [0];
    const maxVal = Math.max(...safeData, 1);
    const points = safeData.map((d, i) => `${(i * 100) / (safeData.length > 1 ? safeData.length - 1 : 1)},${100 - (d / maxVal) * 100}`).join(' ');
    return (
        <div className="h-24 w-full mt-4 group">
            <svg viewBox="0 0 100 100" className="w-full h-full preserve-colors" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
                <path d={`M 0 100 L 0 ${100 - (safeData[0] / maxVal) * 100} L ${points} L 100 100 Z`} fill="url(#chartGradient)" />
                <polyline
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className="transition-all duration-1000"
                    style={{ strokeDasharray: 1000, strokeDashoffset: 0 }}
                />
            </svg>
        </div>
    );
};

const Overview = ({ masterData, setMasterData, setActivePanel, user, t }) => {
    const stats = useMemo(() => {
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - i);
            return d.toLocaleDateString('en-GB');
        }).reverse();

        const trendData = last7Days.map(date => (masterData.productions || []).filter(p => p.date === date).length);
        
        const productionToday = (masterData.productions || []).filter(p => p.date === today.toLocaleDateString('en-GB')).length;
        const totalProduction = (masterData.productions || []).length;

        const activeCutting = (masterData.cuttingStock || []).filter(c => !c.isDistributed).length;
        const pendingPata = (masterData.pataEntries || []).filter(p => p.status !== 'Received').length;

        const pendingSewing = (masterData.productions || []).filter(p => p.type === 'sewing' && p.status !== 'Received').length;
        const pendingStone = (masterData.productions || []).filter(p => p.type === 'stone' && p.status !== 'Received').length;
        const pendingOutside = (masterData.outsideWorkEntries || []).filter(p => p.status !== 'Received').length;

        const inventory = {};
        (masterData.rawInventory || []).forEach(log => {
            const key = log.color ? `${log.item} (${log.color})` : log.item;
            if (!inventory[key]) inventory[key] = { name: log.item, color: log.color, qty: 0 };
            if (log.type === 'in') inventory[key].qty += Number(log.qty);
            else if (log.type === 'out') inventory[key].qty -= Number(log.qty);
        });
        const lowStock = Object.values(inventory).filter(i => i.qty <= 5);

        const recentActivity = [
            ...(masterData.productions || []).filter(p => p.type === 'sewing').map(p => ({ ...p, activityType: 'Sewing', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-50' })),
            ...(masterData.productions || []).filter(p => p.type === 'stone').map(p => ({ ...p, activityType: 'Stone', icon: Hammer, color: 'text-amber-500', bg: 'bg-amber-50' })),
            ...(masterData.cuttingStock || []).map(c => ({ ...c, activityType: 'Cutting', icon: Scissors, color: 'text-black', bg: 'bg-slate-100' })),
            ...(masterData.pataEntries || []).map(p => ({ ...p, activityType: 'Pata', icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' })),
            ...(masterData.outsideWorkEntries || []).map(p => ({ ...p, activityType: 'Outside', icon: Truck, color: 'text-rose-500', bg: 'bg-rose-50' }))
        ].sort((a, b) => (b.id || 0) - (a.id || 0));

        return { productionToday, totalProduction, activeCutting, pendingPata, pendingSewing, pendingStone, pendingOutside, lowStock, recentActivity, trendData };
    }, [masterData]);

    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';

    const [note, setNote] = React.useState('');
    const handleSendNote = () => {
        if (!note) return;
        const newNote = { id: Date.now(), from: user.name, text: note, date: new Date().toLocaleString() };
        setMasterData(prev => ({
            ...prev,
            adminNotes: [...(prev.adminNotes || []), newNote]
        }));
        setNote('');
    };

    const [categoryFilter, setCategoryFilter] = React.useState('All');
    const filteredFeed = categoryFilter === 'All'
        ? stats.recentActivity.slice(0, 15)
        : stats.recentActivity.filter(a => a.activityType === categoryFilter).slice(0, 15);
    const feedCategories = ['All', 'Cutting', 'Sewing', 'Stone', 'Pata', 'Outside'];

    return (
        <div className="space-y-6 md:space-y-12 pb-24 animate-fade-up px-2 italic text-black font-outfit">

            {/* Hero Banner */}
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] border-2 border-slate-100 shadow-xl p-5 md:p-8 flex flex-col gap-5">

                {/* Top row: Logo + Title + Quick Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="bg-black rounded-2xl p-3 shadow-xl shrink-0">
                            <img src={logoWhite} alt="NRZO0NE" className="w-10 h-10 md:w-14 md:h-14 object-contain" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-none text-black italic whitespace-nowrap">
                                NRZO0NE <span className="text-slate-400">FACTORY</span>
                            </h1>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 italic">
                                {t('systemsStable')} • Manufacturing Terminal
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={() => setActivePanel('Menu')} className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:scale-105 transition-all">
                            <LayoutGrid size={14} /> {t('mainMenu')}
                        </button>
                        <button onClick={() => setActivePanel('Swing')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:scale-105 transition-all">
                            <Plus size={14} /> {t('issueWork')}
                        </button>
                    </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="glass-card p-4 rounded-2xl border border-white/40 shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 leading-tight">{t('outputToday')}</p>
                        <p className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 leading-none">+{stats.productionToday}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{t('pcs')}</p>
                        <ProductionTrend data={stats.trendData} />
                    </div>
                    <div className="glass-card p-4 rounded-2xl border border-white/40 shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 leading-tight">{t('cuttingQueue')}</p>
                        <p className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 leading-none">{stats.activeCutting}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{t('lots')}</p>
                    </div>
                    <div className="glass-card bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50 shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-1 leading-tight">{t('sewingLine')}</p>
                        <p className="text-2xl md:text-3xl font-black tracking-tight text-indigo-700 leading-none">{stats.pendingSewing}</p>
                        <p className="text-[8px] font-bold text-indigo-400 uppercase mt-1">{t('active')}</p>
                    </div>
                    <div className="glass-card bg-amber-50/30 p-4 rounded-2xl border border-amber-100/50 shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1 leading-tight">{t('stoneHub')}</p>
                        <p className="text-2xl md:text-3xl font-black tracking-tight text-amber-700 leading-none">{stats.pendingStone}</p>
                        <p className="text-[8px] font-bold text-amber-400 uppercase mt-1">{t('active')}</p>
                    </div>
                    <div className="glass-card bg-rose-50/30 p-4 rounded-2xl border border-rose-100/50 shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1 leading-tight">{t('outsideLine')}</p>
                        <p className="text-2xl md:text-3xl font-black tracking-tight text-rose-700 leading-none">{stats.pendingOutside}</p>
                        <p className="text-[8px] font-bold text-rose-400 uppercase mt-1">{t('jobs')}</p>
                    </div>
                    <div className="glass-card bg-orange-50/30 p-4 rounded-2xl border border-orange-100/50 shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-orange-500 mb-1 leading-tight">{t('pataLine')}</p>
                        <p className="text-2xl md:text-3xl font-black tracking-tight text-orange-700 leading-none">{stats.pendingPata}</p>
                        <p className="text-[8px] font-bold text-orange-400 uppercase mt-1">{t('active')}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Active Monitor List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-8 rounded-3xl border border-white/40 shadow-xl overflow-hidden min-h-[500px]">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-black/5">
                            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-slate-800">
                                <span className="relative flex h-4 w-4">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                </span>
                                {t('liveProductionStream')}
                            </h3>
                            <button onClick={() => window.location.reload()} className="p-3 bg-white/50 text-slate-600 rounded-xl hover:bg-white hover:text-black transition-all border border-white/50 shadow-sm"><TrendingUp size={18} /></button>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar mb-4">
                            {feedCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${categoryFilter === cat ? 'bg-black/90 backdrop-blur-md text-white shadow-xl' : 'bg-white/50 text-slate-600 hover:bg-white/80 border border-white/40'}`}
                                >
                                    {t(cat.toLowerCase()) || cat}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {filteredFeed.map((act, i) => (
                                <div key={act.id || i} className="group bg-white/60 hover:bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-white/50 hover:border-white shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${act.bg.replace('bg-', 'bg-').replace('-50', '-100/50')}`}>
                                            <act.icon size={20} className={act.color} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-white ${act.activityType === 'Cutting' ? 'bg-black' : act.activityType === 'Sewing' ? 'bg-indigo-600' : act.activityType === 'Stone' ? 'bg-amber-600' : act.activityType === 'Pata' ? 'bg-orange-600' : 'bg-rose-600'}`}>
                                                    {act.activityType}
                                                </span>
                                                <p className="text-[10px] font-black text-slate-400 tracking-wider mix-blend-multiply italic">{act.date}</p>
                                            </div>
                                            <h4 className="text-base md:text-lg font-black tracking-tight text-slate-800 uppercase italic leading-tight">
                                                {act.activityType === 'Sewing' || act.activityType === 'Stone' ? `${act.worker} - ${act.design}` : act.activityType === 'Cutting' ? `Cutting: ${act.design}` : act.activityType === 'Outside' ? `${act.worker} - ${act.task}` : `${act.worker} - ${act.pataType}`}
                                            </h4>
                                            <p className="text-[11px] font-black text-slate-500 truncate max-w-[200px] md:max-w-md mix-blend-multiply uppercase tracking-wide mt-1 italic opacity-60">{act.color || act.pataStoneColors || act.note}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                                            +{act.issueBorka || act.issueHijab || act.borka || act.pataQty || act.borkaQty || 0}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mt-0.5 mix-blend-multiply">Asset</p>
                                    </div>
                                </div>
                            ))}
                            {filteredFeed.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-600 font-black italic tracking-widest uppercase">{t('noRecentActivity')} in {categoryFilter}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Insights & Alerts */}
                <div className="space-y-6">
                    {isAdmin && (masterData.adminNotes || []).length > 0 && (
                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 scale-125 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <MessageSquare size={80} />
                            </div>
                            <h3 className="text-lg font-black uppercase flex items-center gap-3 relative z-10">{t('managerNotes')}</h3>
                            <div className="space-y-4 relative z-10 max-h-[300px] overflow-y-auto no-scrollbar">
                                {(masterData.adminNotes || []).slice().reverse().map(n => (
                                    <div key={n.id} className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                                        <p className="text-sm font-semibold leading-snug">{n.text}</p>
                                        <div className="mt-3 flex justify-between items-center opacity-70">
                                            <p className="text-[10px] font-bold uppercase text-amber-400">{n.from}</p>
                                            <p className="text-[10px] font-bold">{n.date.split(',')[0]}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isManager && (
                        <div className="glass-card p-8 rounded-3xl border border-white/50 shadow-xl space-y-6">
                            <label className="bg-slate-800/80 backdrop-blur-md text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-block">{t('newNote')}</label>
                            <textarea
                                className="w-full h-32 bg-white/50 text-base font-semibold p-5 rounded-2xl border border-white outline-none placeholder:text-slate-400 text-slate-800 resize-none focus:bg-white/80 transition-colors shadow-inner"
                                placeholder={t('typeSomething')}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <button onClick={handleSendNote} className="w-full py-4 bg-black/90 backdrop-blur-sm text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-md text-xs">
                                {t('postNote')}
                            </button>
                        </div>
                    )}

                    {stats.lowStock.length > 0 && (
                        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 space-y-6 shadow-md border-b-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-500 text-white rounded-xl shadow-sm rotate-6 group-hover:rotate-0 transition-transform">
                                    <AlertCircle size={24} />
                                </div>
                                <h3 className="text-xl font-black uppercase text-slate-800 leading-none tracking-tight">{t('inventoryWarnings')}</h3>
                            </div>
                            <div className="space-y-3">
                                {stats.lowStock.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-rose-100/50 flex items-center justify-between shadow-sm">
                                        <span className="text-xs font-bold text-slate-700 uppercase">{item.name}</span>
                                        <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded pl text-[10px] font-bold shadow-sm">{t('only')} {item.qty}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setActivePanel('Stock')} className="w-full py-4 mt-2 bg-white text-rose-600 border border-rose-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-transparent transition-all">{t('resolveStock')}</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-20 border-t border-slate-50 flex justify-between items-center opacity-40">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Master Node Link Established</p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">NRZO0NE INDUSTRIAL © 2026</p>
            </div>
        </div>
    );

};

export default Overview;
// End of Overview Component
