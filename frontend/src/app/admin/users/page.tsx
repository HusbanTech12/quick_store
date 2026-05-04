"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import { usersAPI } from "@/lib/api";
import type { User } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import AuthGuard from "@/components/AuthGuard";
import AdminLayout from "@/components/AdminLayout";
import {
  Users as UsersIcon,
  Search,
  ShieldCheck,
  User as UserIcon,
  Mail,
  Calendar,
  Filter,
  Trash2,
  Shield,
} from "lucide-react";

function AdminUsersContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success, error: showError } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAllUsers(0, 50);
      setUsers(response.data);
    } catch (err) {
      showError("Failed to load users", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      await usersAPI.updateUserRole(userId, !currentIsAdmin);
      success(
        "Role Updated",
        `User ${!currentIsAdmin ? "promoted to" : "removed from"} admin`
      );
      fetchUsers();
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Failed to update role";
      showError("Update Failed", message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await usersAPI.deleteUser(userId);
      success("User Deleted", `${userName} has been removed`);
      fetchUsers();
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Failed to delete user";
      showError("Delete Failed", message);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      filterRole === "all" ||
      (filterRole === "admin" && user.is_admin) ||
      (filterRole === "user" && !user.is_admin);

    return matchesSearch && matchesRole;
  });

  if (!user || !user.is_admin) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          User Management
        </h1>
        <p className="text-muted-foreground">
          View and manage user accounts
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Filter by Role</label>
            <div className="flex gap-2">
              <Button
                variant={filterRole === "all" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilterRole("all")}
              >
                All Users
              </Button>
              <Button
                variant={filterRole === "admin" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilterRole("admin")}
              >
                Admins
              </Button>
              <Button
                variant={filterRole === "user" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilterRole("user")}
              >
                Users
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredUsers.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center">
          <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            {searchQuery || filterRole !== "all"
              ? "Try adjusting your filters"
              : "No users registered yet"}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">Joined</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-brand" />
                        </div>
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          {u.id === user.id && (
                            <span className="text-xs text-muted-foreground">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-light text-brand rounded-full text-sm font-semibold">
                          <ShieldCheck className="w-4 h-4" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-semibold">
                          <UserIcon className="w-4 h-4" />
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(u.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {u.id !== user.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                              leftIcon={<Shield className="w-4 h-4" />}
                            >
                              {u.is_admin ? "Remove Admin" : "Make Admin"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              leftIcon={<Trash2 className="w-4 h-4" />}
                              className="text-error hover:text-error hover:bg-error/10"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="border-t border-border px-6 py-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredUsers.length}</span>{" "}
              {filterRole !== "all" ? filterRole : ""} users
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AuthGuard requireAuth requireAdmin>
      <AdminLayout>
        <AdminUsersContent />
      </AdminLayout>
    </AuthGuard>
  );
}
