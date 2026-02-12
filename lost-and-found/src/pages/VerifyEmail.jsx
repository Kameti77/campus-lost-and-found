import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const [resendLoading, setResendLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');

  const { currentUser, resendVerificationEmail, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // Called when user clicks "I've Verified My Email"
  // Calls reload() ONCE on demand — no polling, no race conditions
  const handleCheckVerification = async () => {
    setError('');
    try {
      setCheckLoading(true);

      // Force Firebase to fetch fresh user data from the server
      // This is the ONLY place we call reload() — intentionally, on user action
      await currentUser.reload();

      // After reload, check the fresh value
      if (currentUser.emailVerified) {
        navigate('/');
      } else {
        setError("Email not verified yet. Please click the link in your inbox first, then try again.");
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setCheckLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setError('');
    setResendSuccess(false);
    try {
      setResendLoading(true);
      await resendVerificationEmail();
      setResendSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">

        {/* Icon + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">We sent a verification link to</p>
          <p className="text-orange-600 font-semibold mt-1">{currentUser.email}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Resend success */}
          {resendSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✓ Email sent! Check your inbox and spam folder.
            </div>
          )}

          {/* Steps */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Check your inbox</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Look for an email from noreply@... and check spam too
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Click the verification link</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Open the link in the email to confirm your address
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Come back and click below</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Return to this page and press the button to enter the app
                </p>
              </div>
            </div>
          </div>

          {/* PRIMARY ACTION — manual check */}
          <button
            onClick={handleCheckVerification}
            disabled={checkLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {checkLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking...
              </span>
            ) : (
              "I've Verified My Email →"
            )}
          </button>

          {/* Resend */}
          <button
            onClick={handleResendEmail}
            disabled={resendLoading}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {resendLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            ) : (
              'Resend Verification Email'
            )}
          </button>

          {/* Use different email */}
          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition"
          >
            Use a different email
          </button>

        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          The verification link expires after 24 hours
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;