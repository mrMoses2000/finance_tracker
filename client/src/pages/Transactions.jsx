import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Plus, Calendar, Edit2, Search, Filter } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Transactions = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Transactions
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const res = await fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            return json.expenses || [];
        }
    });

    // Fetch Categories
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
            return await res.json();
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['transactions'])
    });

    const handleEdit = (item) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    // Filtering
    const filteredTransactions = transactions?.filter(tx =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category?.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- ANIMATION VARIANTS (From Context7 Recs) ---
    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
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
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t?.nav?.transactions || "Transactions"}</h1>
                    <p className="text-indigo-200 opacity-70">Manage your financial records.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="btn-primary"
                >
                    <Plus size={18} /> Add Expense
                </button>
            </div>

            {/* Search Bar */}
            <div className="glass-panel p-2 rounded-xl flex items-center gap-3">
                <Search className="text-slate-400 ml-2" size={20} />
                <input
                    type="text"
                    placeholder="Search by description or category..."
                    className="bg-transparent border-none outline-none text-white w-full h-10 placeholder-slate-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div> : (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-indigo-200/50 text-xs uppercase tracking-wider">
                                <th className="p-6 font-semibold">Date</th>
                                <th className="p-6 font-semibold">Description</th>
                                <th className="p-6 font-semibold">Category</th>
                                <th className="p-6 font-semibold text-right">Amount</th>
                                <th className="p-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody
                            className="divide-y divide-white/5"
                            // @ts-ignore
                            as={motion.tbody}
                        >
                            <AnimatePresence>
                                <motion.div
                                    className="contents" // Use contents to avoid breaking table structure with a div
                                    variants={listVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {filteredTransactions?.map(tx => (
                                        <motion.tr
                                            key={tx.id}
                                            variants={itemVariants}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="hover:bg-indigo-500/5 transition-colors group"
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
                                                    {tx.category?.label}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right font-mono text-lg font-bold text-white">${tx.amountUSD}</td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(tx)}
                                                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-colors"
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
                    {filteredTransactions?.length === 0 && (
                        <div className="p-12 text-center text-slate-500 bg-white/5">
                            No transactions found matching your search.
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <TransactionModal
                    categories={categories}
                    item={editingItem}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

const TransactionModal = ({ categories, item, onClose }) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const isEdit = !!item;

    const formik = useFormik({
        initialValues: {
            amountUSD: item?.amountUSD || '',
            description: item?.description || '',
            categoryId: item?.categoryId || '',
            date: item?.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        },
        validationSchema: Yup.object({
            amountUSD: Yup.number().required('Required').positive('Must be positive'),
            description: Yup.string().required('Required'),
            categoryId: Yup.string().required('Required')
        }),
        onSubmit: async (values) => {
            const url = isEdit ? `/api/expenses/${item.id}` : '/api/expenses';
            const method = isEdit ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(values)
            });
            queryClient.invalidateQueries(['transactions']);
            onClose();
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {isEdit ? 'Edit Expense' : 'Add New Expense'}
                </h2>

                <form onSubmit={formik.handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Description</label>
                        <input {...formik.getFieldProps('description')} className="input-field" placeholder="Lunch, Taxi, etc." autoFocus />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Amount ($)</label>
                            <input type="number" {...formik.getFieldProps('amountUSD')} className="input-field" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Date</label>
                            <input type="date" {...formik.getFieldProps('date')} className="input-field" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Category</label>
                        <div className="relative">
                            <select {...formik.getFieldProps('categoryId')} className="input-field appearance-none cursor-pointer">
                                <option value="" className="bg-slate-900 text-slate-500">Select Category</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{cat.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button type="button" onClick={onClose} className="btn-secondary w-full">Cancel</button>
                        <button type="submit" className="btn-primary w-full">
                            {isEdit ? 'Save Changes' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Transactions;
