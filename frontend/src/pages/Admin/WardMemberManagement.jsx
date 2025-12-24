import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';

const WardMemberManagement = () => {
    const [members, setMembers] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentMember, setCurrentMember] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '', assignedWardId: '' });

    const fetchMembers = () => {
        setLoading(true);
        api.get('/api/users?role=WARD_MEMBER')
            .then(res => {
                setMembers(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const fetchWards = () => {
        api.get('/api/wards').then(res => setWards(res.data.content || res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchMembers();
        fetchWards();
    }, []);

    const handleEdit = (member) => {
        setCurrentMember(member);
        // Assuming member.assignedWards is an array and we pick the first one for simplicity as per requirement context
        const assignedWardId = member.assignedWards && member.assignedWards.length > 0 ? member.assignedWards[0].id : '';
        setFormData({
            name: member.name,
            email: member.email,
            mobile: member.mobile || '',
            password: '', // Don't show password
            assignedWardId
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setCurrentMember(null);
        setFormData({ name: '', email: '', mobile: '', password: '', assignedWardId: '' });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            api.delete(`/api/users/${id}`).then(fetchMembers).catch(console.error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare payload
        const payload = {
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            userType: 'WARD_MEMBER',
            // API expects assignedWards as a set/list of Ward objects
            assignedWards: formData.assignedWardId ? [{ id: formData.assignedWardId }] : []
        };

        if (formData.password) {
            payload.password = formData.password;
        }

        if (currentMember) {
            api.put(`/api/users/${currentMember.id}`, payload).then(() => {
                setShowModal(false);
                fetchMembers();
            }).catch(console.error);
        } else {
            if (!payload.password) {
                alert('Password is required for new users');
                return;
            }
            api.post('/api/users', payload).then(() => {
                setShowModal(false);
                fetchMembers();
            }).catch(console.error);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ward Member Management</h1>
                <button className="btn btn-primary" onClick={handleCreate}>Add Member</button>
            </div>

            <div className="card" style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
                <div className="table-container desktop-only">
                    <table className="card" style={{ padding: 0 }}>
                        <thead style={{ background: 'var(--slate-50)' }}>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Assigned Ward</th>
                                <th>Contact</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : members.length > 0 ? (
                                members.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.name}</td>
                                        <td>{m.email}</td>
                                        <td>{m.assignedWards && m.assignedWards.length > 0 ? m.assignedWards[0].name : 'Unassigned'}</td>
                                        <td>{m.mobile}</td>
                                        <td>
                                            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleEdit(m)}>Edit</button>
                                            <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', marginLeft: '0.5rem' }} onClick={() => handleDelete(m.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No Ward Members found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="mobile-only mobile-card-list">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                    ) : members.length > 0 ? (
                        members.map(m => (
                            <div key={m.id} className="mobile-card">
                                <div className="mobile-card-header">
                                    <span>{m.name}</span>
                                    <span style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>#{m.id}</span>
                                </div>
                                <div className="mobile-card-row">
                                    <span className="mobile-card-label">Email:</span>
                                    <span>{m.email}</span>
                                </div>
                                <div className="mobile-card-row">
                                    <span className="mobile-card-label">Ward:</span>
                                    <span>{m.assignedWards && m.assignedWards.length > 0 ? m.assignedWards[0].name : 'Unassigned'}</span>
                                </div>
                                <div className="mobile-card-row">
                                    <span className="mobile-card-label">Mobile:</span>
                                    <span>{m.mobile || '-'}</span>
                                </div>
                                <div className="mobile-card-actions">
                                    <button className="btn btn-secondary" onClick={() => handleEdit(m)}>Edit</button>
                                    <button className="btn btn-danger" onClick={() => handleDelete(m.id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>No Ward Members found</div>
                    )}
                </div>
            </div>

            {showModal && (
                <Modal
                    title={currentMember ? 'Edit Member' : 'Add Member'}
                    onClose={() => setShowModal(false)}
                    footer={
                        <>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
                        </>
                    }
                >
                    <form id="member-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="label">Name</label>
                            <input
                                type="text"
                                className="input"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Mobile</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.mobile}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>
                        {!currentMember && (
                            <div className="input-group">
                                <label className="label">Password</label>
                                <input
                                    type="password"
                                    className="input"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        )}
                        <div className="input-group">
                            <label className="label">Assign Ward</label>
                            <select
                                className="input"
                                value={formData.assignedWardId}
                                onChange={e => setFormData({ ...formData, assignedWardId: e.target.value })}
                            >
                                <option value="">Select Ward</option>
                                {wards.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default WardMemberManagement;
