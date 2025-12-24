import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const WardHouseholdsRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/my-wards')
            .then(res => {
                const wards = res.data;
                if (wards && wards.length > 0) {
                    // Navigate to the household list of the first assigned ward
                    navigate(`/ward-member/ward/${wards[0].id}/households`, { replace: true });
                } else {
                    // Fallback if no ward assigned
                    console.error("No ward assigned to this user");
                    navigate('/dashboard');
                }
            })
            .catch(err => {
                console.error("Failed to fetch wards", err);
                navigate('/dashboard');
            });
    }, [navigate]);

    return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-600)' }}>
            Loading Ward Data...
        </div>
    );
};

export default WardHouseholdsRedirect;
