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

    // Transform backend data to match Component expectations.
    // The backend returns { expenses: [...] } with 'amountUSD', 'description', etc.
    // BudgetWeb.jsx expects { standard: [...], february: [...] }

    return {
        standard: json.expenses || [],
        february: [] // Placeholder for now
    };
};

export const useBudget = () => {
    return useQuery({
        queryKey: ['budgetData'],
        queryFn: fetchBudget,
        retry: false,
        // Provide initial data to prevent undefined errors before fetch completes
        initialData: { standard: [], february: [] }
    });
};
