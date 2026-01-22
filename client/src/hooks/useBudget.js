import { useQuery } from '@tanstack/react-query';

const fetchBudget = async (month) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const res = await fetch(`/api/overview?month=${month}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        throw new Error('Failed to fetch data');
    }

    return await res.json();
};

export const useBudget = (month) => {
    return useQuery({
        queryKey: ['budgetData', month],
        queryFn: () => fetchBudget(month),
        retry: false,
        initialData: {
            month,
            transactions: [],
            categories: [],
            budget: { id: null, month, incomePlanned: 0, items: [] },
            schedule: []
        }
    });
};
