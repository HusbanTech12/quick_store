"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import { authAPI } from "@/lib/api";
import type { User } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import {
  Users as UsersIcon,
  Search,
  ShieldCheck,
  User as UserIcon,
  Mail,
  Calendar,
  Filter,
} from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { error: showError } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/admin/users");
      return;
    }
    if (!user.is_admin) {
      router.push("/");
      return;
    }

    // Note: This is a placeholder. In a real app, you'd need a backend endpoint
    // to list all users (admin only). For now, we'll show a message.
    setLoading(false);
  }, [user, router]);

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

      {/* Coming Soon Notice */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-brand-light rounded-full inline-block mb-6">
            <UsersIcon className="w-16 h-16 text-brand" />
          </div>

          <h2 className="text-2xl font-bold mb-4">User Management Coming Soon</h2>

          <p className="text-muted-foreground mb-6">
            This feature is currently under development. In the meantime, you can manage users
            directly through the database or API.
          </p>

          <div className="bg-muted rounded-xl p-6 text-left mb-6">
            <h3 className="font-semibold mb-3">Available via API:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-brand">•</span>
                <span><code className="bg-background px-2 py-1 rounded">GET /users/me</code> - Get current user</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">•</span>
                <span><code className="bg-background px-2 py-1 rounded">PUT /users/me</code> - Update profile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">•</span>
                <span><code className="bg-background px-2 py-1 rounded">POST /users/me/change-password</code> - Change password</span>
              </li>
            </ul>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-warning font-semibold mb-2">
              ⚠️ To make a user an admin:
            </p>
            <p className="text-sm text-muted-foreground">
              Update the <code className="bg-background px-2 py-1 rounded">is_admin</code> field
              in the database for the user's record.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="primary"
              onClick={() => router.push("/admin")}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.open("http://localhost:8000/docs", "_blank")}
            >
              View API Docs
            </Button>
          </div>
        </div>
      </div>

      {/* Future Implementation Preview */}
      <div className="mt-8 bg-gradient-to-r from-brand/10 to-accent/10 rounded-xl p-6 border border-brand/20">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand" />
          Planned Features
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span>
            View all registered users
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span>
            Search users by name or email
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span>
            Filter by role (admin/user)
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span>
            Promote users to admin
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span>
            View user order history
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand">✓</span>
            Disable/enable user accounts
          </li>
        </ul>
      </div>
    </div>
  );
}
