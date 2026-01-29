import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useLanguage, getCategoryLabel } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useBudgetMonth } from '../../hooks/useBudgetMonth';

const COLOR_SWATCHES = [
  '#0d9488',
  '#16a34a',
  '#e11d48',
  '#f59e0b',
  '#64748b',
  '#ea580c',
  '#7c3aed',
  '#3b82f6',
  '#db2777',
  '#10b981',
  '#22c55e'
];

const CategoryManager = ({ categories = [], mode = 'inline', onClose, title, subtitle }) => {
  const { t } = useLanguage();
  const { currency, convert } = useCurrency();
  const { month } = useBudgetMonth();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    label: '',
    type: 'expense',
    color: COLOR_SWATCHES[0],
    limitLocal: ''
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    if (month) {
      queryClient.invalidateQueries({ queryKey: ['budget', month] });
      queryClient.invalidateQueries({ queryKey: ['budgetData', month] });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      label: '',
      type: 'expense',
      color: COLOR_SWATCHES[0],
      limitLocal: ''
    });
    setError('');
  };

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      return json;
    },
    onSuccess: () => {
      invalidateAll();
      resetForm();
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      return json;
    },
    onSuccess: () => {
      invalidateAll();
      resetForm();
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed');
      return json;
    },
    onSuccess: () => {
      invalidateAll();
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({
      label: category.label,
      type: category.type || 'expense',
      color: category.color || COLOR_SWATCHES[0],
      limitLocal: convert(category.limit || 0)
    });
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      label: form.label.trim(),
      type: form.type,
      color: form.color,
      limit: form.limitLocal || 0,
      currency
    };

    if (!payload.label) {
      setError(t?.category_manager?.error_required || 'Name is required');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const content = (
    <div className="glass-panel rounded-2xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">{title || t?.category_manager?.title || 'Manage Categories'}</h2>
          <p className="text-slate-400 text-sm">{subtitle || t?.category_manager?.subtitle || 'Add, edit, or remove categories for planning and operations.'}</p>
        </div>
        {mode === 'modal' && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label={t?.category_manager?.close || 'Close'}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
            {t?.category_manager?.name || 'Category name'}
          </label>
          <input
            value={form.label}
            onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
            className="input-field"
            placeholder={t?.category_manager?.name_placeholder || 'Food, Rent, Salary'}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
            {t?.category_manager?.type || 'Type'}
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            className="input-field appearance-none cursor-pointer"
          >
            <option value="expense" className="bg-slate-900 text-white">{t?.transactions?.filters?.expense || 'Expense'}</option>
            <option value="income" className="bg-slate-900 text-white">{t?.transactions?.filters?.income || 'Income'}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
            {t?.category_manager?.limit || 'Default limit'} ({currency})
          </label>
          <input
            type="number"
            value={form.limitLocal}
            onChange={(e) => setForm((prev) => ({ ...prev, limitLocal: e.target.value }))}
            className="input-field"
            placeholder="0"
            disabled={form.type === 'income'}
          />
        </div>
        <div className="md:col-span-4 flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider">{t?.category_manager?.color || 'Color'}</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
            className="w-10 h-10 rounded-full border border-white/10 bg-transparent"
          />
          <div className="flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((swatch) => (
              <button
                type="button"
                key={swatch}
                onClick={() => setForm((prev) => ({ ...prev, color: swatch }))}
                className={`w-6 h-6 rounded-full border ${form.color === swatch ? 'border-white' : 'border-white/10'}`}
                style={{ backgroundColor: swatch }}
              />
            ))}
          </div>
        </div>
        <div className="md:col-span-4 flex flex-col sm:flex-row gap-3">
          <button type="submit" className="btn-primary">
            {editingId ? <Save size={16} /> : <Plus size={16} />}
            {editingId ? (t?.category_manager?.save || 'Save') : (t?.category_manager?.add || 'Add Category')}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              {t?.category_manager?.cancel || 'Cancel'}
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-4 text-sm text-rose-300">
          {error === 'Category already exists' ? (t?.category_manager?.error_duplicate || error) : null}
          {error === 'Category is in use' ? (t?.category_manager?.error_in_use || error) : null}
          {error !== 'Category already exists' && error !== 'Category is in use' ? error : null}
        </div>
      )}

      <div className="mt-6 space-y-3 max-h-[40vh] overflow-y-auto pr-2">
        {categories.length === 0 && (
          <div className="text-sm text-slate-500">{t?.category_manager?.empty || 'No categories yet.'}</div>
        )}
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }}></span>
              </span>
              <div>
                <div className="font-semibold text-slate-100">{getCategoryLabel(category, t)}</div>
                <div className="text-xs text-slate-400">
                  {category.type === 'income' ? (t?.transactions?.filters?.income || 'Income') : (t?.transactions?.filters?.expense || 'Expense')}
                  {category.type !== 'income' && (
                    <> · {t?.category_manager?.limit || 'Default limit'}: {convert(category.limit || 0)} {currency}</>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => deleteMutation.mutate(category.id)}
                className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default CategoryManager;
