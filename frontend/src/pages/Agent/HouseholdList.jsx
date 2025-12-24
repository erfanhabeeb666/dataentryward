import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, Search, FileDown, Eye, Edit, Trash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

const HouseholdList = () => {
    const { wardId } = useParams();
    const { user } = useAuth();
    const [households, setHouseholds] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const [showHouseholdModal, setShowHouseholdModal] = useState(false);
    const [householdForm, setHouseholdForm] = useState({
        houseNumber: '',
        fullAddress: '',
        landmark: '',
        rationCardNumber: '',
        rationCardType: 'APL',
        visitStatus: 'NOT_VISITED'
    });
    const [selectedHousehold, setSelectedHousehold] = useState(null); // For editing or viewing

    const [showViewModal, setShowViewModal] = useState(false);
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);

    const [showMemberModal, setShowMemberModal] = useState(false);
    const [memberForm, setMemberForm] = useState({
        fullName: '',
        gender: 'MALE',
        dateOfBirth: '',
        relationshipToHead: '',
        education: '',
        occupation: '',
        aadhaarNumber: '',
        mobileNumber: '',
        disabilityFlag: false,
        seniorCitizenFlag: false
    });
    const [selectedMember, setSelectedMember] = useState(null); // For editing member

    const isAgent = user.role === 'AGENT';

    useEffect(() => {
        loadData();
    }, [page, wardId]);

    const loadData = () => {
        setLoading(true);
        api.get(`/api/wards/${wardId}/households?page=${page}&size=10`)
            .then(res => {
                setHouseholds(res.data.content);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleCreateHousehold = () => {
        setSelectedHousehold(null);
        setHouseholdForm({
            houseNumber: '',
            fullAddress: '',
            landmark: '',
            rationCardNumber: '',
            rationCardType: 'APL',
            visitStatus: 'NOT_VISITED'
        });
        setShowHouseholdModal(true);
    };

    const handleEditHousehold = (h) => {
        setSelectedHousehold(h);
        setHouseholdForm({
            houseNumber: h.houseNumber,
            fullAddress: h.fullAddress,
            landmark: h.landmark || '',
            rationCardNumber: h.rationCardNumber || '',
            rationCardType: h.rationCardType || 'APL',
            visitStatus: h.visitStatus || 'NOT_VISITED'
        });
        setShowHouseholdModal(true);
    };

    const handleHouseholdSubmit = (e) => {
        e.preventDefault();
        const payload = { ...householdForm, wardId: parseInt(wardId) };
        if (selectedHousehold) {
            api.put(`/api/households/${selectedHousehold.id}`, payload).then(() => {
                setShowHouseholdModal(false);
                loadData();
            }).catch(console.error);
        } else {
            api.post(`/api/wards/${wardId}/households`, payload).then(() => {
                setShowHouseholdModal(false);
                loadData();
            }).catch(console.error);
        }
    };

    const handleViewHousehold = (h) => {
        setSelectedHousehold(h);
        setShowViewModal(true);
        fetchMembers(h.id);
    };

    const fetchMembers = (hid) => {
        setMembersLoading(true);
        api.get(`/api/households/${hid}/members`).then(res => {
            setMembers(res.data);
            setMembersLoading(false);
        }).catch(err => {
            console.error(err);
            setMembersLoading(false);
        });
    };

    const handleAddMember = () => {
        setSelectedMember(null);
        setMemberForm({
            fullName: '',
            gender: 'MALE',
            dateOfBirth: '',
            relationshipToHead: '',
            education: '',
            occupation: '',
            aadhaarNumber: '',
            mobileNumber: '',
            disabilityFlag: false,
            seniorCitizenFlag: false
        });
        setShowMemberModal(true);
    };

    const handleEditMember = (m) => {
        setSelectedMember(m);
        setMemberForm({
            fullName: m.fullName,
            gender: m.gender,
            dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split('T')[0] : '', // Adjust for date format
            relationshipToHead: m.relationshipToHead,
            education: m.education,
            occupation: m.occupation,
            aadhaarNumber: m.aadhaarNumber,
            mobileNumber: m.mobileNumber,
            disabilityFlag: m.disabilityFlag,
            seniorCitizenFlag: m.seniorCitizenFlag
        });
        setShowMemberModal(true);
    };

    const handleMemberSubmit = (e) => {
        e.preventDefault();
        const payload = { ...memberForm, householdId: selectedHousehold.id };
        if (selectedMember) {
            api.put(`/api/family-members/${selectedMember.id}`, payload).then(() => {
                setShowMemberModal(false);
                fetchMembers(selectedHousehold.id);
            }).catch(console.error);
        } else {
            api.post(`/api/households/${selectedHousehold.id}/members`, payload).then(() => {
                setShowMemberModal(false);
                fetchMembers(selectedHousehold.id);
            }).catch(console.error);
        }
    };

    const handleExport = (type) => {
        const url = `/api/wards/${wardId}/export/${type}`;
        api.get(url, { responseType: 'blob' }).then((response) => {
            const href = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = href;
            link.setAttribute('download', `ward_${wardId}_data.${type === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Household Registry</h1>
                    <p style={{ color: 'var(--slate-500)' }}>Ward ID: {wardId}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {isAgent && (
                        <button className="btn btn-primary" onClick={handleCreateHousehold}>
                            <Plus size={18} /> Add Household
                        </button>
                    )}
                    {!isAgent && (
                        <>
                            <button className="btn btn-secondary" onClick={() => handleExport('excel')}>
                                <FileDown size={18} /> Excel
                            </button>
                            <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>
                                <FileDown size={18} /> PDF
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>House No</th>
                                <th>Address</th>
                                <th>Ration Card</th>
                                <th>Visit Status</th>
                                <th>Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
                                </tr>
                            ) : households.map(h => (
                                <tr key={h.id}>
                                    <td style={{ fontWeight: 500 }}>{h.houseNumber}</td>
                                    <td>{h.fullAddress}</td>
                                    <td>
                                        <span style={{ fontSize: '0.85rem', padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' }}>
                                            {h.rationCardType}
                                        </span>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{h.rationCardNumber}</div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            background: h.visitStatus === 'VISITED' ? 'var(--primary-100)' : '#fee2e2',
                                            color: h.visitStatus === 'VISITED' ? 'var(--primary-700)' : '#b91c1c'
                                        }}>
                                            {h.visitStatus}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                                        {new Date(h.updatedAt || h.createdAt || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => handleViewHousehold(h)}>
                                            <Eye size={14} style={{ marginRight: '4px' }} /> View
                                        </button>
                                        {isAgent && (
                                            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', marginLeft: '0.5rem' }} onClick={() => handleEditHousehold(h)}>
                                                <Edit size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            </div>

            {/* Household Modal */}
            {showHouseholdModal && (
                <Modal
                    title={selectedHousehold ? 'Edit Household' : 'Add Household'}
                    onClose={() => setShowHouseholdModal(false)}
                    footer={
                        <>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowHouseholdModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleHouseholdSubmit}>Save</button>
                        </>
                    }
                >
                    <form id="household-form" onSubmit={handleHouseholdSubmit}>
                        <div className="input-group">
                            <label className="label">House Number</label>
                            <input className="input" required value={householdForm.houseNumber} onChange={e => setHouseholdForm({ ...householdForm, houseNumber: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label className="label">Full Address</label>
                            <textarea className="input" required value={householdForm.fullAddress} onChange={e => setHouseholdForm({ ...householdForm, fullAddress: e.target.value })} rows="3"></textarea>
                        </div>
                        <div className="input-group">
                            <label className="label">Landmark</label>
                            <input className="input" value={householdForm.landmark} onChange={e => setHouseholdForm({ ...householdForm, landmark: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label className="label">Ration Card Number</label>
                            <input className="input" value={householdForm.rationCardNumber} onChange={e => setHouseholdForm({ ...householdForm, rationCardNumber: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label className="label">Ration Card Type</label>
                            <select className="input" value={householdForm.rationCardType} onChange={e => setHouseholdForm({ ...householdForm, rationCardType: e.target.value })}>
                                <option value="APL">APL</option>
                                <option value="BPL">BPL</option>
                                <option value="AAY">AAY</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="label">Visit Status</label>
                            <select className="input" value={householdForm.visitStatus} onChange={e => setHouseholdForm({ ...householdForm, visitStatus: e.target.value })}>
                                <option value="NOT_VISITED">Not Visited</option>
                                <option value="VISITED">Visited</option>
                                <option value="VERIFIED">Verified</option>
                            </select>
                        </div>
                    </form>
                </Modal>
            )}

            {/* View Details Modal */}
            {showViewModal && selectedHousehold && (
                <Modal
                    title={`Details for House ${selectedHousehold.houseNumber}`}
                    onClose={() => setShowViewModal(false)}
                    size="lg"
                    footer={
                        <>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                        </>
                    }
                >
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Household Info</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><span style={{ color: 'var(--slate-500)' }}>Address:</span> {selectedHousehold.fullAddress}</div>
                            <div><span style={{ color: 'var(--slate-500)' }}>Ration Card:</span> {selectedHousehold.rationCardNumber} ({selectedHousehold.rationCardType})</div>
                            <div><span style={{ color: 'var(--slate-500)' }}>Status:</span> {selectedHousehold.visitStatus}</div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Family Members</h3>
                            {isAgent && (
                                <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.3rem 0.6rem' }} onClick={handleAddMember}>
                                    <Plus size={16} /> Add Member
                                </button>
                            )}
                        </div>

                        <div className="table-container">
                            <table style={{ fontSize: '0.9rem' }}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Relation</th>
                                        <th>Gender</th>
                                        <th>Age/DOB</th>
                                        <th>Education</th>
                                        <th>Occupation</th>
                                        <th>Flags</th>
                                        {isAgent && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {membersLoading ? (
                                        <tr><td colSpan={isAgent ? 5 : 4} style={{ textAlign: 'center' }}>Loading...</td></tr>
                                    ) : members.length > 0 ? (
                                        members.map(m => (
                                            <tr key={m.id}>
                                                <td>{m.fullName}</td>
                                                <td>{m.relationshipToHead}</td>
                                                <td>{m.gender}</td>
                                                <td>{m.dateOfBirth}</td>
                                                <td>{m.education || '-'}</td>
                                                <td>{m.occupation || '-'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {m.disabilityFlag && <span title="Person with Disability" style={{ padding: '2px 6px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.75rem' }}>PwD</span>}
                                                        {m.seniorCitizenFlag && <span title="Senior Citizen" style={{ padding: '2px 6px', background: '#fef3c7', color: '#92400e', borderRadius: '4px', fontSize: '0.75rem' }}>Sr.</span>}
                                                        {!m.disabilityFlag && !m.seniorCitizenFlag && '-'}
                                                    </div>
                                                </td>
                                                {isAgent && (
                                                    <td>
                                                        <button className="btn btn-secondary" style={{ padding: '2px 6px' }} onClick={() => handleEditMember(m)}>Edit</button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={isAgent ? 8 : 7} style={{ textAlign: 'center', color: 'var(--slate-500)' }}>No members recorded</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Member Modal */}
            {showMemberModal && (
                <Modal
                    title={selectedMember ? 'Edit Member' : 'Add Member'}
                    onClose={() => setShowMemberModal(false)}
                    footer={
                        <>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleMemberSubmit}>Save Member</button>
                        </>
                    }
                >
                    <form id="member-form" onSubmit={handleMemberSubmit}>
                        <div className="input-group">
                            <label className="label">Full Name</label>
                            <input className="input" required value={memberForm.fullName} onChange={e => setMemberForm({ ...memberForm, fullName: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="label">Gender</label>
                                <select className="input" value={memberForm.gender} onChange={e => setMemberForm({ ...memberForm, gender: e.target.value })}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="label">Date of Birth</label>
                                <input type="date" className="input" value={memberForm.dateOfBirth} onChange={e => setMemberForm({ ...memberForm, dateOfBirth: e.target.value })} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="label">Relationship to Head</label>
                            <input className="input" value={memberForm.relationshipToHead} onChange={e => setMemberForm({ ...memberForm, relationshipToHead: e.target.value })} placeholder="e.g. Head, Wife, Son" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="label">Education</label>
                                <input className="input" value={memberForm.education} onChange={e => setMemberForm({ ...memberForm, education: e.target.value })} placeholder="Degree/Standard" />
                            </div>
                            <div className="input-group">
                                <label className="label">Occupation</label>
                                <input className="input" value={memberForm.occupation} onChange={e => setMemberForm({ ...memberForm, occupation: e.target.value })} placeholder="Job/Work" />
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="label">Aadhaar Number</label>
                            <input className="input" value={memberForm.aadhaarNumber} onChange={e => setMemberForm({ ...memberForm, aadhaarNumber: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label className="label">Mobile Number</label>
                            <input className="input" value={memberForm.mobileNumber} onChange={e => setMemberForm({ ...memberForm, mobileNumber: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked={memberForm.disabilityFlag} onChange={e => setMemberForm({ ...memberForm, disabilityFlag: e.target.checked })} />
                                PwD (Person with Disability)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked={memberForm.seniorCitizenFlag} onChange={e => setMemberForm({ ...memberForm, seniorCitizenFlag: e.target.checked })} />
                                Senior Citizen
                            </label>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default HouseholdList;
