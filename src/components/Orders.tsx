import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "./MainLayout";
import "../styles/Orders.css";

type OrderItem = {
  productId?: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
  nosPerInner?: number;
};

type Order = {
  _id: string;
  orderNumber?: string;
  createdAt?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items?: OrderItem[];
  total: number;
  paymentMethod?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  estimatedDelivery?: string;
};

const API_BASE = "http://localhost:5000";

/** Toggle to show/hide grand totals everywhere */
const SHOW_TOTAL = false;

const resolveImage = (img?: string) => {
  if (!img) return "/placeholder-product.png";
  if (img.startsWith("http")) return img;
  return `${API_BASE}/${img.replace(/^\//, "")}`;
};

const formatDate = (iso?: string, options?: Intl.DateTimeFormatOptions) => {
  if (!iso) return "-";
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };
    return new Date(iso).toLocaleDateString("en-US", defaultOptions);
  } catch {
    return iso!;
  }
};

const toInners = (it: Pick<OrderItem, "qty" | "nosPerInner">) => {
  const perInner = it.nosPerInner && it.nosPerInner > 0 ? it.nosPerInner : 12;
  return Math.ceil((it.qty || 0) / perInner);
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">(
    "all"
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) {
          setError("Please login to view your orders.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(raw);
        const { data } = await axios.get<Order[]>(
          `${API_BASE}/api/orders`,
          { params: { customerId: user._id } }
        );

        setOrders(
          Array.isArray(data)
            ? data.sort(
                (a, b) =>
                  new Date(b.createdAt || 0).getTime() -
                  new Date(a.createdAt || 0).getTime()
              )
            : []
        );
      } catch (e: any) {
        setError(
          e.response?.status === 404
            ? "No orders found"
            : "Could not fetch orders. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const StatusBadge = ({ status }: { status: Order["status"] }) => {
    const statusMap = {
      pending: { color: "#F59E0B", label: "Pending", icon: "⏳" },
      processing: { color: "#3B82F6", label: "Processing", icon: "🔄" },
      shipped: { color: "#8B5CF6", label: "Shipped", icon: "🚚" },
      delivered: { color: "#10B981", label: "Delivered", icon: "✅" },
      cancelled: { color: "#EF4444", label: "Cancelled", icon: "❌" },
    };

    return (
      <div className="status-badge-container">
        <span
          className="status-badge"
          style={{
            backgroundColor: `${statusMap[status].color}10`,
            color: statusMap[status].color,
            border: `1px solid ${statusMap[status].color}`,
          }}
        >
          <span className="status-icon">{statusMap[status].icon}</span>
          {statusMap[status].label}
        </span>
      </div>
    );
  };

  const OrderProgress = ({ status }: { status: Order["status"] }) => {
    const steps = [
      { id: "pending", label: "Order Placed" },
      { id: "processing", label: "Processing" },
      { id: "shipped", label: "Shipped" },
      { id: "delivered", label: "Delivered" },
    ];

    const currentIndex = steps.findIndex((step) => step.id === status);
    const cancelled = status === "cancelled";

    return (
      <div className={`order-progress ${cancelled ? "cancelled" : ""}`}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`progress-step ${
              index <= currentIndex ? "active" : ""
            } ${index === currentIndex ? "current" : ""}`}
          >
            <div className="step-indicator">
              {cancelled ? (
                <span>❌</span>
              ) : index < currentIndex ? (
                <span>✓</span>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="step-label">{step.label}</div>
            {index < steps.length - 1 && (
              <div
                className={`step-connector ${
                  index < currentIndex ? "active" : ""
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="orders-container">
        <div className="orders-header">
          <div className="header-content">
            <h1>Your Orders</h1>
            <p>View and manage your order history</p>
          </div>
          {orders.length > 0 && (
            <div className="orders-filter">
              <label htmlFor="status-filter">Filter by status:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as Order["status"] | "all")
                }
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">
              <svg viewBox="0 0 24 24">
                <path d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8z" />
              </svg>
            </div>
            <h3>Unable to load orders</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2M5 8V7h2v3.82C5.84 10.4 5 9.3 5 8m14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
              </svg>
            </div>
            <h3>No orders found</h3>
            <p>
              {statusFilter === "all"
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : `You don't have any ${statusFilter} orders.`}
            </p>
            <a href="/products" className="primary-button">
              Browse Products
            </a>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className={`order-card ${
                  expandedOrder === order._id ? "expanded" : ""
                }`}
              >
                <div className="order-summary" onClick={() => toggleOrder(order._id)}>
                  <div className="order-meta">
                    <div>
                      <h3>
                        Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </h3>
                      <p className="order-date">
                        Placed on {formatDate(order.createdAt)}
                        {order.estimatedDelivery && (
                          <span className="delivery-estimate">
                            • Estimated delivery: {formatDate(order.estimatedDelivery)}
                          </span>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="order-preview">
                    <div className="items-preview">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} className="item-preview">
                          <img
                            src={resolveImage(item.image)}
                            alt={item.name}
                            onError={(e) =>
                              (e.currentTarget.src = "/placeholder-product.png")
                            }
                          />
                          <span>{item.name}</span>
                          {i === 2 && order.items && order.items.length > 3 && (
                            <span className="item-quantity">
                              +{order.items.length - 3}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="order-totals">
                      <div className="order-total">
                        <span>Items:</span>
                        <strong>{order.items?.length}</strong>
                      </div>
                      <div className="order-total">
                        <span>Total Inners:</span>
                        <strong>
                          {order.items?.reduce((sum, it) => sum + toInners(it), 0)}
                        </strong>
                      </div>

                      {/* HIDE grand total in summary (top-right) */}
                      {SHOW_TOTAL && (
                        <div className="order-total amount">
                          <span>Amount:</span>
                          <strong>₹{order.total.toFixed(2)}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="expand-toggle">
                    <span>{expandedOrder === order._id ? "Show less" : "Show details"}</span>
                    <svg
                      className="expand-icon"
                      viewBox="0 0 24 24"
                      style={{
                        transform: expandedOrder === order._id ? "rotate(180deg)" : "none",
                      }}
                    >
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                    </svg>
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="order-details">
                    <OrderProgress status={order.status} />

                    <div className="details-grid">
                      <div className="items-list">
                        <h4>Order Items ({order.items?.length})</h4>
                        <div className="items-container">
                          {order.items?.map((item, i) => (
                            <div key={i} className="item-detail">
                              <div className="item-image">
                                <img
                                  src={resolveImage(item.image)}
                                  alt={item.name}
                                  onError={(e) =>
                                    (e.currentTarget.src =
                                      "/placeholder-product.png")
                                  }
                                />
                              </div>
                              <div className="item-info">
                                <h5>{item.name}</h5>
                                <div className="item-specs">
                                  <span>{item.qty} pieces</span>
                                  <span>•</span>
                                  <span>{item.nosPerInner || 12} per inner</span>
                                  <span>•</span>
                                  <span>{toInners(item)} inners</span>
                                </div>
                                {/* individual item price ok to keep; remove if not needed */}
                                <div className="item-price">₹{item.price.toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="order-summary-card">
                        <h4>Order Summary</h4>
                        <div className="summary-row">
                          <span>Order Number</span>
                          <span>
                            {order.orderNumber || order._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <div className="summary-row">
                          <span>Order Date</span>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Payment Method</span>
                          <span>{order.paymentMethod || "Not specified"}</span>
                        </div>

                        {/* HIDE grand total in right card */}
                        {SHOW_TOTAL && (
                          <>
                            <div className="summary-divider"></div>
                            <div className="summary-row total-row">
                              <span>Total Amount</span>
                              <span className="grand-total">
                                ₹{order.total.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}

                        {order.status === "shipped" && (
                          <button className="track-button">Track Package</button>
                        )}
                        {order.status === "delivered" && (
                          <button className="review-button">Leave Review</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Orders;
