"use client"

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { InviteMemberDialog } from '@/components/InviteMemberDialog';

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

interface InviteResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    organization: Organization;
  };
}

export default function OrganizationDetails({ params }: { params: { id: string } }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Filter and paginate members
  const membersPerPage = 5;
  const filteredMembers = useMemo(() => {
    if (!organization?.users) return [];
    
    return organization.users.filter((user: User) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
      );
    });
  }, [organization?.users, searchTerm]);

  // Get current members for pagination
  const currentMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * membersPerPage;
    return filteredMembers.slice(startIndex, startIndex + membersPerPage);
  }, [filteredMembers, currentPage]);

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const handleInviteSuccess = (data: InviteResponse) => {
    if (data?.success && data?.data?.organization) {
      setOrganization(prevOrg => {
        if (!prevOrg) return null;
        return {
          ...prevOrg,
          users: data.data.organization.users
        };
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Get the current user's ID from the token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = tokenData.id;

        // Fetch organization data
        const orgResponse = await axios.get(`http://localhost:3333/api/organizations/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        setOrganization(orgResponse.data.data);
        
        // Find the current user in the organization's users
        const currentUserInOrg = orgResponse.data.data.users.find(
          (user: User) => user.id === currentUserId
        );

        if (currentUserInOrg) {
          setCurrentUser({
            id: currentUserInOrg.id,
            role: currentUserInOrg.role
          });
        } else {
          // If user not found in organization, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError('Failed to load organization details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/dashboard" className="text-primary hover:underline flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/dashboard" className="text-primary hover:underline flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/dashboard" className="text-primary hover:underline flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Organization not found</h2>
            <p className="text-muted-foreground mb-4">The requested organization could not be found.</p>
            <Link 
              href="/dashboard" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors inline-block"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-card text-card-foreground rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{organization.name}</h1>
              <p className="text-muted-foreground mt-1">
                Created on {new Date(organization.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
              <div className="space-y-4 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Organization ID</h3>
                  <p className="mt-1">{organization.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="mt-1">
                    {new Date(organization.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-semibold">Team Members</h2>
                  {currentUser?.role === 'ADMIN' && (
                    <InviteMemberDialog 
                      organizationId={organization.id} 
                      onSuccess={handleInviteSuccess} 
                    />
                  )}
                </div>
                
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="Search members by name, email, or role..."
                    className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {currentMembers.length > 0 ? (
                  <>
                    {currentMembers.map((user: User) => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                              {currentUser?.id === user.id && ' (You)'}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    ))}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <div className="flex items-center space-x-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <button
                              key={number}
                              onClick={() => setCurrentPage(number)}
                              className={`px-3 py-1 text-sm font-medium rounded-md ${
                                currentPage === number
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-foreground hover:bg-muted'
                              }`}
                            >
                              {number}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    {searchTerm ? 'No matching members found' : 'No members found'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}