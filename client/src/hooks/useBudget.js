import { useQuery } from '@tanstack/react-query';
import { STANDARD_DATA, FEBRUARY_DATA } from '../data/budgetData';

// Placeholder real fetch function
// In future, this will be: await fetch('http://localhost:4000/api/data').json()
const fetchBudget = async () => {
    // Simulating API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // For now, we still return the static data structures but "async" 
    // to simulate the real behavior until the entire auth flow is connected.
    return {
        standard: STANDARD_DATA,
        february: FEBRUARY_DATA
    };
};

export const useBudget = () => {
    return useQuery({
        queryKey: ['budgetData'],
        queryFn: fetchBudget,
        staleTime: 60000, // 1 minute
    });
};
