export type UserRole = "customer" | "vendor" | "admin";
export type SubscriptionPlan = "free" | "premium";
export type ServiceStatus = "pending" | "approved" | "rejected";
export type BookingStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  isBlocked: boolean;
  businessName?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: string | Date | null;
  createdAt?: string | Date;
}

export interface Service {
  _id: string;
  vendorId: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: ServiceStatus;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
  vendor?: {
    _id: string;
    name: string;
    businessName?: string;
    email: string;
    image?: string | null;
  };
}

export interface Booking {
  _id: string;
  serviceId: string;
  vendorId: string;
  customerId: string;
  eventDate: string;
  eventLocation: string;
  message?: string;
  status: BookingStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
  service?: {
    _id: string;
    serviceName: string;
    category: string;
    price: number;
    images: string[];
    location?: string;
  };
  customer?: {
    _id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  vendor?: {
    _id: string;
    name: string;
    businessName?: string;
    email: string;
    image?: string | null;
  };
}

export interface Transaction {
  _id: string;
  vendorId: string;
  plan: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  stripeSubscriptionId?: string | null;
  status: string;
  createdAt: string | Date;
  vendor?: {
    _id: string;
    name: string;
    businessName?: string;
    email: string;
  };
}

export interface CategoryItem {
  name: string;
  count: number;
}
