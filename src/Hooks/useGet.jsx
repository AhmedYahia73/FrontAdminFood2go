import axios from "axios";
import { useAuth } from "../Context/Auth";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";

export const useGet = ({ url, params, queryKey, enabled = true, staleTime, gcTime }) => {
    const auth = useAuth();
    const token = auth?.userState?.token || '';

    // Generate a default queryKey if one is not provided
    const defaultQueryKey = [url, params];
    const finalQueryKey = queryKey || defaultQueryKey;

    const fetcher = async () => {
        const response = await axios.get(url, {
            params: params,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: finalQueryKey,
        queryFn: fetcher,
        enabled: enabled && !!token && !!url, // Run if enabled is true AND we have a token and URL
        ...(staleTime !== undefined ? { staleTime } : {}),
        ...(gcTime !== undefined ? { gcTime } : {}),
    });

    // We alias isLoading to loading to maintain backward compatibility with existing components
    return { refetch, loading: isLoading, data, error };
};

