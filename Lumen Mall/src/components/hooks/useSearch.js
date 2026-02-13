import { useNavigate, useSearchParams } from 'react-router-dom';

export const useSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const updateSearchURL = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    navigate({ search: newParams.toString() });
  };

  return { updateSearchURL };
};