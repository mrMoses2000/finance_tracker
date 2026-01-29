import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Edit2, Trash2, CheckCircle2, Undo2, CalendarClock, ChevronLeft, ChevronRight, Move } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import deLocale from '@fullcalendar/core/locales/de';
import { AnimatePresence, motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLanguage, getCategoryLabel } from '../context/LanguageContext';
import { useBudgetMonth } from '../hooks/useBudgetMonth';
import { useCurrency } from '../context/CurrencyContext';
import { getCategoryIcon } from '../data/categoryIcons';

const hexWithAlpha = (hex, alpha = '26') => {
    if (!hex || !hex.startsWith('#') || hex.length !== 7) return hex || '#94a3b8';
    return `${hex}${alpha}`;
};

const Schedule = () => {
    const { t, lang } = useLanguage();
    const { currency, formatMoney } = useCurrency();
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const { month, setMonth } = useBudgetMonth();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const initialDate = month ? `${month}-01` : undefined;

    const toMonthLabel = (value) => {
        if (!value) return '';
        const date = new Date(`${value}-01T00:00:00Z`);
        return date.toLocaleDateString(
            lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US',
            { month: 'long', year: 'numeric' }
        );
    };

    const shiftMonth = (delta) => {
        if (!month) return;
        const [yearStr, monthStr] = month.split('-');
        const year = parseInt(yearStr, 10);
        const monthIndex = parseInt(monthStr, 10) - 1;
        const next = new Date(Date.UTC(year, monthIndex + delta, 1));
        const nextYear = next.getUTCFullYear();
        const nextMonth = String(next.getUTCMonth() + 1).padStart(2, '0');
        setMonth(`${nextYear}-${nextMonth}`);
    };

    const { data: schedule, isLoading } = useQuery({
        queryKey: ['schedule', month, statusFilter],
        queryFn: async () => {
            const statusParam = statusFilter === 'all' ? '' : `&status=${statusFilter}`;
            const res = await fetch(`/api/schedules?month=${month}${statusParam}`, { headers: { Authorization: `Bearer ${token}` } });
            return await res.json();
        }
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
            return await res.json();
        }
    });

    const invalidateDashboard = () => {
        queryClient.invalidateQueries({ queryKey: ['budgetData', month] });
    };

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }) => {
            const res = await fetch(`/api/schedules/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['schedule', month, statusFilter]);
            invalidateDashboard();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`/api/schedules/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['schedule', month, statusFilter]);
            invalidateDashboard();
        }
    });

    const handleAddNew = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    const categoryMap = useMemo(() => new Map((categories || []).map((cat) => [cat.id, cat])), [categories]);

    const events = useMemo(() => {
        return (schedule || []).map((item) => {
            const category = item.category || categoryMap.get(item.categoryId);
            const color = category?.color || '#94a3b8';
            return {
                id: String(item.id),
                title: item.title,
                start: item.dueDate,
                allDay: true,
                backgroundColor: hexWithAlpha(color, '1f'),
                borderColor: hexWithAlpha(color, '66'),
                textColor: '#e2e8f0',
                classNames: item.status === 'paid' ? ['fc-event-paid'] : ['fc-event-pending'],
                extendedProps: { ...item, category, color }
            };
        });
    }, [schedule, categoryMap]);

    const selectedItems = useMemo(() => {
        if (!selectedDate) return [];
        return (schedule || [])
            .filter((item) => new Date(item.dueDate).toISOString().split('T')[0] === selectedDate)
            .sort((a, b) => b.amountUSD - a.amountUSD);
    }, [schedule, selectedDate]);

    const renderEventContent = (eventInfo) => {
        const { amountUSD, type, category, color } = eventInfo.event.extendedProps || {};
        const Icon = getCategoryIcon(getCategoryLabel(category, t), type);
        return (
            <div className="flex items-center gap-2 truncate text-xs">
                <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: hexWithAlpha(color, '2e'), color: color }}
                >
                    <Icon size={12} />
                </span>
                <div className="flex flex-col truncate">
                    <span className="font-semibold truncate text-slate-100">{eventInfo.event.title}</span>
                    <span className={`text-[10px] ${type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {formatMoney(amountUSD, lang)}
                    </span>
                </div>
            </div>
        );
    };

    const locale = lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US';
    const calendarLocale = lang === 'ru' ? ruLocale : lang === 'de' ? deLocale : undefined;
    const selectedLabel = selectedDate
        ? new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
        : selectedDate;

    useEffect(() => {
        if (!month) return;
        const [yearStr, monthStr] = month.split('-');
        const selected = new Date(selectedDate);
        const currentYear = selected.getFullYear();
        const currentMonth = selected.getMonth() + 1;
        const targetYear = parseInt(yearStr, 10);
        const targetMonth = parseInt(monthStr, 10);
        if (currentYear !== targetYear || currentMonth !== targetMonth) {
            setSelectedDate(`${month}-01`);
        }
    }, [month, selectedDate]);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t?.schedule?.title || 'Payment Schedule'}</h1>
                    <p className="text-emerald-200 opacity-70">{t?.schedule?.subtitle || 'Upcoming obligations and recurring payments.'}</p>
                </div>
                <button onClick={handleAddNew} className="btn-primary">
                    <Plus size={18} /> {t?.schedule?.add || 'Add Schedule Item'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                    <button
                        onClick={() => shiftMonth(-1)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label={t?.month?.prev || 'Previous month'}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div className="relative">
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            aria-label={t?.month?.picker || 'Pick month'}
                        />
                        <div className="px-4 py-2 rounded-lg text-sm font-bold text-white min-w-[160px] text-center">
                            {toMonthLabel(month)}
                        </div>
                    </div>
                    <button
                        onClick={() => shiftMonth(1)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label={t?.month?.next || 'Next month'}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 rounded-xl px-3 py-2">
                    <CalendarClock size={16} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent text-slate-200 text-sm font-semibold outline-none"
                    >
                        <option value="all" className="bg-slate-900 text-white">{t?.schedule?.filters?.all || 'All'}</option>
                        <option value="pending" className="bg-slate-900 text-white">{t?.schedule?.filters?.pending || 'Pending'}</option>
                        <option value="paid" className="bg-slate-900 text-white">{t?.schedule?.filters?.paid || 'Paid'}</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 rounded-xl px-3 py-2">
                    <Move size={14} />
                    {t?.schedule?.drag_hint || 'Drag to reschedule payments'}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
                    <div className="glass-panel rounded-2xl overflow-hidden p-4">
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            height="auto"
                            headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                            dayMaxEventRows={3}
                            initialDate={initialDate}
                            key={month || 'schedule'}
                            locales={[ruLocale, deLocale]}
                            locale={calendarLocale || 'en'}
                            events={events}
                            eventContent={renderEventContent}
                            eventClick={(info) => {
                                setSelectedDate(info.event.startStr.split('T')[0]);
                            }}
                            dateClick={(info) => setSelectedDate(info.dateStr)}
                            editable={true}
                            eventStartEditable={true}
                            eventDurationEditable={false}
                            eventDrop={(info) => {
                                const id = info.event.id;
                                updateMutation.mutate({ id, payload: { dueDate: info.event.startStr } });
                            }}
                            datesSet={(info) => {
                                const current = info.view?.currentStart || info.start;
                                if (current) {
                                    const nextMonth = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
                                    if (nextMonth !== month) {
                                        setMonth(nextMonth);
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="glass-panel rounded-2xl p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-4">
                            {t?.schedule?.list_title || 'Payments for'} {selectedLabel}
                        </div>
                        <AnimatePresence mode="wait">
                            {selectedItems.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-slate-500 text-sm"
                                >
                                    {t?.schedule?.empty || 'No scheduled items for this period.'}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-3"
                                >
                                    {selectedItems.map((item) => {
                                        const category = item.category || categoryMap.get(item.categoryId);
                                        const Icon = getCategoryIcon(getCategoryLabel(category, t), item.type);
                                        return (
                                            <div
                                                key={item.id}
                                                className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-3"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                                                            style={{ backgroundColor: hexWithAlpha(category?.color || '#94a3b8', '2e'), color: category?.color || '#94a3b8' }}
                                                        >
                                                            <Icon size={16} />
                                                        </span>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-100">{item.title}</div>
                                                            <div className="text-xs text-slate-400">{getCategoryLabel(category, t) || t?.calendar?.uncategorized || 'Uncategorized'}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-sm font-bold ${item.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>
                                                        {formatMoney(item.amountUSD, lang)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 text-xs">
                                                    <span className={`px-3 py-1 rounded-full font-bold border ${item.status === 'paid' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-300 border-white/10 bg-white/5'}`}>
                                                        {item.status === 'paid' ? (t?.schedule?.filters?.paid || 'Paid') : (t?.schedule?.filters?.pending || 'Pending')}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateMutation.mutate({ id: item.id, payload: { status: item.status === 'paid' ? 'pending' : 'paid' } })}
                                                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
                                                        >
                                                            {item.status === 'paid' ? <Undo2 size={16} /> : <CheckCircle2 size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteMutation.mutate(item.id)}
                                                            className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <ScheduleModal
                    categories={categories}
                    item={editingItem}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

const ScheduleModal = ({ categories, item, onClose }) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const { t, lang } = useLanguage();
    const { currency, convert } = useCurrency();
    const isEdit = !!item;

    const formik = useFormik({
        initialValues: {
            title: item?.title || '',
            amountLocal: item?.amountUSD ? convert(item.amountUSD) : '',
            type: item?.type || 'expense',
            dueDate: item?.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            recurrence: item?.recurrence || 'once',
            status: item?.status || 'pending',
            categoryId: item?.categoryId || ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Required'),
            amountLocal: Yup.number().required('Required').positive('Must be positive')
        }),
        onSubmit: async (values) => {
            const url = isEdit ? `/api/schedules/${item.id}` : '/api/schedules';
            const method = isEdit ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    title: values.title,
                    amountLocal: values.amountLocal,
                    currency,
                    type: values.type,
                    dueDate: values.dueDate,
                    recurrence: values.recurrence,
                    status: values.status,
                    categoryId: values.categoryId
                })
            });
            queryClient.invalidateQueries(['schedule']);
            queryClient.invalidateQueries({ queryKey: ['budgetData'] });
            onClose();
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-xl rounded-2xl p-8 shadow-2xl relative">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {isEdit ? (t?.schedule?.edit || 'Edit Schedule') : (t?.schedule?.add || 'Add Schedule Item')}
                </h2>

                <form onSubmit={formik.handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.title || 'Title'}</label>
                        <input {...formik.getFieldProps('title')} className="input-field" placeholder={t?.schedule?.fields?.title_placeholder || 'Rent payment'} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                                {t?.schedule?.fields?.amount || 'Amount'} ({currency})
                            </label>
                            <input type="number" {...formik.getFieldProps('amountLocal')} className="input-field" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.due || 'Due Date'}</label>
                            <input type="date" {...formik.getFieldProps('dueDate')} className="input-field" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.type || 'Type'}</label>
                            <div className="relative">
                                <select {...formik.getFieldProps('type')} className="input-field appearance-none cursor-pointer">
                                    <option value="expense" className="bg-slate-900 text-white">{t?.transactions?.filters?.expense || 'Expense'}</option>
                                    <option value="income" className="bg-slate-900 text-white">{t?.transactions?.filters?.income || 'Income'}</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.recurrence || 'Recurrence'}</label>
                            <div className="relative">
                                <select {...formik.getFieldProps('recurrence')} className="input-field appearance-none cursor-pointer">
                                    <option value="once" className="bg-slate-900 text-white">{t?.schedule?.recurrence?.once || 'Once'}</option>
                                    <option value="monthly" className="bg-slate-900 text-white">{t?.schedule?.recurrence?.monthly || 'Monthly'}</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.status || 'Status'}</label>
                            <div className="relative">
                                <select {...formik.getFieldProps('status')} className="input-field appearance-none cursor-pointer">
                                    <option value="pending" className="bg-slate-900 text-white">{t?.schedule?.filters?.pending || 'Pending'}</option>
                                    <option value="paid" className="bg-slate-900 text-white">{t?.schedule?.filters?.paid || 'Paid'}</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.category || 'Category'}</label>
                        <div className="relative">
                            <select {...formik.getFieldProps('categoryId')} className="input-field appearance-none cursor-pointer">
                                <option value="" className="bg-slate-900 text-slate-500">{t?.schedule?.fields?.category_placeholder || 'Select Category'}</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{getCategoryLabel(cat, t)}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button type="button" onClick={onClose} className="btn-secondary w-full">{t?.schedule?.actions?.cancel || 'Cancel'}</button>
                        <button type="submit" className="btn-primary w-full">
                            {isEdit ? (t?.schedule?.actions?.save || 'Save Changes') : (t?.schedule?.actions?.add || 'Add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Schedule;
