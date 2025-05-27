import { useState, useEffect } from 'react';

const LocalhostAuthHelper = () => {
  const [showHelper, setShowHelper] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Record<string, any>>({});

  useEffect(() => {
    // Only run diagnostics on localhost
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const data: Record<string, any> = {
        protocol: window.location.protocol,
        cookiesEnabled: navigator.cookieEnabled,
        hasFirebaseCookie: document.cookie.includes('firebase-session-test'),
        hasAuthTestCookie: document.cookie.includes('auth-test'),
        isChrome: navigator.userAgent.includes('Chrome'),
        isFirefox: navigator.userAgent.includes('Firefox'),
        isSafari: navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'),
        hasLocalStorage: typeof localStorage !== 'undefined',
        thirdPartyCookiesBlocked: false // We'll check this below
      };
      
      // Check if third-party cookies might be blocked
      try {
        // Try to set a test cookie with SameSite=None
        document.cookie = "3p-cookie-test=1; SameSite=None; Secure";
        data.thirdPartyCookiesBlocked = !document.cookie.includes('3p-cookie-test');
      } catch (e) {
        data.cookieError = true;
      }
      
      setDiagnostics(data);
    }
  }, []);

  return (
    <div className="mt-4 text-sm">
      <button 
        onClick={() => setShowHelper(!showHelper)} 
        className="text-blue-500 hover:text-blue-400 underline text-xs"
      >
        {showHelper ? 'Hide localhost auth help' : 'Having trouble signing in on localhost?'}
      </button>
      
      {showHelper && diagnostics && (
        <div className="mt-2 p-4 bg-gray-800 rounded-md text-white">
          <h3 className="font-medium mb-2">Localhost Authentication Help</h3>
          
          <div className="space-y-2 text-xs">
            {diagnostics.protocol !== 'https:' && (
              <div className="p-2 bg-yellow-800 rounded">
                <p className="font-medium">⚠️ You're using HTTP instead of HTTPS</p>
                <p>Firebase authentication works best with HTTPS, even on localhost.</p>
                <p className="mt-1">Try running these commands in a new terminal:</p>
                <pre className="bg-gray-900 p-2 mt-1 rounded overflow-x-auto">
                  npm install -g local-ssl-proxy{"\n"}
                  local-ssl-proxy --source 3001 --target 3000
                </pre>
                <p className="mt-1">Then visit <a href="https://localhost:3001" className="text-blue-400 underline">https://localhost:3001</a></p>
              </div>
            )}
            
            {diagnostics.thirdPartyCookiesBlocked && (
              <div className="p-2 bg-red-800 rounded">
                <p className="font-medium">⚠️ Third-party cookies may be blocked</p>
                <p>Firebase authentication needs third-party cookies to work.</p>
                
                {diagnostics.isChrome && (
                  <div className="mt-1">
                    <p className="font-medium">Chrome instructions:</p>
                    <ol className="list-decimal list-inside pl-2">
                      <li>Open Chrome Settings</li>
                      <li>Go to Privacy and security → Cookies and other site data</li>
                      <li>Allow all cookies or add an exception for localhost</li>
                    </ol>
                  </div>
                )}
                
                {diagnostics.isFirefox && (
                  <div className="mt-1">
                    <p className="font-medium">Firefox instructions:</p>
                    <ol className="list-decimal list-inside pl-2">
                      <li>Open Firefox Settings</li>
                      <li>Go to Privacy & Security</li>
                      <li>Set "Enhanced Tracking Protection" to Standard or Custom</li>
                      <li>Under Cookies, select "All cookies" or add an exception</li>
                    </ol>
                  </div>
                )}
                
                {diagnostics.isSafari && (
                  <div className="mt-1">
                    <p className="font-medium">Safari instructions:</p>
                    <ol className="list-decimal list-inside pl-2">
                      <li>Open Safari Preferences</li>
                      <li>Go to Privacy tab</li>
                      <li>Uncheck "Prevent cross-site tracking"</li>
                      <li>Allow all cookies</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
            
            {!diagnostics.cookiesEnabled && (
              <div className="p-2 bg-red-800 rounded">
                <p className="font-medium">⚠️ Cookies are disabled</p>
                <p>Firebase authentication requires cookies to be enabled.</p>
                <p>Please enable cookies in your browser settings.</p>
              </div>
            )}
            
            {!diagnostics.hasFirebaseCookie && !diagnostics.hasAuthTestCookie && (
              <div className="p-2 bg-yellow-800 rounded">
                <p className="font-medium">⚠️ Firebase cookies not detected</p>
                <p>This may indicate issues with cookie settings.</p>
              </div>
            )}
            
            <div className="p-2 bg-gray-700 rounded">
              <p className="font-medium">Alternative approach: Use email/password authentication</p>
              <p>Email/password authentication usually works better on localhost.</p>
            </div>
            
            <div className="p-2 bg-blue-900 rounded">
              <p className="font-medium">Firebase Authentication troubleshooting tips:</p>
              <ul className="list-disc list-inside pl-2">
                <li>Try using incognito/private mode</li>
                <li>Try a different browser</li>
                <li>Clear your browser cache and cookies</li>
                <li>Disable any ad blockers or privacy extensions</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalhostAuthHelper; 