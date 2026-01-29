import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2, Edit2, Landmark, Info } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

const Debts = () => {
    const { t, lang } = useLanguage();
    const { currency, formatMoney } = useCurrency();
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const format = (value) => formatMoney(value, lang);

    const { data: debts, isLoading } = useQuery({
        queryKey: ['debts'],
        queryFn: async () => {
            const res = await fetch('/api/debts', { headers: { Authorization: `Bearer ${token}` } });
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

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`/api/debts/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['debts'])
    });

    const totalOwed = debts?.filter((d) => d.type === 'debt').reduce((acc, d) => acc + d.balance, 0) || 0;
    const totalReceivable = debts?.filter((d) => d.type === 'loan').reduce((acc, d) => acc + d.balance, 0) || 0;
    const activeCount = debts?.filter((d) => d.status === 'active').length || 0;

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
                    <h1 className="text-3xl font-bold text-white mb-2">{t?.debts?.title || 'Debts & Loans'}</h1>
                    <p className="text-emerald-200 opacity-70">{t?.debts?.subtitle || 'Track obligations and incoming repayments.'}</p>
                </div>
                <button onClick={handleAddNew} className="btn-primary">
                    <Plus size={18} /> {t?.debts?.add || 'Add Obligation'}
                </button>
            </div>

            <div className="glass-panel p-4 rounded-2xl text-sm text-slate-300 flex items-start gap-3">
                <Info size={18} className="text-amber-300 mt-1" />
                <div>
                    <div className="font-semibold text-white">{t?.debts?.loan_help_title || 'What is a loan to a client?'}</div>
                    <div className="text-slate-400">{t?.debts?.loan_help || 'This is money you issued and expect to receive back. It appears on the "Receivable" side.'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title={t?.debts?.summary?.owed || 'Total Owed'}
                    value={format(totalOwed)}
                    tone="rose"
                />
                <SummaryCard
                    title={t?.debts?.summary?.receivable || 'Receivable'}
                    value={format(totalReceivable)}
                    tone="emerald"
                />
                <SummaryCard
                    title={t?.debts?.summary?.active || 'Active Items'}
                    value={activeCount}
                    tone="amber"
                    isCount
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
            ) : (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-emerald-200/50 text-xs uppercase tracking-wider">
                                <th className="p-6 font-semibold">{t?.debts?.table?.name || 'Name'}</th>
                                <th className="p-6 font-semibold">{t?.debts?.table?.type || 'Type'}</th>
                                <th className="p-6 font-semibold">{t?.debts?.table?.balance || 'Balance'}</th>
                                <th className="p-6 font-semibold">{t?.debts?.table?.next || 'Next Payment'}</th>
                                <th className="p-6 font-semibold text-right">{t?.debts?.table?.actions || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {debts?.map((debt) => (
                                <tr key={debt.id} className="hover:bg-emerald-500/5 transition-colors group">
                                    <td className="p-6 text-white font-medium">{debt.name}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${debt.type === 'loan' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-300 border-rose-500/30 bg-rose-500/10'}`}>
                                            {debt.type === 'loan' ? (t?.debts?.types?.loan || 'Loan') : (t?.debts?.types?.debt || 'Debt')}
                                        </span>
                                    </td>
                                    <td className="p-6 text-white font-mono font-bold">{format(debt.balance)}</td>
                                    <td className="p-6 text-slate-400 text-sm">
                                        {debt.nextPaymentDate ? new Date(debt.nextPaymentDate).toLocaleDateString() : (t?.debts?.table?.none || '—')}
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(debt)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteMutation.mutate(debt.id)}
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
                    {debts?.length === 0 && (
                        <div className="p-12 text-center text-slate-500 bg-white/5">
                            {t?.debts?.empty || 'No obligations yet.'}
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <DebtModal
                    categories={categories}
                    item={editingItem}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

const SummaryCard = ({ title, value, tone, isCount }) => (
    <div className="glass-card p-6">
        <div className="flex items-center justify-between">
            <div>
                <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">{title}</div>
                <div className={`text-2xl font-extrabold mt-2 ${tone === 'rose' ? 'text-rose-400' : tone === 'emerald' ? 'text-emerald-400' : tone === 'amber' ? 'text-amber-300' : 'text-slate-300'}`}>
                    {isCount ? value : value}
                </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400">
                <Landmark size={20} />
            </div>
        </div>
    </div>
);

const DebtModal = ({ categories, item, onClose }) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const { t } = useLanguage();
    const { currency, convert } = useCurrency();
    const isEdit = !!item;

    const formik = useFormik({
        initialValues: {
            name: item?.name || '',
            type: item?.type || 'debt',
            principalLocal: item?.principal ? convert(item.principal) : '',
            balanceLocal: item?.balance ? convert(item.balance) : '',
            interestRate: item?.interestRate || '',
            startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            termMonths: item?.termMonths || '',
            nextPaymentDate: item?.nextPaymentDate ? new Date(item.nextPaymentDate).toISOString().split('T')[0] : '',
            monthlyPaymentLocal: item?.monthlyPaymentUSD ? convert(item.monthlyPaymentUSD) : '',
            categoryId: item?.categoryId || ''
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Required'),
            principalLocal: Yup.number().required('Required').positive('Must be positive')
        }),
        onSubmit: async (values) => {
            const url = isEdit ? `/api/debts/${item.id}` : '/api/debts';
            const method = isEdit ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    name: values.name,
                    type: values.type,
                    principal: values.principalLocal,
                    balance: values.balanceLocal !== '' ? values.balanceLocal : undefined,
                    currency,
                    interestRate: values.interestRate,
                    startDate: values.startDate,
                    termMonths: values.termMonths,
                    nextPaymentDate: values.nextPaymentDate,
                    monthlyPayment: values.monthlyPaymentLocal !== '' ? values.monthlyPaymentLocal : undefined,
                    categoryId: values.categoryId
                })
            });
            queryClient.invalidateQueries(['debts']);
            onClose();
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-2xl rounded-2xl p-8 shadow-2xl relative">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {isEdit ? (t?.debts?.edit || 'Edit Obligation') : (t?.debts?.add || 'Add Obligation')}
                </h2>

                <form onSubmit={formik.handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.debts?.fields?.name || 'Name'}</label>
                            <input {...formik.getFieldProps('name')} className="input-field" placeholder={t?.debts?.fields?.name_placeholder || 'Kaspi Loan'} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.debts?.fields?.type || 'Type'}</label>
                            <div className="relative">
                                <select {...formik.getFieldProps('type')} className="input-field appearance-none cursor-pointer">
                                    <option value="debt" className="bg-slate-900 text-white">{t?.debts?.types?.debt || 'Debt'}</option>
                                    <option value="loan" className="bg-slate-900 text-white">{t?.debts?.types?.loan || 'Loan'}</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.debts?.fields?.principal || 'Principal'} ({currency})</label>
                            <input type="number" {...formik.getFieldProps('principalLocal')} className="input-field" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.debts?.fields?.balance || 'Balance'} ({currency})</label>
                            <input type="number" {...formik.getFieldProps('balanceLocal')} className="input-field" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.debts?.fields?.rate || 'Interest %'}</label>
                            <input type="number" {...formik.getFieldProps('interestRate')} className="input-field" placeholder="0" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.debts?.fields?.start || 'Start Date'}</label>
                            <input type="date" {...formik.getFieldProps('startDate')} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.debts?.fields?.term || 'Term (months)'}</label>
                            <input type="number" {...formik.getFieldProps('termMonths')} className="input-field" placeholder="12" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.debts?.fields?.next || 'Next Payment Date'}</label>
                            <input type="date" {...formik.getFieldProps('nextPaymentDate')} className="input-field" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.debts?.fields?.payment || 'Monthly Payment'} ({currency})</label>
                            <input type="number" {...formik.getFieldProps('monthlyPaymentLocal')} className="input-field" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.debts?.fields?.category || 'Category'}</label>
                            <div className="relative">
                                <select {...formik.getFieldProps('categoryId')} className="input-field appearance-none cursor-pointer">
                                    <option value="" className="bg-slate-900 text-slate-500">{t?.debts?.fields?.category_placeholder || 'Select Category'}</option>
                                    {categories?.map(cat => (
                                        <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{cat.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button type="button" onClick={onClose} className="btn-secondary w-full">{t?.debts?.actions?.cancel || 'Cancel'}</button>
                        <button type="submit" className="btn-primary w-full">
                            {isEdit ? (t?.debts?.actions?.save || 'Save Changes') : (t?.debts?.actions?.add || 'Add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Debts;
