import { useEffect, useState } from 'react';

const getCurrentMonthKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

export const useBudgetMonth = () => {
    const [month, setMonth] = useState(() => localStorage.getItem('budget_month') || getCurrentMonthKey());

    useEffect(() => {
        localStorage.setItem('budget_month', month);
    }, [month]);

    return { month, setMonth };
};
