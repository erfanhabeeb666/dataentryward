import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        userType: 'WARD_MEMBER',
        assignedWardId: ''
    });

    const fetchUsers = () => {
        setLoading(true);
        api.get('/api/users')
            .then(res => {
                setUsers(res.data);
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
        fetchUsers();
        fetchWards();
    }, []);

    const handleEdit = (user) => {
        setCurrentUser(user);
        const assignedWardId = user.assignedWards && user.assignedWards.length > 0 ? user.assignedWards[0].id : '';
        setFormData({
            name: user.name,
            email: user.email,
            mobile: user.mobile || '',
            password: '',
            userType: user.userType,
            assignedWardId
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setCurrentUser(null);
        setFormData({
            name: '',
            email: '',
            mobile: '',
            password: '',
            userType: 'WARD_MEMBER',
            assignedWardId: ''
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            api.delete(`/api/users/${id}`).then(fetchUsers).catch(console.error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            userType: formData.userType,
            // Only assign ward if role requires it and ward is selected
            assignedWards: (['WARD_MEMBER', 'AGENT'].includes(formData.userType) && formData.assignedWardId)
                ? [{ id: formData.assignedWardId }]
                : []
        };

        if (formData.password) {
            payload.password = formData.password;
        }

        const promise = currentUser
            ? api.put(`/api/users/${currentUser.id}`, payload)
            : api.post('/api/users', payload);

        promise.then(() => {
            setShowModal(false);
            fetchUsers();
        }).catch(err => {
            console.error(err);
            alert('Failed to save user. ' + (err.response?.data?.message || ''));
        });
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>All User Management</h1>
                <button className="btn btn-primary" onClick={handleCreate}>Create User</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Assigned Ward</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : users.length > 0 ? (
                                users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem',
                                                background: u.userType === 'SUPER_ADMIN' ? 'var(--primary-100)' : 'var(--slate-100)',
                                                color: u.userType === 'SUPER_ADMIN' ? 'var(--primary-800)' : 'var(--slate-700)',
                                                fontWeight: '600'
                                            }}>
                                                {u.userType}
                                            </span>
                                        </td>
                                        <td>{u.assignedWards && u.assignedWards.length > 0 ? u.assignedWards[0].name : '-'}</td>
                                        <td>
                                            <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.85rem' }} onClick={() => handleEdit(u)}>Edit</button>
                                            <button className="btn btn-danger" style={{ padding: '0.2rem 0.6rem', fontSize: '0.85rem', marginLeft: '0.5rem' }} onClick={() => handleDelete(u.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <Modal
                    title={currentUser ? 'Edit User' : 'Create User'}
                    onClose={() => setShowModal(false)}
                    footer={
                        <>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
                        </>
                    }
                >
                    <form id="user-form" onSubmit={handleSubmit}>
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
                            <label className="label">Role</label>
                            <select
                                className="input"
                                value={formData.userType}
                                onChange={e => setFormData({ ...formData, userType: e.target.value })}
                            >
                                <option value="WARD_MEMBER">Ward Member</option>
                                <option value="AGENT">Agent</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
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
                        {!currentUser && (
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

                        {['WARD_MEMBER', 'AGENT'].includes(formData.userType) && (
                            <div className="input-group">
                                <label className="label">Assign Ward</label>
                                <select
                                    className="input"
                                    value={formData.assignedWardId}
                                    onChange={e => setFormData({ ...formData, assignedWardId: e.target.value })}
                                >
                                    <option value="">Select Ward (Optional)</option>
                                    {wards.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default UserManagement;
