'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  currentDay?: number;
  currentSection?: number;
  progress: number;
  completedSections: number;
  sectionProgress?: any[];
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
  mentorId?: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<string>('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', roles: ['TRAINEE'] });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    if (!user?.roles?.includes('ADMIN')) {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
    fetchMentors();
  }, [token, user, router]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRole) params.append('role', selectedRole);
      const response = await api.get(`/admin/users?${params.toString()}`);
      console.log('Admin users response:', response.data);
      const usersData = response.data.users || [];
      console.log('Users with mentors:', usersData.filter((u: any) => u.mentor || u.mentorId).map((u: any) => ({ name: u.name, mentor: u.mentor?.name, mentorId: u.mentorId })));
      setUsers(usersData);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to load users: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await api.get('/admin/mentors');
      setMentors(response.data.mentors || []);
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
    }
  };

  const toggleRole = async (userId: string, currentRoles: string[]) => {
    try {
      const isMentor = currentRoles.includes('MENTOR');
      const newRole = isMentor ? 'TRAINEE' : 'MENTOR';
      console.log('Toggling role:', { userId, newRole });
      const response = await api.post(`/admin/users/${userId}/toggle-role`, { role: newRole });
      console.log('Toggle role response:', response.data);
      await Promise.all([fetchUsers(), fetchMentors()]);
    } catch (error: any) {
      console.error('Failed to toggle role:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to toggle role';
      alert(errorMsg);
    }
  };

  const toggleActive = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-active`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle active:', error);
      alert('Failed to toggle active status');
    }
  };

  const createUser = async () => {
    try {
      if (!newUser.email || !newUser.password || !newUser.name) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await api.post('/admin/users', {
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        roles: newUser.roles,
      });

      alert('User created successfully!');
      setShowAddUserModal(false);
      setNewUser({ email: '', password: '', name: '', roles: ['TRAINEE'] });
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      alert(error.response?.data?.error || 'Failed to create user');
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone and will delete all their progress and quiz data.`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await api.delete(`/admin/users/${userId}`);
      alert('User deleted successfully!');
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const assignMentor = async () => {
    console.log('Assign mentor button clicked');
    console.log('Selected mentor:', selectedMentor);
    console.log('Selected trainees:', selectedTrainees);
    
    if (!selectedMentor || selectedTrainees.length === 0) {
      alert('Please select a mentor and at least one trainee');
      return;
    }
    
    // Check if mentor already has 2 trainees
    const selectedMentorData = mentors.find(m => m.id === selectedMentor);
    const currentMenteeCount = selectedMentorData?.menteeCount || 0;
    
    console.log('Mentor current mentee count:', currentMenteeCount);
    
    if (currentMenteeCount + selectedTrainees.length > 2) {
      alert('A mentor can have a maximum of 2 trainees. Please select fewer trainees or choose a different mentor.');
      return;
    }
    
    try {
      console.log('Calling API to assign mentor...');
      const response = await api.post('/admin/assign-mentor', {
        mentorId: selectedMentor,
        traineeIds: selectedTrainees,
      });
      console.log('Assign mentor response:', response.data);
      
      setShowAssignModal(false);
      setSelectedTrainees([]);
      setSelectedMentor('');
      
      // Refresh both users and mentors to reflect changes immediately
      console.log('Refreshing users and mentors...');
      try {
        await Promise.all([fetchUsers(), fetchMentors()]);
        console.log('Refresh complete');
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
        // Still refresh users even if mentors fails
        await fetchUsers();
      }
    } catch (error: any) {
      console.error('Failed to assign mentor:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to assign mentor';
      alert(errorMsg);
    }
  };

  useEffect(() => {
    if (!token || !user) return;
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedRole, token, user]);

  // Filter trainees: only show those without a mentor assigned
  // Use useMemo to prevent hydration issues - MUST be called before any early returns
  const trainees = useMemo(() => {
    const filtered = users.filter(u => {
      const isTrainee = u.roles.includes('TRAINEE') && !u.roles.includes('MENTOR');
      const hasNoMentor = !u.mentor && !u.mentorId; // Check both mentor object and mentorId
      return isTrainee && hasNoMentor;
    });
    console.log('Trainees available for assignment:', filtered.map((t: any) => t.name));
    console.log('Trainees with mentors (excluded):', users.filter((u: any) => {
      const isTrainee = u.roles.includes('TRAINEE') && !u.roles.includes('MENTOR');
      return isTrainee && (u.mentor || u.mentorId);
    }).map((t: any) => ({ name: t.name, mentor: t.mentor?.name || 'N/A', mentorId: t.mentorId })));
    return filtered;
  }, [users]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: '#ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '40px'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '25px 40px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '25px',
          marginBottom: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #ff006e, #8338ec, #3a86ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}>Admin Panel</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '50px',
                transition: 'all 0.3s',
                boxShadow: '0 5px 15px rgba(131, 56, 236, 0.4)'
              }}
            >Dashboard</button>
            <button
              onClick={() => setShowAddUserModal(true)}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '50px',
                transition: 'all 0.3s',
                boxShadow: '0 5px 15px rgba(16, 185, 129, 0.4)'
              }}
            >+ Add User</button>
            <button
              onClick={() => setShowAssignModal(true)}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #10b981, #3a86ff)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '50px',
                transition: 'all 0.3s',
                boxShadow: '0 5px 15px rgba(16, 185, 129, 0.4)'
              }}
            >Assign Mentor</button>
            <button
              onClick={logout}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #ff006e, #8338ec)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '50px',
                transition: 'all 0.3s',
                boxShadow: '0 5px 15px rgba(131, 56, 236, 0.4)'
              }}
            >Logout</button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '25px',
          borderRadius: '25px',
          marginBottom: '30px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '15px 20px',
              border: '2px solid #e5e7eb',
              borderRadius: '50px',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              padding: '15px 20px',
              border: '2px solid #e5e7eb',
              borderRadius: '50px',
              fontSize: '16px',
              outline: 'none',
              cursor: 'pointer',
              color: '#000',
              backgroundColor: '#fff'
            }}
          >
            <option value="" style={{ color: '#000' }}>All Roles</option>
            <option value="TRAINEE" style={{ color: '#000' }}>Trainee</option>
            <option value="MENTOR" style={{ color: '#000' }}>Mentor</option>
            <option value="ADMIN" style={{ color: '#000' }}>Admin</option>
          </select>
        </div>

        {/* Users Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '30px',
          borderRadius: '25px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 900,
            color: '#333',
            marginBottom: '25px',
            textTransform: 'uppercase'
          }}>Users ({users.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 700, color: '#333' }}>Name</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 700, color: '#333' }}>Email</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 700, color: '#333' }}>Roles</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 700, color: '#333' }}>Progress</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 700, color: '#333' }}>Quiz Scores</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 700, color: '#333' }}>Mentor</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 700, color: '#333' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 700, color: '#333' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '15px', color: '#333' }}>{u.name}</td>
                    <td style={{ padding: '15px', color: '#333' }}>{u.email}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {u.roles.map((role) => (
                          <span
                            key={role}
                            style={{
                              padding: '5px 12px',
                              background: role === 'ADMIN' ? '#ef4444' : role === 'MENTOR' ? '#3a86ff' : '#10b981',
                              color: '#fff',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >{role}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '15px', color: '#333' }}>
                      {u.progress}% ({u.completedSections}/4)
                    </td>
                    <td style={{ padding: '15px', color: '#333' }}>
                      {u.sectionProgress && u.sectionProgress.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {[1, 2, 3, 4].map((sectionNum) => {
                            const sectionProgress = u.sectionProgress?.find((p: any) => {
                              const section = p.section || p.day;
                              return section === sectionNum;
                            });
                            const quizScore = sectionProgress?.quizScore;
                            const passedQuiz = sectionProgress?.passedQuiz || (quizScore !== undefined && quizScore >= 80);
                            if (quizScore !== undefined && passedQuiz) {
                              return (
                                <span
                                  key={sectionNum}
                                  style={{
                                    padding: '3px 8px',
                                    background: '#10b981',
                                    color: '#fff',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    display: 'inline-block'
                                  }}
                                >
                                  S{sectionNum}: {quizScore}%
                                </span>
                              );
                            }
                            return null;
                          })}
                          {![1, 2, 3, 4].some((sectionNum) => {
                            const sectionProgress = u.sectionProgress?.find((p: any) => {
                              const section = p.section || p.day;
                              return section === sectionNum;
                            });
                            const quizScore = sectionProgress?.quizScore;
                            return quizScore !== undefined && quizScore >= 80;
                          }) && (
                            <span style={{ fontSize: '12px', color: '#666' }}>No quizzes passed</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#666' }}>No progress</span>
                      )}
                    </td>
                    <td style={{ padding: '15px', color: '#333' }}>
                      {u.mentor ? u.mentor.name : ''}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span
                        style={{
                          padding: '5px 12px',
                          background: u.isActive ? '#10b981' : '#ef4444',
                          color: '#fff',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {!u.roles.includes('ADMIN') && (
                          <button
                            onClick={() => toggleRole(u.id, u.roles)}
                            style={{
                              padding: '8px 16px',
                              background: u.roles.includes('MENTOR') ? '#ef4444' : '#3a86ff',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            {u.roles.includes('MENTOR') ? 'Remove Mentor' : 'Make Mentor'}
                          </button>
                        )}
                        {u.id !== user?.id && (
                          <button
                            onClick={() => toggleActive(u.id)}
                            style={{
                              padding: '8px 16px',
                              background: u.isActive ? '#ef4444' : '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {!u.roles.includes('ADMIN') && u.id !== user?.id && (
                          <button
                            onClick={() => deleteUser(u.id, u.name)}
                            disabled={deletingUserId === u.id}
                            style={{
                              padding: '8px 16px',
                              background: deletingUserId === u.id ? '#9ca3af' : '#dc2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '20px',
                              cursor: deletingUserId === u.id ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                              opacity: deletingUserId === u.id ? 0.6 : 1
                            }}
                          >
                            {deletingUserId === u.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              padding: '40px',
              borderRadius: '25px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#333',
                marginBottom: '25px',
                textTransform: 'uppercase'
              }}>Add New User</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="Enter user name"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    placeholder="Enter password"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333' }}>
                    Role *
                  </label>
                  <select
                    value={newUser.roles[0]}
                    onChange={(e) => setNewUser({ ...newUser, roles: [e.target.value] })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none',
                      cursor: 'pointer',
                      color: '#000',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="TRAINEE" style={{ color: '#000' }}>Trainee</option>
                    <option value="MENTOR" style={{ color: '#000' }}>Mentor</option>
                    <option value="ADMIN" style={{ color: '#000' }}>Admin</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button
                  onClick={createUser}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Create User
                </button>
                <button
                  onClick={() => {
                    setShowAddUserModal(false);
                    setNewUser({ email: '', password: '', name: '', roles: ['TRAINEE'] });
                  }}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: '#e5e7eb',
                    border: 'none',
                    color: '#333',
                    fontWeight: 700,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Mentor Modal */}
        {showAssignModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              padding: '40px',
              borderRadius: '25px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 900,
                marginBottom: '25px',
                color: '#333'
              }}>Assign Mentor</h2>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#333' }}>
                  Select Mentor
                </label>
                <select
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '50px',
                    fontSize: '16px',
                    outline: 'none',
                    color: '#000',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="" style={{ color: '#000' }}>Choose a mentor...</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id} style={{ color: '#000' }}>
                      {m.name} ({m.menteeCount || 0} mentees)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#333' }}>
                  Select Trainees
                </label>
                <div style={{ maxHeight: '300px', overflow: 'auto', border: '2px solid #e5e7eb', borderRadius: '15px', padding: '15px' }}>
                  {trainees.map((t) => (
                    <label
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        marginBottom: '5px',
                        background: selectedTrainees.includes(t.id) ? '#f3f4f6' : 'transparent',
                        color: '#000'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTrainees.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTrainees([...selectedTrainees, t.id]);
                          } else {
                            setSelectedTrainees(selectedTrainees.filter(id => id !== t.id));
                          }
                        }}
                        style={{ marginRight: '10px' }}
                      />
                      <span style={{ color: '#000' }}>{t.name} ({t.email})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTrainees([]);
                    setSelectedMentor('');
                  }}
                  style={{
                    padding: '12px 28px',
                    background: '#e5e7eb',
                    color: '#333',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >Cancel</button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Assign button clicked, calling assignMentor');
                    assignMentor();
                  }}
                  style={{
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #10b981, #3a86ff)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >Assign</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
