// Unified error handling for authentication
export interface AuthError {
  code: string;
  message: string;
  userMessage: string;
}

export const getAuthErrorMessage = (error: any): AuthError => {
  const code = error?.code || 'unknown';
  
  const errorMap: Record<string, AuthError> = {
    'auth/user-not-found': {
      code,
      message: error.message,
      userMessage: 'No account found with this email address.'
    },
    'auth/wrong-password': {
      code,
      message: error.message,
      userMessage: 'Incorrect password. Please try again.'
    },
    'auth/invalid-credential': {
      code,
      message: error.message,
      userMessage: 'Invalid email or password.'
    },
    'auth/email-already-in-use': {
      code,
      message: error.message,
      userMessage: 'An account already exists with this email address.'
    },
    'auth/weak-password': {
      code,
      message: error.message,
      userMessage: 'Password is too weak. Please choose a stronger password.'
    },
    'auth/invalid-email': {
      code,
      message: error.message,
      userMessage: 'Please enter a valid email address.'
    },
    'auth/too-many-requests': {
      code,
      message: error.message,
      userMessage: 'Too many failed attempts. Please try again later.'
    },
    'auth/network-request-failed': {
      code,
      message: error.message,
      userMessage: 'Network error. Please check your internet connection.'
    },
    'auth/operation-not-allowed': {
      code,
      message: error.message,
      userMessage: 'This sign-in method is not enabled. Please contact support.'
    },
    'auth/unauthorized-domain': {
      code,
      message: error.message,
      userMessage: 'This domain is not authorized for authentication.'
    },
    'auth/account-exists-with-different-credential': {
      code,
      message: error.message,
      userMessage: 'An account already exists with a different sign-in method.'
    },
    'auth/popup-closed-by-user': {
      code,
      message: error.message,
      userMessage: 'Sign-in was cancelled. Please try again.'
    },
    'auth/popup-blocked': {
      code,
      message: error.message,
      userMessage: 'Pop-up was blocked. Please allow pop-ups for this site.'
    },
    'auth/cancelled-popup-request': {
      code,
      message: error.message,
      userMessage: 'Sign-in was cancelled. Please try again.'
    },
    'auth/credential-already-in-use': {
      code,
      message: error.message,
      userMessage: 'This credential is already associated with a different account.'
    },
    'auth/missing-continue-uri': {
      code,
      message: error.message,
      userMessage: 'Configuration error. Please contact support.'
    },
    'auth/unauthorized-continue-uri': {
      code,
      message: error.message,
      userMessage: 'The redirect URL is not authorized. Please contact support.'
    }
  };

  return errorMap[code] || {
    code,
    message: error?.message || 'An unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again.'
  };
};