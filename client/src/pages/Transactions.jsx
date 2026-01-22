import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Plus, Calendar } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Transactions = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const [isModalOpen, setModalOpen] = useState(false);

    // Fetch Transactions
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const res = await fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            return json.expenses || [];
        }
    });

    // Fetch Categories for dropdown
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-teal-100">Transactions</h1>
                    <p className="text-slate-400">Track and manage your expenses.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-teal-900/20 transition-all"
                >
                    <Plus size={18} /> Add Expense
                </button>
            </div>

            {isLoading ? <Loader2 className="animate-spin text-teal-500 m-8" /> : (
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-slate-400 text-sm">
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Description</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold text-right">Amount</th>
                                <th className="p-4 font-semibold"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions?.map(tx => (
                                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-slate-300 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-white font-medium">{tx.description}</td>
                                    <td className="p-4">
                                        <span
                                            className="px-2 py-1 rounded text-xs font-bold"
                                            style={{ backgroundColor: `${tx.category?.color}20`, color: tx.category?.color }}
                                        >
                                            {tx.category?.label}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-slate-100">${tx.amountUSD}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => deleteMutation.mutate(tx.id)}
                                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {transactions?.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No transactions found.</div>
                    )}
                </div>
            )}

            {isModalOpen && <AddTransactionModal categories={categories} onClose={() => setModalOpen(false)} />}
        </div>
    );
};

const AddTransactionModal = ({ categories, onClose }) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');

    const formik = useFormik({
        initialValues: { amountUSD: '', description: '', categoryId: '', date: new Date().toISOString().split('T')[0] },
        validationSchema: Yup.object({
            amountUSD: Yup.number().required('Required').positive('Must be positive'),
            description: Yup.string().required('Required'),
            categoryId: Yup.string().required('Required')
        }),
        onSubmit: async (values) => {
            await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(values)
            });
            queryClient.invalidateQueries(['transactions']);
            onClose();
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                <h2 className="text-xl font-bold text-white mb-6">Add New Expense</h2>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                        <input {...formik.getFieldProps('description')} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-teal-500" placeholder="Lunch, Taxi, etc." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Amount ($)</label>
                            <input type="number" {...formik.getFieldProps('amountUSD')} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-teal-500" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                            <input type="date" {...formik.getFieldProps('date')} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-teal-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                        <select {...formik.getFieldProps('categoryId')} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-teal-500 appearance-none">
                            <option value="" className="text-slate-500">Select Category</option>
                            {categories?.map(cat => (
                                <option key={cat.id} value={cat.id} className="text-slate-900">{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2.5 rounded-lg font-medium transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-lg font-bold transition-colors">Add Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Transactions;
