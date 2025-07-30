"use client"
import { useState, useEffect } from 'react';
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
  const router = useRouter();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        const response = await axios.get('http://localhost:3333/api/organizations', {
          headers: {
            'Authorization': token,
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
    };

    fetchOrganization();
  }, [router, setIsLoading]);

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
      
      // Set the new organization
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
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-1.5 sm:mb-2">Members</h3>
                <div className="space-y-1">
                  {organization?.users?.length > 0 ? (
                    organization.users.map(user => (
                      <div key={user.id} className="mb-1 last:mb-0">
                        <p className="text-sm sm:text-base text-foreground">
                          {user.firstName} {user.lastName}
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            ({user.role})
                          </span>
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No members found</p>
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

        {/* Create Organization Modal */}
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