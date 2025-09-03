import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Mail,
  Shield,
  Star,
  Zap,
  Crown,
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../components/ui/modals/Modal';
import { useAuth } from '../../../../app/providers/AuthContext';
import { sendOwnerNotification } from '../../../../lib/utils/notificationService';

const AdminSubscription = () => {
  const { user, updateUserSubscription } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [verificationStep, setVerificationStep] = useState('payment-method'); // payment-method, details, verification, processing
  const [verificationCode, setVerificationCode] = useState('');
  const [sentVerificationCode, setSentVerificationCode] = useState('');
  const [verificationMedium, setVerificationMedium] = useState(''); // email or sms

  // Payment methods configuration
  const paymentMethods = {
    creditCard: {
      name: 'Credit Card',
      icon: CreditCard,
      color: 'blue',
      requiresVerification: true,
      verificationMedium: 'email',
      fields: [
        { name: 'cardNumber', label: 'Card Number', type: 'text', placeholder: '1234 5678 9012 3456', required: true },
        { name: 'cardholderName', label: 'Cardholder Name', type: 'text', placeholder: 'John Doe', required: true },
        { name: 'expiryDate', label: 'Expiry Date', type: 'text', placeholder: 'MM/YY', required: true },
        { name: 'cvv', label: 'CVV', type: 'password', placeholder: '123', required: true }
      ]
    },
    bankTransfer: {
      name: 'Bank Transfer',
      icon: DollarSign,
      color: 'green',
      requiresVerification: true,
      verificationMedium: 'sms',
      fields: [
        { name: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '1234567890', required: true },
        { name: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Bank of America', required: true },
        { name: 'routingNumber', label: 'Routing Number', type: 'text', placeholder: '021000021', required: true }
      ]
    },
    paypal: {
      name: 'PayPal',
      icon: Mail,
      color: 'purple',
      requiresVerification: true,
      verificationMedium: 'email',
      fields: [
        { name: 'paypalEmail', label: 'PayPal Email', type: 'email', placeholder: 'user@paypal.com', required: true }
      ]
    },
    mobileMoney: {
      name: 'Mobile Money',
      icon: CreditCard,
      color: 'orange',
      requiresVerification: true,
      verificationMedium: 'sms',
      fields: [
        { name: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: '+1234567890', required: true },
        { name: 'provider', label: 'Provider', type: 'select', options: ['M-Pesa', 'Airtel Money', 'MTN Mobile Money'], required: true }
      ]
    }
  };

  // Subscription plans configuration
  const [subscriptionPlans, setSubscriptionPlans] = useState({
    premium: {
      name: 'Premium',
      icon: Star,
      price: {
        weekly: 19.99,
        monthly: 59.99,
        annually: 599.99
      },
      features: [
        'Full access to all app services',
        'Complete sales management',
        'Unlimited inventory management',
        'Unlimited customer database',
        'Advanced analytics & reporting',
        'Receipt customization',
        'Low stock alerts',
        'Multi-location support',
        'Advanced user management',
        'API access',
        'Dedicated support',
        'Custom integrations',
        'White-label options',
        'Advanced security features'
      ],
      color: 'purple'
    }
  });

  useEffect(() => {
    loadCurrentSubscription();
    loadOwnerPricing();
  }, []);

    const loadCurrentSubscription = () => {
    try {
      setLoading(true);
              // Get current user's subscription data
        const subscription = user?.subscription || {
          plan: 'premium',
          status: 'trial',
          amount: 0,
          startDate: user?.createdAt || new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          billingCycle: 'monthly',
          autoRenew: false,
          paymentHistory: []
        };

        setCurrentSubscription(subscription);
        console.log('✅ Loaded current subscription:', subscription);
      } catch (error) {
        console.error('❌ Error loading subscription:', error);
        toast.error('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

  const loadOwnerPricing = () => {
    try {
      const savedPricing = localStorage.getItem('tracknest_pricing_config');
      if (savedPricing) {
        const ownerPricing = JSON.parse(savedPricing);
        console.log('✅ Loaded owner pricing configuration:', ownerPricing);
        
        // Update subscription plans with owner's pricing
        setSubscriptionPlans(prevPlans => {
          const updatedPlans = { ...prevPlans };
          Object.keys(ownerPricing).forEach(planKey => {
            if (updatedPlans[planKey]) {
              updatedPlans[planKey] = {
                ...updatedPlans[planKey],
                price: ownerPricing[planKey]
              };
            }
          });
          return updatedPlans;
        });
      } else {
        console.log('ℹ️ No owner pricing configuration found, using default prices');
      }
    } catch (error) {
      console.error('❌ Error loading owner pricing:', error);
    }
  };

     const getPlanColor = (plan) => {
     switch (plan) {
       case 'premium': return 'text-purple-600 bg-purple-100';
       default: return 'text-gray-600 bg-gray-100';
     }
   };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'trial': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleUpgradeSubscription = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    console.log('🔄 Starting payment process...', {
      plan: selectedPlan,
      billingCycle: selectedBillingCycle,
      amount: subscriptionPlans[selectedPlan].price[selectedBillingCycle]
    });

    // Reset payment flow state
    setVerificationStep('payment-method');
    setSelectedPaymentMethod(null);
    setPaymentDetails({});
    setVerificationCode('');
    setSentVerificationCode('');
    setVerificationMedium('');
    
    // Show payment modal
    setShowPaymentModal(true);
    setShowUpgradeModal(false);
  };

  const getEndDate = (billingCycle) => {
    const now = new Date();
    switch (billingCycle) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'annually':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const getNextPaymentDate = (billingCycle) => {
    const now = new Date();
    switch (billingCycle) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'annually':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  // Payment flow functions
  const selectPaymentMethod = (methodKey) => {
    setSelectedPaymentMethod(methodKey);
    setVerificationStep('details');
    setVerificationMedium(paymentMethods[methodKey].verificationMedium);
  };

  const handlePaymentDetailsSubmit = async () => {
    try {
      setProcessing(true);
      
      // Validate required fields
      const method = paymentMethods[selectedPaymentMethod];
      const missingFields = method.fields.filter(field => 
        field.required && !paymentDetails[field.name]
      );
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.map(f => f.label).join(', ')}`);
        return;
      }

      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentVerificationCode(code);
      
      // Simulate sending verification code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show verification step
      setVerificationStep('verification');
      
      toast.success(`Verification code sent to your ${verificationMedium === 'email' ? 'email' : 'phone'}`);
      
    } catch (error) {
      console.error('❌ Error submitting payment details:', error);
      toast.error('Failed to submit payment details');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (verificationCode !== sentVerificationCode) {
      toast.error('Invalid verification code');
      return;
    }

    try {
      setProcessing(true);
      setVerificationStep('processing');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get owner's payment configuration
      const ownerPaymentConfig = JSON.parse(localStorage.getItem('tracknest_payment_config') || '{}');
      
      // Create new subscription data
      const newSubscription = {
        plan: selectedPlan,
        status: 'active',
        amount: subscriptionPlans[selectedPlan].price[selectedBillingCycle],
        startDate: new Date().toISOString(),
        endDate: getEndDate(selectedBillingCycle),
        billingCycle: selectedBillingCycle,
        autoRenew: true,
        paymentMethod: paymentMethods[selectedPaymentMethod].name,
        lastPayment: new Date().toISOString(),
        nextPayment: getNextPaymentDate(selectedBillingCycle),
        paymentHistory: [
          ...(currentSubscription.paymentHistory || []),
          {
            amount: subscriptionPlans[selectedPlan].price[selectedBillingCycle],
            date: new Date().toISOString(),
            status: 'completed',
            method: paymentMethods[selectedPaymentMethod].name,
            paymentDetails: paymentDetails,
            ownerPaymentConfig: ownerPaymentConfig
          }
        ],
        // Add payment destination info
        paymentDestination: {
          method: selectedPaymentMethod,
          ownerConfig: ownerPaymentConfig[selectedPaymentMethod] || {},
          adminPaymentDetails: paymentDetails
        }
      };

      // Update user subscription in AuthContext
      await updateUserSubscription(user.username, newSubscription);
      
      // Update local state
      setCurrentSubscription(newSubscription);
      
      // Send notification to owner with payment details
      await sendOwnerNotification(newSubscription, user);
      
      // Close modals and reset state
      setShowPaymentModal(false);
      setShowUpgradeModal(false);
      setSelectedPlan(null);
      setSelectedBillingCycle('monthly');
      setVerificationStep('payment-method');
      setSelectedPaymentMethod(null);
      setPaymentDetails({});
      setVerificationCode('');
      setSentVerificationCode('');
      setVerificationMedium('');
      
      toast.success('Payment processed successfully! You now have full access to all app services.');
      
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const resetPaymentFlow = () => {
    setShowPaymentModal(false);
    setVerificationStep('payment-method');
    setSelectedPaymentMethod(null);
    setPaymentDetails({});
    setVerificationCode('');
    setSentVerificationCode('');
    setVerificationMedium('');
  };



  const cancelSubscription = async () => {
    try {
      setProcessing(true);
      
      // Update subscription status
      const updatedSubscription = {
        ...currentSubscription,
        status: 'cancelled',
        autoRenew: false
      };

      setCurrentSubscription(updatedSubscription);
      
      // Update user subscription
      await updateUserSubscription(user.username, updatedSubscription);
      
      toast.success('Subscription cancelled successfully');
      
    } catch (error) {
      console.error('❌ Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription plan and billing preferences</p>
        </div>

        {/* Current Subscription Status */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Plan</span>
                </div>
                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(currentSubscription.plan)}`}>
                   {subscriptionPlans[currentSubscription.plan]?.name || 'Premium'}
                 </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-gray-900">Status</span>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(currentSubscription.status)}`}>
                  {currentSubscription.status}
                </span>
                {currentSubscription.status === 'trial' && (
                  <div className="text-xs text-gray-500 mt-1">
                    {getDaysRemaining(currentSubscription.endDate)} days remaining
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-gray-900">Amount</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(currentSubscription.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {currentSubscription.billingCycle} billing
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
                <p className="text-sm text-gray-600">
                  Next payment: {formatDate(currentSubscription.nextPayment)}
                </p>
              </div>
              <div className="flex space-x-3">
                {currentSubscription.status === 'trial' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </button>
                )}
                {currentSubscription.status === 'active' && (
                  <button
                    onClick={cancelSubscription}
                    disabled={processing}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

                 {/* Available Plans */}
         <div className="mb-6">
           <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
             <div className="flex items-center">
               <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
               <div>
                 <p className="text-sm font-medium text-green-800">
                   All Plans Include Full Access
                 </p>
                 <p className="text-xs text-green-600 mt-1">
                   Every subscription plan provides complete access to all app services and features. Choose the plan that best fits your budget.
                 </p>
               </div>
             </div>
           </div>
         </div>
         
                   <div className="flex justify-center mb-8">
           {Object.entries(subscriptionPlans).map(([planKey, plan]) => {
             const Icon = plan.icon;
             const isCurrentPlan = currentSubscription.plan === planKey;
             
             return (
               <div key={planKey} className={`bg-white rounded-lg shadow-lg border-2 max-w-md w-full ${
                 isCurrentPlan ? 'border-blue-500' : 'border-gray-200'
               }`}>
                 <div className="p-6">
                   <div className="flex items-center mb-4">
                     <Icon className={`h-8 w-8 text-${plan.color}-600 mr-3`} />
                     <div>
                       <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                       {isCurrentPlan && (
                         <span className="text-sm text-blue-600 font-medium">Current Plan</span>
                       )}
                     </div>
                   </div>
                   
                   <div className="mb-6">
                     <div className="text-3xl font-bold text-gray-900 mb-2">
                       {formatCurrency(plan.price.monthly)}
                       <span className="text-lg font-normal text-gray-500">/month</span>
                     </div>
                     <div className="text-sm text-gray-600 space-y-1">
                       <div>Weekly: {formatCurrency(plan.price.weekly)}</div>
                       <div>Annually: {formatCurrency(plan.price.annually)}</div>
                     </div>
                     <div className="text-xs text-blue-600 font-medium mt-2">
                       All billing cycles provide the same full access
                     </div>
                   </div>
                   
                   <ul className="space-y-3 mb-6">
                     {plan.features.map((feature, index) => (
                       <li key={index} className="flex items-center">
                         <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                         <span className="text-sm text-gray-600">{feature}</span>
                       </li>
                     ))}
                   </ul>
                   
                   {!isCurrentPlan && (
                     <button
                       onClick={() => {
                         setSelectedPlan(planKey);
                         setShowUpgradeModal(true);
                       }}
                       className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                     >
                       <ArrowRight className="h-4 w-4 mr-2" />
                       Choose Plan
                     </button>
                   )}
                 </div>
               </div>
             );
           })}
         </div>

        {/* Payment History */}
        {currentSubscription.paymentHistory && currentSubscription.paymentHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSubscription.paymentHistory.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'completed' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

                 {/* Upgrade Modal */}
         <Modal
           isOpen={showUpgradeModal}
           onClose={() => setShowUpgradeModal(false)}
           size="lg"
         >
           <div className="p-6">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold">Upgrade Subscription</h2>
               <button
                 onClick={() => setShowUpgradeModal(false)}
                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                 title="Close"
               >
                 <X className="h-5 w-5" />
               </button>
             </div>
            
            {selectedPlan && (
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Selected Plan: {subscriptionPlans[selectedPlan].name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose your billing cycle below
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['weekly', 'monthly', 'annually'].map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setSelectedBillingCycle(cycle)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        selectedBillingCycle === cycle
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 capitalize">{cycle}</div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(subscriptionPlans[selectedPlan].price[cycle])}
                      </div>
                      <div className="text-xs text-gray-500">
                        {cycle === 'weekly' && 'per week'}
                        {cycle === 'monthly' && 'per month'}
                        {cycle === 'annually' && 'per year'}
                      </div>
                    </button>
                  ))}
                </div>
                
                                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                   <div className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                     <div>
                       <p className="text-sm font-medium text-green-800">
                         Full Access Guaranteed
                       </p>
                       <p className="text-xs text-green-600 mt-1">
                         All subscription plans provide complete access to every feature and service in the app.
                       </p>
                     </div>
                   </div>
                 </div>
                 
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                   <div className="flex items-center">
                     <AlertTriangle className="h-5 w-5 text-blue-600 mr-2" />
                     <div>
                       <p className="text-sm font-medium text-blue-800">
                         Payment Information
                       </p>
                       <p className="text-xs text-blue-600 mt-1">
                         You will be charged {formatCurrency(subscriptionPlans[selectedPlan].price[selectedBillingCycle])} 
                         {selectedBillingCycle === 'weekly' && ' weekly'}
                         {selectedBillingCycle === 'monthly' && ' monthly'}
                         {selectedBillingCycle === 'annually' && ' annually'}
                       </p>
                     </div>
                   </div>
                 </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeSubscription}
                disabled={processing || !selectedPlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </>
                )}
              </button>
            </div>
          </div>
                 </Modal>

         {/* Payment Modal */}
         <Modal
           isOpen={showPaymentModal}
           onClose={resetPaymentFlow}
           size="lg"
         >
           <div className="p-6">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold">Payment Processing</h2>
               <button
                 onClick={resetPaymentFlow}
                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                 title="Close"
               >
                 <X className="h-5 w-5" />
               </button>
             </div>

                           {/* Payment Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Payment Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium ml-2">{subscriptionPlans[selectedPlan]?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Billing Cycle:</span>
                    <span className="font-medium ml-2 capitalize">{selectedBillingCycle}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium ml-2">{formatCurrency(subscriptionPlans[selectedPlan]?.price[selectedBillingCycle] || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium ml-2">
                      {selectedBillingCycle === 'weekly' && '1 Week'}
                      {selectedBillingCycle === 'monthly' && '1 Month'}
                      {selectedBillingCycle === 'annually' && '1 Year'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-700 font-medium">
                      Full access to all app services included
                    </span>
                  </div>
                </div>
              </div>

             {/* Payment Method Selection */}
             {verificationStep === 'payment-method' && (
               <div>
                 <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
                 <div className="grid grid-cols-2 gap-4">
                   {Object.entries(paymentMethods).map(([key, method]) => {
                     const Icon = method.icon;
                     return (
                       <button
                         key={key}
                         onClick={() => selectPaymentMethod(key)}
                         className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                       >
                         <div className="flex items-center mb-2">
                           <Icon className={`h-6 w-6 text-${method.color}-600 mr-2`} />
                           <span className="font-semibold">{method.name}</span>
                         </div>
                         <p className="text-sm text-gray-600">Secure payment via {method.name}</p>
                       </button>
                     );
                   })}
                 </div>
               </div>
             )}

             {/* Payment Details Form */}
             {verificationStep === 'details' && selectedPaymentMethod && (
               <div>
                 <div className="flex items-center mb-4">
                   <button
                     onClick={() => setVerificationStep('payment-method')}
                     className="text-blue-600 hover:text-blue-800 mr-2"
                   >
                     ← Back
                   </button>
                   <h3 className="text-lg font-semibold">Payment Details</h3>
                 </div>
                 
                 <div className="space-y-4">
                   {paymentMethods[selectedPaymentMethod].fields.map((field) => (
                     <div key={field.name}>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         {field.label}
                       </label>
                       {field.type === 'select' ? (
                         <select
                           value={paymentDetails[field.name] || ''}
                           onChange={(e) => setPaymentDetails({
                             ...paymentDetails,
                             [field.name]: e.target.value
                           })}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           required={field.required}
                         >
                           <option value="">Select {field.label}</option>
                           {field.options.map((option) => (
                             <option key={option} value={option}>{option}</option>
                           ))}
                         </select>
                       ) : (
                         <input
                           type={field.type}
                           placeholder={field.placeholder}
                           value={paymentDetails[field.name] || ''}
                           onChange={(e) => setPaymentDetails({
                             ...paymentDetails,
                             [field.name]: e.target.value
                           })}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           required={field.required}
                         />
                       )}
                     </div>
                   ))}
                 </div>

                 <div className="mt-6 flex justify-end">
                   <button
                     onClick={handlePaymentDetailsSubmit}
                     disabled={processing}
                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                   >
                     {processing ? (
                       <>
                         <RefreshCw className="h-4 w-4 mr-2 animate-spin inline" />
                         Sending Code...
                       </>
                     ) : (
                       'Continue to Verification'
                     )}
                   </button>
                 </div>
               </div>
             )}

             {/* Verification Code */}
             {verificationStep === 'verification' && (
               <div>
                 <div className="flex items-center mb-4">
                   <button
                     onClick={() => setVerificationStep('details')}
                     className="text-blue-600 hover:text-blue-800 mr-2"
                   >
                     ← Back
                   </button>
                   <h3 className="text-lg font-semibold">Verification</h3>
                 </div>
                 
                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                   <div className="flex items-center">
                     <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                     <div>
                       <p className="text-sm font-medium text-yellow-800">
                         Verification Code Sent
                       </p>
                       <p className="text-xs text-yellow-600 mt-1">
                         We've sent a 6-digit verification code to your {verificationMedium === 'email' ? 'email address' : 'phone number'}
                       </p>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Verification Code
                     </label>
                     <input
                       type="text"
                       placeholder="Enter 6-digit code"
                       value={verificationCode}
                       onChange={(e) => setVerificationCode(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       maxLength={6}
                     />
                   </div>
                 </div>

                 <div className="mt-6 flex justify-end">
                   <button
                     onClick={handleVerificationSubmit}
                     disabled={processing || verificationCode.length !== 6}
                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                   >
                     {processing ? (
                       <>
                         <RefreshCw className="h-4 w-4 mr-2 animate-spin inline" />
                         Processing...
                       </>
                     ) : (
                       'Verify & Complete Payment'
                     )}
                   </button>
                 </div>
               </div>
             )}

             {/* Processing */}
             {verificationStep === 'processing' && (
               <div className="text-center py-8">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                 <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                 <p className="text-gray-600">Please wait while we process your payment...</p>
               </div>
             )}
           </div>
         </Modal>
       </div>
     </div>
   );
 };

export default AdminSubscription;
