import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';

const WardList = () => {
    const [wards, setWards] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentWard, setCurrentWard] = useState(null);
    const [formData, setFormData] = useState({ name: '', localBody: '', totalHouses: 0 });

    const fetchWards = () => {
        api.get('/api/wards').then(res => setWards(res.data.content || res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchWards();
    }, []);

    const handleEdit = (ward) => {
        setCurrentWard(ward);
        setFormData({ name: ward.name, localBody: ward.localBody, totalHouses: ward.totalHouses });
        setShowModal(true);
    };

    const handleCreate = () => {
        setCurrentWard(null);
        setFormData({ name: '', localBody: '', totalHouses: 0 });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this ward?')) {
            api.delete(`/api/wards/${id}`).then(fetchWards).catch(console.error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentWard) {
            api.put(`/api/wards/${currentWard.id}`, formData).then(() => {
                setShowModal(false);
                fetchWards();
            }).catch(console.error);
        } else {
            api.post('/api/wards', formData).then(() => {
                setShowModal(false);
                fetchWards();
            }).catch(console.error);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ward Management</h1>
                <button className="btn btn-primary" onClick={handleCreate}>Create Ward</button>
            </div>

            <div className="card" style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
                <div className="table-container desktop-only">
                    <table className="card" style={{ padding: 0 }}>
                        <thead style={{ background: 'var(--slate-50)' }}>
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
                                    <td>
                                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleEdit(w)}>Edit</button>
                                        <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', marginLeft: '0.5rem' }} onClick={() => handleDelete(w.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="mobile-only mobile-card-list">
                    {wards.map(w => (
                        <div key={w.id} className="mobile-card">
                            <div className="mobile-card-header">
                                <span>{w.name}</span>
                                <span style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>#{w.id}</span>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-card-label">Local Body:</span>
                                <span>{w.localBody}</span>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-card-label">Target:</span>
                                <span>{w.totalHouses} Houses</span>
                            </div>
                            <div className="mobile-card-actions">
                                <button className="btn btn-secondary" onClick={() => handleEdit(w)}>Edit</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(w.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <Modal
                    title={currentWard ? 'Edit Ward' : 'Create Ward'}
                    onClose={() => setShowModal(false)}
                    footer={
                        <>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
                        </>
                    }
                >
                    <form id="ward-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="label">Ward Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. Ward 1 (North)"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Local Body</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. Municipality"
                                required
                                value={formData.localBody}
                                onChange={e => setFormData({ ...formData, localBody: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Target Houses</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="0"
                                required
                                value={formData.totalHouses}
                                onChange={e => setFormData({ ...formData, totalHouses: parseInt(e.target.value) })}
                            />
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default WardList;
