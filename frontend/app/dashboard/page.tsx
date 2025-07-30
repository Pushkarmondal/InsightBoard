"use client"
import { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [error, setError] = useState('');

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError('Organization name is required');
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create Organization
            </button>
          </div>
        </div>

        {organization && (
          <div className="bg-card text-card-foreground rounded-xl border border-border p-6 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Your Organization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Organization Details</h3>
                <p className="text-muted-foreground"><span className="font-medium">Name:</span> {organization.name}</p>
                <p className="text-muted-foreground"><span className="font-medium">Created:</span> {new Date(organization.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Members</h3>
                {organization.users.map(user => (
                  <div key={user.id} className="mb-2">
                    <p className="text-foreground">{user.firstName} {user.lastName} ({user.role})</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Organization Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card text-card-foreground border rounded-xl p-6 w-full max-w-md shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create New Organization</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                    setOrgName('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
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
                    className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Organization'}
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