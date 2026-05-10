import React, { useState, useEffect } from 'react';
import { Crown, Star, Shield, Zap, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createOrder, verifyPayment, getSubscriptionStatus } from '../api/payments';
import Avatar from '../components/common/Avatar';
import toast from 'react-hot-toast';

export default function ElitePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const isElite = user?.isElite || false;
  // Fallback to ELITE_MONTHLY if we know they are elite but planType is missing from backend
  const activePlan = user?.planType || (isElite ? 'ELITE_MONTHLY' : null);

  useEffect(() => {
    // 1. Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // 2. Fetch latest subscription status to get eliteUntil if missing
    if (user) {
      getSubscriptionStatus()
        .then(res => {
          if (res.data?.success && res.data.data) {
            const data = res.data.data;
            // Use functional update or ensure we have latest user
            updateUser({ 
              isElite: data.isElite, 
              eliteUntil: data.eliteUntil, 
              planType: data.planType 
            });
          }
        })
        .catch(err => console.error("Failed to fetch subscription status:", err));
    }
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSubscribe = async (planType) => {
    setLoading(true);
    try {
      // 1. Create Order
      const res = await createOrder(planType);
      const orderRes = res.data;
      
      if (!orderRes.success) throw new Error(orderRes.message);

      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "ConnectSphere Elite",
        description: `${planType === 'ELITE_MONTHLY' ? 'Monthly' : 'Yearly'} Subscription`,
        order_id: orderRes.data.orderId,
        handler: async (response) => {
          // 2. Verify Payment
          try {
            const vRes = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            const verifyRes = vRes.data;

            if (verifyRes.success) {
              toast.success("Welcome to ConnectSphere Elite!");
              // Update local user context with the actual expiry date from backend
              if (updateUser) {
                updateUser({ ...user, isElite: true, eliteUntil: verifyRes.data, planType: planType });
              }
            } else {
              toast.error(verifyRes.message);
            }
          } catch (err) {
            toast.error("Verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.fullName,
          email: user?.email
        },
        theme: {
          color: "#c47b1e"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentlyElite = user?.isElite || isElite;

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    try {
      const now = new Date();
      let expiry;
      
      // Handle Spring Boot LocalDateTime array format: [year, month, day, hour, minute, second]
      if (Array.isArray(expiryDate)) {
        expiry = new Date(expiryDate[0], expiryDate[1] - 1, expiryDate[2], 
                          expiryDate[3] || 0, expiryDate[4] || 0, expiryDate[5] || 0);
      } else if (typeof expiryDate === 'string') {
        expiry = new Date(expiryDate);
      } else {
        return null;
      }
      
      if (isNaN(expiry.getTime())) return null;
      
      const diffTime = expiry.getTime() - now.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    } catch { return null; }
  };

  const daysRemaining = getDaysRemaining(user?.eliteUntil);

  return (
    <div className="elite-page">
      <div className="elite-hero">
        <div className="elite-badge-preview">👑</div>
        <h1 className="elite-title">ConnectSphere Elite</h1>
        <p className="elite-subtitle">
          {isElite 
            ? "You are a premium member! Enjoy your golden badge and priority status." 
            : "Stand out from the crowd with premium features and a golden badge."}
        </p>
      </div>

      {isElite && (
        <div className="elite-active-card">
          <div className="active-card-content">
            <div className="active-user-info">
              <Avatar src={user?.profilePicUrl} name={user?.username} size="lg" />
              <div>
                <h3 className="m-0 flex items-center gap-2">
                  {user?.fullName || user?.username} <Crown size={18} className="text-amber" fill="currentColor" />
                </h3>
                <p className="text-sm text-muted mb-0">
                  {daysRemaining !== null 
                    ? `${daysRemaining} days remaining in your plan` 
                    : "Premium subscription active"}
                </p>
              </div>
            </div>
            <div className="active-status-badge">
              <Check size={14} /> ACTIVE MEMBERSHIP
            </div>
          </div>
          <div className="active-card-footer">
            <p className="text-xs mb-0">Your membership renews automatically. Manage billing in your account settings.</p>
          </div>
        </div>
      )}

      {!isElite && (
        <div className="elite-benefits">
          <div className="benefit-card">
            <div className="benefit-icon"><Crown size={24} /></div>
            <h3 className="benefit-name">Golden Badge</h3>
            <p className="benefit-desc">A premium golden tick next to your name everywhere on the platform.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon"><Zap size={24} /></div>
            <h3 className="benefit-name">Priority Feed</h3>
            <p className="benefit-desc">Your posts and comments get higher visibility in discovery and search.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon"><Shield size={24} /></div>
            <h3 className="benefit-name">Advanced Analytics</h3>
            <p className="benefit-desc">See exactly who visited your profile and how your posts are performing.</p>
          </div>
        </div>
      )}

      <div className="elite-pricing">
        {/* Monthly Plan */}
        <div className={`price-card ${activePlan === 'ELITE_MONTHLY' ? 'active-plan-border' : isElite ? 'disabled-plan' : ''}`}>
          <h2 className="plan-name">Elite Monthly</h2>
          <div className="plan-price">₹199<span>/mo</span></div>
          <ul className="plan-features">
            <li>Golden Verification Badge</li>
            <li>Higher Feed Visibility</li>
            <li>Ad-free Experience</li>
            <li>24/7 Priority Support</li>
          </ul>
          {activePlan === 'ELITE_MONTHLY' ? (
            <div className="active-badge-container">
              <Check size={16} className="text-success" />
              <span className="current-plan-badge">Your Active Plan</span>
            </div>
          ) : isElite ? (
            <button className="btn btn-outline btn-full" disabled>Plan Locked</button>
          ) : (
            <button 
              className="btn btn-primary btn-full btn-lg" 
              onClick={() => handleSubscribe('ELITE_MONTHLY')}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Get Monthly'}
            </button>
          )}
        </div>

        {/* Yearly Plan */}
        <div className={`price-card ${activePlan === 'ELITE_YEARLY' ? 'active-plan-border' : (activePlan === 'ELITE_MONTHLY' || (isElite && !activePlan)) ? 'disabled-plan' : 'popular'}`}>
          {(!isElite || activePlan === 'ELITE_YEARLY') && <div className="popular-badge">Best Value</div>}
          <h2 className="plan-name">Elite Yearly</h2>
          <div className="plan-price">₹1,999<span>/yr</span></div>
          <ul className="plan-features">
            <li>Everything in Monthly</li>
            <li>Exclusive Profile Themes</li>
            <li>Early Access to Features</li>
            <li>Save ₹389 per year</li>
          </ul>
          {activePlan === 'ELITE_YEARLY' ? (
            <div className="active-badge-container">
              <Check size={16} className="text-success" />
              <span className="current-plan-badge">Your Active Plan</span>
            </div>
          ) : isElite ? (
            <button className="btn btn-outline btn-full" disabled>Plan Locked</button>
          ) : (
            <button 
              className="btn btn-primary btn-full btn-lg" 
              onClick={() => handleSubscribe('ELITE_YEARLY')}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Get Yearly'}
            </button>
          )}
        </div>
      </div>

      {!isElite && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted">
            <AlertCircle size={12} className="inline mr-1" />
            Subscriptions renew automatically. You can cancel anytime in settings.
          </p>
        </div>
      )}
    </div>
  );
}
