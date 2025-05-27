import { useState } from 'react';
import { verifyAuthConfig, auth } from '@/lib/firebase';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const GoogleAuthTroubleshooting = () => {
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Record<string, any>>({});
  const [isTestingPopup, setIsTestingPopup] = useState(false);

  const runDiagnostics = async () => {
    // Collect basic diagnostic information
    const data: Record<string, any> = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      localStorage: typeof localStorage !== 'undefined',
      https: window.location.protocol === 'https:',
      hostname: window.location.hostname,
      href: window.location.href,
      origin: window.location.origin,
      time: new Date().toISOString(),
    };
    
    // Check third-party cookies
    try {
      data.thirdPartyCookies = document.cookie.includes('check_3p_cookie');
      
      // Check popup support
      data.popupBlocked = false;
      const popup = window.open('about:blank', '_blank', 'width=1,height=1');
      if (!popup || popup.closed) {
        data.popupBlocked = true;
      } else {
        popup.close();
      }
    } catch (e) {
      data.popupError = (e as Error).message;
    }
    
    // Check for Firefox - has known issues with third-party cookies
    data.isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
    
    // Check for Safari - has known issues with ITP
    data.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Check for localStorage access
    try {
      localStorage.setItem('test-item', 'test');
      localStorage.removeItem('test-item');
      data.localStorageAccess = true;
    } catch (e) {
      data.localStorageAccess = false;
      data.localStorageError = (e as Error).message;
    }
    
    // Check for indexedDB access (used by Firebase Auth)
    try {
      const request = indexedDB.open('test-db', 1);
      data.indexedDBAccess = true;
      request.onerror = (event) => {
        data.indexedDBAccess = false;
        data.indexedDBError = 'Error opening indexedDB';
      };
      request.onsuccess = (event) => {
        const db = request.result;
        db.close();
        indexedDB.deleteDatabase('test-db');
      };
    } catch (e) {
      data.indexedDBAccess = false;
      data.indexedDBError = (e as Error).message;
    }
    
    // Check for service worker registration
    if (navigator.serviceWorker) {
      data.serviceWorkerSupported = true;
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        data.serviceWorkerRegistrations = registrations.length;
      } catch (e) {
        data.serviceWorkerError = (e as Error).message;
      }
    } else {
      data.serviceWorkerSupported = false;
    }
    
    // Run Firebase auth config verification
    try {
      await verifyAuthConfig();
      data.firebaseVerified = true;
      
      // Safe check for authentication state
      data.hasCurrentUser = !!auth.currentUser;
    } catch (e) {
      data.firebaseError = (e as Error).message;
    }
    
    setDiagnostics(data);
  };
  
  // Test popup auth specifically
  const testPopupAuth = async () => {
    setIsTestingPopup(true);
    try {
      // Try a very basic popup sign-in
      const testProvider = new GoogleAuthProvider();
      
      // Just test if the popup opens, don't complete the auth
      testProvider.setCustomParameters({
        prompt: 'select_account',
        login_hint: 'test@example.com'
      });
      
      const tempAuth = getAuth();
      
      // This will open a popup - we just want to see if it works
      const popup = await signInWithPopup(tempAuth, testProvider)
        .catch((error) => {
          // We expect an error since we're not completing auth
          // We just want to see if popup opens
          if (error.code === 'auth/popup-closed-by-user') {
            return { popupWorked: true };
          }
          throw error;
        });
      
      setDiagnostics((prev) => ({
        ...prev, 
        popupTest: 'success',
        popupAuthTestResult: popup ? 'opened' : 'failed'
      }));
    } catch (e: any) {
      setDiagnostics((prev) => ({
        ...prev,
        popupTest: 'failed',
        popupTestError: e.code || e.message
      }));
    } finally {
      setIsTestingPopup(false);
    }
  };

  return (
    <div className="mt-6 text-sm text-gray-400">
      <button 
        className="text-blue-400 hover:text-blue-300 underline"
        onClick={() => {
          setShowTroubleshooting(!showTroubleshooting);
          if (!showTroubleshooting) {
            runDiagnostics();
          }
        }}
      >
        {showTroubleshooting ? 'Hide Troubleshooting' : 'Having trouble logging in with Google?'}
      </button>
      
      {showTroubleshooting && (
        <div className="mt-4 p-4 bg-gray-800 rounded-md">
          <h3 className="text-white font-medium mb-3">Troubleshooting Tips:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Enable cookies and JavaScript in your browser settings</li>
            <li>Try using a different browser (Chrome works best with Google Auth)</li>
            <li>Try using incognito/private mode</li>
            <li>Disable any ad-blockers or privacy extensions</li>
            <li>Allow third-party cookies for this site</li>
            <li>Try refreshing the page and attempt login again</li>
          </ul>
          
          <div className="mt-4 text-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              onClick={testPopupAuth}
              disabled={isTestingPopup}
            >
              {isTestingPopup ? 'Testing popup...' : 'Test popup functionality'}
            </button>
            <p className="mt-2 text-xs text-gray-400">
              This will test if your browser allows authentication popups
            </p>
          </div>
          
          {Object.keys(diagnostics).length > 0 && (
            <div className="mt-4">
              <h4 className="text-white font-medium mb-2">Diagnostics:</h4>
              <div className="bg-gray-900 p-3 rounded text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(diagnostics, null, 2)}</pre>
              </div>
              
              {/* Quick analysis */}
              <div className="mt-3 text-xs">
                {diagnostics.popupBlocked && (
                  <p className="text-red-400">⚠️ Popups appear to be blocked. Try enabling popups for this site.</p>
                )}
                {diagnostics.isSafari && (
                  <p className="text-yellow-400">⚠️ Safari detected: Safari has stricter privacy settings that may affect login.</p>
                )}
                {!diagnostics.cookiesEnabled && (
                  <p className="text-red-400">⚠️ Cookies are disabled. Enable cookies to use authentication.</p>
                )}
                {!diagnostics.localStorageAccess && (
                  <p className="text-red-400">⚠️ LocalStorage access is blocked. Check privacy settings.</p>
                )}
                {diagnostics.https === false && (
                  <p className="text-yellow-400">⚠️ Not using HTTPS. Authentication works best with HTTPS.</p>
                )}
                {diagnostics.popupTest === 'failed' && (
                  <p className="text-red-400">⚠️ Popup test failed: {diagnostics.popupTestError}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleAuthTroubleshooting; 