import { useQuery } from '@tanstack/react-query';

const fetchBudget = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const res = await fetch('/api/data', {
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

    const json = await res.json();
    return json;
};

export const useBudget = () => {
    return useQuery({
        queryKey: ['budgetData'],
        queryFn: fetchBudget,
        retry: false,
    });
};
