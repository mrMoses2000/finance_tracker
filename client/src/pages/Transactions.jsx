import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Plus, Calendar, Edit2, Search, Filter, Layers } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, getCategoryLabel } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useBudgetMonth } from '../hooks/useBudgetMonth';
import CategoryManager from '../components/Categories/CategoryManager';

const Transactions = () => {
    const { t, lang } = useLanguage();
    const { currency, formatMoney } = useCurrency();
    const { month } = useBudgetMonth();
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

    const format = (value) => formatMoney(value, lang);

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const res = await fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            return json.expenses || [];
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

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['transactions']);
            invalidateDashboard();
        }
    });

    const handleEdit = (item) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    const filteredTransactions = transactions?.filter(tx => {
        const categoryLabel = getCategoryLabel(tx.category, t);
        const matchesText = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            categoryLabel?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        return matchesText && matchesType;
    });

    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: 'beforeChildren',
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t?.transactions?.title || t?.nav?.transactions || 'Operations'}</h1>
                    <p className="text-emerald-200 opacity-70 text-sm sm:text-base">{t?.transactions?.subtitle || 'Manage your financial records.'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setCategoryModalOpen(true)}
                        className="btn-secondary"
                    >
                        <Layers size={18} /> {t?.category_manager?.title_short || 'Categories'}
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="btn-primary"
                    >
                        <Plus size={18} /> {t?.transactions?.add || 'Add Operation'}
                    </button>
                </div>
            </div>

            <div className="glass-panel p-3 sm:p-2 rounded-xl flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <Search className="text-slate-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder={t?.transactions?.search || 'Search by description or category...'}
                        className="bg-transparent border-none outline-none text-white w-full h-10 placeholder-slate-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-3 text-sm text-slate-400">
                    <Filter size={16} />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-transparent text-slate-200 text-sm font-semibold outline-none"
                    >
                        <option value="all" className="bg-slate-900 text-white">{t?.transactions?.filters?.all || 'All'}</option>
                        <option value="expense" className="bg-slate-900 text-white">{t?.transactions?.filters?.expense || 'Expenses'}</option>
                        <option value="income" className="bg-slate-900 text-white">{t?.transactions?.filters?.income || 'Income'}</option>
                    </select>
                </div>
            </div>

            {isLoading ? <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div> : (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[720px]">
                        <thead>
                            <tr className="border-b border-white/5 text-emerald-200/50 text-xs uppercase tracking-wider">
                                <th className="p-6 font-semibold">{t?.transactions?.fields?.date || 'Date'}</th>
                                <th className="p-6 font-semibold">{t?.transactions?.fields?.description || 'Description'}</th>
                                <th className="p-6 font-semibold">{t?.transactions?.fields?.category || 'Category'}</th>
                                <th className="p-6 font-semibold">{t?.transactions?.fields?.type || 'Type'}</th>
                                <th className="p-6 font-semibold text-right">{t?.transactions?.fields?.amount || 'Amount'}</th>
                                <th className="p-6 font-semibold text-right">{t?.transactions?.actions?.label || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody
                            className="divide-y divide-white/5"
                            // @ts-ignore
                            as={motion.tbody}
                        >
                            <AnimatePresence>
                                <motion.div
                                    className="contents"
                                    variants={listVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {filteredTransactions?.map(tx => (
                                        <motion.tr
                                            key={tx.id}
                                            variants={itemVariants}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="hover:bg-emerald-500/5 transition-colors group"
                                        >
                                            <td className="p-6 text-slate-400 text-sm font-mono">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="opacity-50" />
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-6 text-white font-medium text-base">{tx.description}</td>
                                            <td className="p-6">
                                                <span
                                                    className="px-3 py-1 rounded-full text-xs font-bold border border-current"
                                                    style={{
                                                        color: tx.category?.color,
                                                        backgroundColor: `${tx.category?.color}10`,
                                                        borderColor: `${tx.category?.color}20`
                                                    }}
                                                >
                                                    {getCategoryLabel(tx.category, t)}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tx.type === 'income' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-300 border-rose-500/30 bg-rose-500/10'}`}>
                                                    {tx.type === 'income' ? (t?.transactions?.filters?.income || 'Income') : (t?.transactions?.filters?.expense || 'Expense')}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right font-mono text-lg font-bold">
                                                <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                                                    {tx.type === 'income' ? '+' : '-'}{format(tx.amountUSD)}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(tx)}
                                                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMutation.mutate(tx.id)}
                                                        className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </tbody>
                    </table>
                    </div>
                    <div className="md:hidden p-4 space-y-3">
                        {filteredTransactions?.length === 0 && (
                            <div className="text-center text-slate-500 bg-white/5 rounded-xl p-6">
                                {t?.transactions?.empty || 'No operations found matching your search.'}
                            </div>
                        )}
                        {filteredTransactions?.map((tx) => (
                            <div key={tx.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-white font-semibold truncate">{tx.description}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                                            <Calendar size={12} className="opacity-60" />
                                            {new Date(tx.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{format(tx.amountUSD)}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-current"
                                        style={{
                                            color: tx.category?.color,
                                            backgroundColor: `${tx.category?.color}10`,
                                            borderColor: `${tx.category?.color}20`
                                        }}
                                    >
                                        {getCategoryLabel(tx.category, t)}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${tx.type === 'income' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-300 border-rose-500/30 bg-rose-500/10'}`}>
                                        {tx.type === 'income' ? (t?.transactions?.filters?.income || 'Income') : (t?.transactions?.filters?.expense || 'Expense')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(tx)}
                                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteMutation.mutate(tx.id)}
                                        className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <TransactionModal
                    categories={categories}
                    item={editingItem}
                    onClose={() => setModalOpen(false)}
                />
            )}

            {isCategoryModalOpen && (
                <CategoryManager
                    categories={categories || []}
                    mode="modal"
                    onClose={() => setCategoryModalOpen(false)}
                    title={t?.category_manager?.title || 'Manage Categories'}
                    subtitle={t?.category_manager?.subtitle || 'Add, edit, or remove categories for planning and operations.'}
                />
            )}
        </div>
    );
};

const TransactionModal = ({ categories, item, onClose }) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const { t } = useLanguage();
    const { currency, convert } = useCurrency();
    const { month } = useBudgetMonth();
    const isEdit = !!item;

    const formik = useFormik({
        initialValues: {
            amountLocal: item?.amountUSD ? convert(item.amountUSD) : '',
            description: item?.description || '',
            categoryId: item?.categoryId || '',
            date: item?.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            type: item?.type || 'expense'
        },
        validationSchema: Yup.object({
            amountLocal: Yup.number().required('Required').positive('Must be positive'),
            description: Yup.string().required('Required'),
            categoryId: Yup.string().required('Required'),
            type: Yup.string().required('Required')
        }),
        onSubmit: async (values) => {
            const url = isEdit ? `/api/expenses/${item.id}` : '/api/expenses';
            const method = isEdit ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    amountLocal: values.amountLocal,
                    currency,
                    description: values.description,
                    categoryId: values.categoryId,
                    date: values.date,
                    type: values.type
                })
            });
            queryClient.invalidateQueries(['transactions']);
            queryClient.invalidateQueries({ queryKey: ['budgetData', month] });
            onClose();
        }
    });

    const filteredCategories = categories?.filter((cat) =>
        formik.values.type === 'income' ? cat.type === 'income' : cat.type !== 'income'
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-md rounded-2xl p-5 sm:p-8 shadow-2xl relative">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
                    {isEdit ? (t?.transactions?.edit || 'Edit Operation') : (t?.transactions?.add || 'Add Operation')}
                </h2>

                <form onSubmit={formik.handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.transactions?.fields?.description || 'Description'}</label>
                        <input {...formik.getFieldProps('description')} className="input-field" placeholder={t?.transactions?.fields?.description_placeholder || 'Lunch, Taxi, etc.'} autoFocus />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.transactions?.fields?.type || 'Type'}</label>
                        <div className="relative">
                            <select {...formik.getFieldProps('type')} className="input-field appearance-none cursor-pointer">
                                <option value="expense" className="bg-slate-900 text-white">{t?.transactions?.filters?.expense || 'Expense'}</option>
                                <option value="income" className="bg-slate-900 text-white">{t?.transactions?.filters?.income || 'Income'}</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                                {t?.transactions?.fields?.amount || 'Amount'} ({currency})
                            </label>
                            <input type="number" {...formik.getFieldProps('amountLocal')} className="input-field" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.transactions?.fields?.date || 'Date'}</label>
                            <input type="date" {...formik.getFieldProps('date')} className="input-field" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">{t?.transactions?.fields?.category || 'Category'}</label>
                        <div className="relative">
                            <select {...formik.getFieldProps('categoryId')} className="input-field appearance-none cursor-pointer">
                                <option value="" className="bg-slate-900 text-slate-500">{t?.transactions?.fields?.category_placeholder || 'Select Category'}</option>
                                {filteredCategories?.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{getCategoryLabel(cat, t)}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-8">
                        <button type="button" onClick={onClose} className="btn-secondary w-full">{t?.transactions?.actions?.cancel || 'Cancel'}</button>
                        <button type="submit" className="btn-primary w-full">
                            {isEdit ? (t?.transactions?.actions?.save || 'Save Changes') : (t?.transactions?.actions?.add || 'Add Operation')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Transactions;
