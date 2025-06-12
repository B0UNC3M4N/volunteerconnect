import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";

import {
  Users,
  Database,
  ChartBar,
  CalendarDays,
  Settings,
  UserX,
  Eye,
  UserCog,
  Trash,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminDashboard = () => {
  const { user, loading, userRole, updateUserRole } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch users data from profiles table only (which we have access to)
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      console.log("Fetching user profiles...");

      // Only fetch from profiles table which we have access to
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw new Error(
          `Failed to fetch user profiles: ${profilesError.message}`
        );
      }

      // Return profiles with default role info
      return (profiles || []).map((profile) => ({
        ...profile,
        role: "volunteer", // Default role since we can't access auth metadata
      }));
    },
    retry: 1,
    enabled: !!user && userRole === "admin",
  });

  // Fetch opportunities data
  const {
    data: opportunities,
    isLoading: isLoadingOpportunities,
    error: opportunitiesError,
    refetch: refetchOpportunities,
  } = useQuery({
    queryKey: ["admin-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });

  // Fetch applications data
  const {
    data: applications,
    isLoading: isLoadingApplications,
    error: applicationsError,
  } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });

  // Updated user action handlers to work with limited permissions
  const handleDeleteUser = async (userId: string) => {
    try {
      // We can only delete from profiles table, not auth users
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        throw error;
      }

      toast({
        title: "User profile deleted",
        description: "The user profile has been removed from the system.",
      });

      refetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting user",
        description: error.message || "Failed to delete user profile",
      });
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", opportunityId);

      if (error) {
        throw error;
      }

      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been removed from the system.",
      });

      refetchOpportunities();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting opportunity",
        description: error.message || "Failed to delete opportunity",
      });
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    toast({
      variant: "destructive",
      title: "Feature not available",
      description:
        "Role management requires service-level permissions. Contact your system administrator.",
    });
  };

  // Check if user is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Redirect if not admin
  if (!user || userRole !== "admin") {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You do not have permission to view this page.",
    });
    return <Navigate to="/" />;
  }

  // Dashboard stats calculation
  const stats = {
    users: users?.length || 0,
    opportunities: opportunities?.length || 0,
    activeApplications:
      applications?.filter((a) => a.status === "accepted")?.length || 0,
    pendingApplications:
      applications?.filter((a) => a.status === "pending")?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-10">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <SidebarProvider>
          <div className="flex w-full">
            <Sidebar>
              <SidebarHeader>
                <div className="p-2">
                  <h2 className="text-lg font-semibold">Admin Controls</h2>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Management</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setActiveTab("users")}
                          isActive={activeTab === "users"}
                          tooltip="Users"
                        >
                          <Users />
                          <span>Users</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setActiveTab("opportunities")}
                          isActive={activeTab === "opportunities"}
                          tooltip="Opportunities"
                        >
                          <CalendarDays />
                          <span>Opportunities</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setActiveTab("applications")}
                          isActive={activeTab === "applications"}
                          tooltip="Applications"
                        >
                          <Database />
                          <span>Applications</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setActiveTab("analytics")}
                          isActive={activeTab === "analytics"}
                          tooltip="Analytics"
                        >
                          <ChartBar />
                          <span>Analytics</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setActiveTab("settings")}
                          isActive={activeTab === "settings"}
                          tooltip="Settings"
                        >
                          <Settings />
                          <span>Settings</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>

            <SidebarInset className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Total Users</CardTitle>
                    <CardDescription>Platform users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.users}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Opportunities</CardTitle>
                    <CardDescription>Total posted</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.opportunities}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Active Volunteers</CardTitle>
                    <CardDescription>Accepted applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {stats.activeApplications}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Pending</CardTitle>
                    <CardDescription>Waiting approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {stats.pendingApplications}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Content based on selected tab */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>
                        View and manage user profiles (limited permissions mode)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingUsers ? (
                        <div className="space-y-2">
                          {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : usersError ? (
                        <div className="text-center py-8">
                          <p className="text-red-500 mb-4">
                            Error loading user profiles
                          </p>
                          <p className="text-sm text-gray-600 mb-4">
                            {usersError.message ||
                              "Unable to access user data. This may be due to database permissions."}
                          </p>
                          <Button
                            onClick={() => refetchUsers()}
                            variant="outline"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : !users || users.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            No user profiles found in the system.
                          </p>
                          <p className="text-sm text-gray-400 mt-2">
                            Users may not have completed their profiles yet.
                          </p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Created At</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-mono text-xs">
                                  {user.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  {user.first_name} {user.last_name}
                                </TableCell>
                                <TableCell>
                                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    {user.role}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    user.created_at
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-1"
                                      onClick={() => setSelectedUserId(user.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      View
                                    </Button>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                        >
                                          <UserX className="h-4 w-4" />
                                          Delete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Delete user profile?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will delete the user profile
                                            from the database. Note: This will
                                            not delete the user's authentication
                                            account.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() =>
                                              handleDeleteUser(user.id)
                                            }
                                          >
                                            Delete Profile
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-1 bg-gray-50 text-gray-500"
                                      onClick={() => handleMakeAdmin(user.id)}
                                      disabled
                                    >
                                      <UserCog className="h-4 w-4" />
                                      Make Admin
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="opportunities">
                  <Card>
                    <CardHeader>
                      <CardTitle>Opportunity Management</CardTitle>
                      <CardDescription>
                        View and manage volunteer opportunities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingOpportunities ? (
                        <div className="space-y-2">
                          {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : opportunitiesError ? (
                        <p className="text-red-500">
                          Error loading opportunities data
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Organization</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {opportunities?.map((opportunity) => (
                              <TableRow key={opportunity.id}>
                                <TableCell>{opportunity.title}</TableCell>
                                <TableCell>
                                  {opportunity.organization}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    opportunity.date
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{opportunity.location}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-1"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-1"
                                    >
                                      Edit
                                    </Button>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                        >
                                          <Trash className="h-4 w-4" />
                                          Delete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Delete Opportunity?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete this
                                            opportunity and remove all
                                            associated applications.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() =>
                                              handleDeleteOpportunity(
                                                opportunity.id
                                              )
                                            }
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="applications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Management</CardTitle>
                      <CardDescription>
                        View and manage volunteer applications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingApplications ? (
                        <div className="space-y-2">
                          {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : applicationsError ? (
                        <p className="text-red-500">
                          Error loading applications data
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Opportunity</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created At</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applications?.map((application) => (
                              <TableRow key={application.id}>
                                <TableCell className="font-mono text-xs">
                                  {application.id.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {application.user_id.substring(0, 8)}...
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {application.opportunity_id.substring(0, 8)}
                                  ...
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      application.status === "accepted"
                                        ? "bg-green-100 text-green-800"
                                        : application.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {application.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    application.created_at
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Analytics</CardTitle>
                      <CardDescription>Insights and statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center h-64">
                        <p className="text-muted-foreground">
                          Analytics dashboard coming soon
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Settings</CardTitle>
                      <CardDescription>
                        Configure system settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center h-64">
                        <p className="text-muted-foreground">
                          Settings configuration coming soon
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default AdminDashboard;
