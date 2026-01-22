import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2, Edit2, CalendarClock, CheckCircle2, Undo2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLanguage } from '../context/LanguageContext';
import { useBudgetMonth } from '../hooks/useBudgetMonth';

const Schedule = () => {
    const { t, lang } = useLanguage();
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const { month, setMonth } = useBudgetMonth();
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

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

    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }) => {
            const res = await fetch(`/api/schedules/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries(['schedule', month, statusFilter])
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`/api/schedules/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['schedule', month, statusFilter])
    });

    const handleAddNew = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t?.schedule?.title || 'Payment Schedule'}</h1>
                    <p className="text-indigo-200 opacity-70">{t?.schedule?.subtitle || 'Upcoming obligations and recurring payments.'}</p>
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
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
            ) : (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-indigo-200/50 text-xs uppercase tracking-wider">
                                <th className="p-6 font-semibold">{t?.schedule?.table?.date || 'Date'}</th>
                                <th className="p-6 font-semibold">{t?.schedule?.table?.title || 'Title'}</th>
                                <th className="p-6 font-semibold">{t?.schedule?.table?.type || 'Type'}</th>
                                <th className="p-6 font-semibold">{t?.schedule?.table?.amount || 'Amount'}</th>
                                <th className="p-6 font-semibold">{t?.schedule?.table?.status || 'Status'}</th>
                                <th className="p-6 font-semibold text-right">{t?.schedule?.table?.actions || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {schedule?.map((item) => (
                                <tr key={item.id} className="hover:bg-indigo-500/5 transition-colors group">
                                    <td className="p-6 text-slate-400 text-sm font-mono">
                                        {new Date(item.dueDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-6 text-white font-medium">{item.title}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.type === 'income' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-300 border-rose-500/30 bg-rose-500/10'}`}>
                                            {item.type === 'income' ? (t?.transactions?.filters?.income || 'Income') : (t?.transactions?.filters?.expense || 'Expense')}
                                        </span>
                                    </td>
                                    <td className="p-6 text-white font-mono font-bold">${item.amountUSD}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.status === 'paid' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-300 border-white/10 bg-white/5'}`}>
                                            {item.status === 'paid' ? (t?.schedule?.filters?.paid || 'Paid') : (t?.schedule?.filters?.pending || 'Pending')}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => updateMutation.mutate({ id: item.id, payload: { status: item.status === 'paid' ? 'pending' : 'paid' } })}
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
                                            >
                                                {item.status === 'paid' ? <Undo2 size={16} /> : <CheckCircle2 size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-colors"
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {schedule?.length === 0 && (
                        <div className="p-12 text-center text-slate-500 bg-white/5">
                            {t?.schedule?.empty || 'No scheduled items for this period.'}
                        </div>
                    )}
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
    const { t } = useLanguage();
    const isEdit = !!item;

    const formik = useFormik({
        initialValues: {
            title: item?.title || '',
            amountUSD: item?.amountUSD || '',
            type: item?.type || 'expense',
            dueDate: item?.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            recurrence: item?.recurrence || 'once',
            status: item?.status || 'pending',
            categoryId: item?.categoryId || ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Required'),
            amountUSD: Yup.number().required('Required').positive('Must be positive')
        }),
        onSubmit: async (values) => {
            const url = isEdit ? `/api/schedules/${item.id}` : '/api/schedules';
            const method = isEdit ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(values)
            });
            queryClient.invalidateQueries(['schedule']);
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
                        <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.title || 'Title'}</label>
                        <input {...formik.getFieldProps('title')} className="input-field" placeholder={t?.schedule?.fields?.title_placeholder || 'Rent payment'} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.amount || 'Amount ($)'}</label>
                            <input type="number" {...formik.getFieldProps('amountUSD')} className="input-field" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.due || 'Due Date'}</label>
                            <input type="date" {...formik.getFieldProps('dueDate')} className="input-field" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.type || 'Type'}</label>
                            <div className="relative">
                                <select {...formik.getFieldProps('type')} className="input-field appearance-none cursor-pointer">
                                    <option value="expense" className="bg-slate-900 text-white">{t?.transactions?.filters?.expense || 'Expense'}</option>
                                    <option value="income" className="bg-slate-900 text-white">{t?.transactions?.filters?.income || 'Income'}</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.recurrence || 'Recurrence'}</label>
                            <div className="relative">
                                <select {...formik.getFieldProps('recurrence')} className="input-field appearance-none cursor-pointer">
                                    <option value="once" className="bg-slate-900 text-white">{t?.schedule?.recurrence?.once || 'Once'}</option>
                                    <option value="monthly" className="bg-slate-900 text-white">{t?.schedule?.recurrence?.monthly || 'Monthly'}</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.status || 'Status'}</label>
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
                        <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">{t?.schedule?.fields?.category || 'Category'}</label>
                        <div className="relative">
                            <select {...formik.getFieldProps('categoryId')} className="input-field appearance-none cursor-pointer">
                                <option value="" className="bg-slate-900 text-slate-500">{t?.schedule?.fields?.category_placeholder || 'Select Category'}</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{cat.label}</option>
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
