import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, DollarSign, Save } from 'lucide-react';

const BudgetPlan = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');

    // Fetch Categories
    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
            return await res.json();
        }
    });

    // Update Limit Mutation
    const mutation = useMutation({
        mutationFn: async ({ id, limit }) => {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ limit })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
        }
    });

    if (isLoading) return <Loader2 className="animate-spin text-teal-500 m-8" />;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-teal-100">Budget Plan</h1>
            <p className="text-slate-400">Set monthly limits for your expense categories.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories?.map(cat => (
                    <CategoryLimitCard key={cat.id} category={cat} onSave={mutation.mutate} />
                ))}
            </div>
        </div>
    );
};

const CategoryLimitCard = ({ category, onSave }) => {
    const [limit, setLimit] = useState(category.limit);
    const [isDirty, setIsDirty] = useState(false);

    const handleSave = () => {
        onSave({ id: category.id, limit });
        setIsDirty(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: category.color }}></div>
                <h3 className="font-bold text-lg text-slate-100">{category.label}</h3>
            </div>

            <div className="relative">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block">Monthly Limit</label>
                <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-slate-500" />
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => { setLimit(e.target.value); setIsDirty(true); }}
                        className="bg-transparent text-xl font-mono font-bold text-white border-b border-white/20 focus:border-teal-500 outline-none w-full transition-colors pb-1"
                    />
                </div>
            </div>

            {isDirty && (
                <button
                    onClick={handleSave}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-teal-600/20 text-teal-300 hover:bg-teal-600/30 py-2 rounded-lg text-sm font-bold transition-all"
                >
                    <Save size={16} />
                    Save Changes
                </button>
            )}
        </div>
    );
};

export default BudgetPlan;
