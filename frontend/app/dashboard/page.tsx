"use client"
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ThemeToggle } from "@/components/ThemeToggle";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type Organization = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  users: User[];
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Filter and paginate members
  const membersPerPage = 5;
  
  const filteredMembers = useMemo(() => {
    if (!organization?.users) return [];
    
    return organization.users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const userData = {
        firstName: user.firstName?.toLowerCase() || '',
        lastName: user.lastName?.toLowerCase() || '',
        email: user.email?.toLowerCase() || '',
        role: user.role?.toLowerCase() || ''
      };
      
      return (
        userData.firstName.includes(searchLower) ||
        userData.lastName.includes(searchLower) ||
        userData.email.includes(searchLower) ||
        userData.role.includes(searchLower)
      );
    });
  }, [organization, searchTerm]);

  // Pagination
  const currentPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * membersPerPage;
    return filteredMembers.slice(startIndex, startIndex + membersPerPage);
  }, [filteredMembers, currentPage, membersPerPage]);

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
  

  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const fetchOrganization = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const response = await axios.get('http://localhost:3333/api/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.data.data) {
        setOrganization(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrganization();
    const intervalId = setInterval(fetchOrganization, 60000 * 10);
    return () => clearInterval(intervalId);
  }, [fetchOrganization]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError('Organization name is required');
      return;
    }

    setIsCreating(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3333/api/organizations',
        { name: orgName },
        {
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setOrganization(response.data.data);
      setOrgName('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating organization:', err);
      setError('Failed to create organization. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary cursor-pointer hover:bg-primary/90 text-primary-foreground text-sm sm:text-base font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors whitespace-nowrap"
            >
              Create Organization
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : organization ? (
          <div className="bg-card text-card-foreground rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Your Organization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-1.5 sm:mb-2">Organization Details</h3>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base text-muted-foreground"><span className="font-medium">Name:</span> {organization.name}</p>
                  <p className="text-sm sm:text-base text-muted-foreground"><span className="font-medium">Created:</span> {new Date(organization.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <div className="mt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h3 className="text-lg font-medium">Members ({organization?.users?.length || 0})</h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search members..."
                        className="w-full sm:w-64 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1); 
                        }}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {currentPageItems.length > 0 ? (
                      currentPageItems.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="font-medium text-gray-600 dark:text-gray-300">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            user.role === 'ADMIN' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        No members found
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">No Organization Found</h2>
              <p className="text-muted-foreground mb-6">Get started by creating your organization</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create Organization
              </button>
            </div>
          </div>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-card text-card-foreground border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full max-w-md shadow-lg rounded-lg mx-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create New Organization</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                    setOrgName('');
                  }}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                </button>
              </div>
              
              <form onSubmit={handleCreateOrg}>
                <div className="mb-4">
                  <label htmlFor="orgName" className="block text-sm font-medium text-foreground mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Enter organization name"
                    disabled={isLoading}
                  />
                  {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setError('');
                      setOrgName('');
                    }}
                    className="px-4 py-2 cursor-pointer border border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 cursor-pointer bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Organization'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;