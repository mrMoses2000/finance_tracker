import React, { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getCategoryIcon } from '../../data/categoryIcons';

const hexWithAlpha = (hex, alpha = '26') => {
    if (!hex || !hex.startsWith('#') || hex.length !== 7) return hex || '#94a3b8';
    return `${hex}${alpha}`;
};

const ExpenseCalendar = ({ calendarItems, categories, formatMoney, t, lang = 'en', variant = 'actual' }) => {
    const categoryMap = useMemo(() => new Map(categories.map((cat) => [cat.id, cat])), [categories]);
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

    const events = useMemo(() => {
        return (calendarItems || []).map((item) => {
            const category = item.category || categoryMap.get(item.categoryId);
            const color = category?.color || '#94a3b8';
            return {
                id: String(item.id || Math.random()),
                title: item.description,
                start: item.date,
                allDay: true,
                backgroundColor: hexWithAlpha(color, '1f'),
                borderColor: hexWithAlpha(color, '66'),
                textColor: '#e2e8f0',
                classNames: item.isPlanned ? ['fc-event-planned'] : ['fc-event-actual'],
                extendedProps: {
                    ...item,
                    category,
                    color
                }
            };
        });
    }, [calendarItems, categoryMap]);

    const selectedItems = useMemo(() => {
        if (!selectedDate) return [];
        return (calendarItems || [])
            .filter((item) => new Date(item.date).toISOString().split('T')[0] === selectedDate)
            .sort((a, b) => b.amountUSD - a.amountUSD);
    }, [calendarItems, selectedDate]);

    const renderEventContent = (eventInfo) => {
        const { amountUSD, type, category, color } = eventInfo.event.extendedProps || {};
        const Icon = getCategoryIcon(category?.label, type);
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
                        {formatMoney(amountUSD)}
                    </span>
                </div>
            </div>
        );
    };

    const locale = lang === 'ru' ? 'ru-RU' : lang === 'de' ? 'de-DE' : 'en-US';
    const selectedLabel = selectedDate
        ? new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
        : selectedDate;

    return (
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                    <Calendar size={22} />
                </div>
                {variant === 'plan' ? (t?.calendar?.title_plan || t?.calendar?.title || 'Payment Calendar') : (t?.calendar?.title || 'Payment Calendar')}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        height="auto"
                        headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                        dayMaxEventRows={3}
                        events={events}
                        eventContent={renderEventContent}
                        eventClick={(info) => {
                            setSelectedDate(info.event.startStr.split('T')[0]);
                        }}
                        dateClick={(info) => setSelectedDate(info.dateStr)}
                        eventDisplay="block"
                    />
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-4">
                        {t?.calendar?.list_title || 'Details for'} {selectedLabel}
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
                                {t?.calendar?.empty || 'No items for this day.'}
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
                                    const Icon = getCategoryIcon(category?.label, item.type);
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-xl p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                                    style={{ backgroundColor: hexWithAlpha(category?.color || '#94a3b8', '2e'), color: category?.color || '#94a3b8' }}
                                                >
                                                    <Icon size={16} />
                                                </span>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-100">{item.description}</div>
                                                    <div className="text-xs text-slate-400">{category?.label || t?.calendar?.uncategorized || 'Uncategorized'}</div>
                                                </div>
                                            </div>
                                            <div className={`text-sm font-bold ${item.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>
                                                {formatMoney(item.amountUSD)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ExpenseCalendar;
