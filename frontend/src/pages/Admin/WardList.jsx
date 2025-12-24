import { useEffect, useState } from 'react';
import api from '../../api/axios';

const WardList = () => {
    const [wards, setWards] = useState([]);

    useEffect(() => {
        api.get('/api/wards').then(res => setWards(res.data.content || res.data)).catch(console.error);
    }, []);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ward Management</h1>
                <button className="btn btn-primary">Create Ward</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Local Body</th>
                                <th>Target</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wards.map(w => (
                                <tr key={w.id}>
                                    <td>{w.id}</td>
                                    <td>{w.name}</td>
                                    <td>{w.localBody}</td>
                                    <td>{w.totalHouses} Houses</td>
                                    <td><button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WardList;
