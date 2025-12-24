import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const AgentManagement = () => {
    const { user } = useAuth();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wardId, setWardId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentAgent, setCurrentAgent] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '' });

    useEffect(() => {
        // Fetch ward ID first
        api.get('/api/my-wards').then(res => {
            const wards = res.data;
            if (wards && wards.length > 0) {
                setWardId(wards[0].id);
            } else {
                setLoading(false);
            }
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const fetchAgents = () => {
        if (!wardId) return;
        setLoading(true);
        api.get(`/api/wards/${wardId}/users?role=AGENT`)
            .then(res => {
                setAgents(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (wardId) {
            fetchAgents();
        }
    }, [wardId]);

    const handleEdit = (agent) => {
        setCurrentAgent(agent);
        setFormData({
            name: agent.name,
            email: agent.email,
            mobile: agent.mobile || '',
            password: ''
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setCurrentAgent(null);
        setFormData({ name: '', email: '', mobile: '', password: '' });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this agent?')) {
            api.delete(`/api/users/${id}`).then(fetchAgents).catch(console.error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!wardId) return;

        const payload = { ...formData, userType: 'AGENT' };

        if (currentAgent) {
            api.put(`/api/users/${currentAgent.id}`, payload).then(() => {
                setShowModal(false);
                fetchAgents();
            }).catch(console.error);
        } else {
            if (!payload.password) {
                alert('Password is required for new agents');
                return;
            }
            api.post(`/api/wards/${wardId}/agents`, payload).then(() => {
                setShowModal(false);
                fetchAgents();
            }).catch(console.error);
        }
    };

    if (!wardId && !loading) return <div className="fade-in">No Ward Assigned. Contact Admin.</div>;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Agent Management</h1>
                <button className="btn btn-primary" onClick={handleCreate}>Add Agent</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : agents.length > 0 ? (
                                agents.map(agent => (
                                    <tr key={agent.id}>
                                        <td>{agent.name}</td>
                                        <td>{agent.email}</td>
                                        <td>{agent.mobile || agent.phone}</td>
                                        <td>
                                            <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.85rem' }} onClick={() => handleEdit(agent)}>Edit</button>
                                            <button className="btn btn-danger" style={{ padding: '0.2rem 0.6rem', fontSize: '0.85rem', marginLeft: '0.5rem' }} onClick={() => handleDelete(agent.id)}>Remove</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No Agents found in this ward</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <Modal
                    title={currentAgent ? 'Edit Agent' : 'Add Agent'}
                    onClose={() => setShowModal(false)}
                    footer={
                        <>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
                        </>
                    }
                >
                    <form id="agent-form" onSubmit={handleSubmit}>
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
                        {!currentAgent && (
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
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AgentManagement;
