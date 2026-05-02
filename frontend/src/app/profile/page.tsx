"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import { usersAPI, ordersAPI } from "@/lib/api";
import type { OrderSummary } from "@/types";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Lock,
  Save,
  Package,
  ShieldCheck,
  Edit2,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/profile");
      return;
    }

    // Fetch user's orders
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getAll(0, 5);
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await usersAPI.updateProfile(profileData);
      setUser(response.data);
      success("Profile updated", "Your profile has been updated successfully");
      setIsEditingProfile(false);
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Failed to update profile";
      showError("Update failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      showError("Password mismatch", "New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 6) {
      showError("Invalid password", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await usersAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      success("Password changed", "Your password has been updated successfully");
      setIsChangingPassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Failed to change password";
      showError("Password change failed", message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          My Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and view your order history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Card */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-light rounded-lg">
                  <UserIcon className="w-5 h-5 text-brand" />
                </div>
                <h2 className="text-xl font-bold">Profile Information</h2>
              </div>
              {!isEditingProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                  leftIcon={<Edit2 className="w-4 h-4" />}
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileData({
                        name: user.name,
                        email: user.email,
                      });
                    }}
                    leftIcon={<X className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {user.is_admin && (
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium text-brand">Administrator</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-light rounded-lg">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-bold">Change Password</h2>
              </div>
            </div>

            {isChangingPassword ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label
                    htmlFor="current_password"
                    className="block text-sm font-medium mb-2"
                  >
                    Current Password
                  </label>
                  <input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current_password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="new_password"
                    className="block text-sm font-medium mb-2"
                  >
                    New Password
                  </label>
                  <input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium mb-2"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        current_password: "",
                        new_password: "",
                        confirm_password: "",
                      });
                    }}
                    leftIcon={<X className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-muted-foreground mb-4">
                  Keep your account secure by using a strong password
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setIsChangingPassword(true)}
                  leftIcon={<Lock className="w-4 h-4" />}
                >
                  Change Password
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Recent Orders */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-success-light rounded-lg">
                <Package className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-xl font-bold">Recent Orders</h2>
            </div>

            {ordersLoading ? (
              <LoadingSpinner />
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push("/products")}
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="p-4 border border-border rounded-lg hover:border-brand transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium">
                        {order.item_count} {order.item_count === 1 ? "item" : "items"}
                      </p>
                      <p className="text-sm font-bold text-brand">
                        ${order.total_price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    {order.payment_status && (
                      <span
                        className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                          order.payment_status === "paid"
                            ? "bg-success/10 text-success"
                            : order.payment_status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    )}
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => router.push("/orders")}
                >
                  View All Orders
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
