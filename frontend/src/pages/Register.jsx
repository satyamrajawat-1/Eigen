// src/pages/StudentSignup.jsx
import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = "1038582138858-krl5jmj73vk3776khbqia4ocgqfkkqrl.apps.googleusercontent.com";

const Register = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // This runs automatically when the user successfully clicks the Google account popup
    const handleSuccess = async (credentialResponse) => {
        setError('');
        
        try {
            // The 'credential' is the encrypted JWT string containing the user's email/name
            const googleToken = credentialResponse.credential;

            const response = await axios.post(
                'http://localhost:3000/api/v1/users/register/college', // Update to your backend URL
                { googleToken }, 
                { 
                    withCredentials: true, // CRITICAL FOR COOKIES
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            console.log("Backend Login Success:", response.data);
            navigate('/dashboard');

        } catch (err) {
            console.error("Backend Auth Error:", err);
            if (err.response && err.response.data) {
                setError(err.response.data.message); // Displays the "@iiitkota.ac.in" restriction error
            } else {
                setError("Network error. Could not connect to the server.");
            }
        }
    };

    return (
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <div style={styles.pageContainer}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>IIIT Kota</h1>
                        <p style={styles.subtitle}>Event Management Portal</p>
                    </div>

                    <div style={styles.body}>
                        <p style={styles.instruction}>
                            Only college students can register here. Please use your official <strong>@iiitkota.ac.in</strong> email address.
                        </p>

                        {error && (
                            <div style={styles.errorBox}>
                                {error}
                            </div>
                        )}

                        {/* Official Google Login Button */}
                        <div style={styles.buttonContainer}>
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={() => setError("Google Sign-In popup closed or failed.")}
                                theme="filled_blue"
                                size="large"
                                text="continue_with"
                                shape="rectangular"
                                useOneTap={false} // Prevents the annoying auto-popup banner
                            />
                        </div>
                        
                        <p style={styles.footerText}>
                            Not a college student? <br/>
                            Please see an Executive at the registration desk.
                        </p>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        overflow: 'hidden'
    },
    header: {
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '24px',
        textAlign: 'center'
    },
    title: { margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' },
    subtitle: { margin: 0, color: '#9ca3af', fontSize: '14px' },
    body: { padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px' },
    instruction: { margin: 0, color: '#4b5563', fontSize: '14px', textAlign: 'center', lineHeight: '1.5' },
    errorBox: {
        backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px',
        borderRadius: '6px', fontSize: '14px', textAlign: 'center', border: '1px solid #f87171'
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
    },
    footerText: { margin: '16px 0 0 0', color: '#6b7280', fontSize: '12px', textAlign: 'center', lineHeight: '1.6' }
};

export default Register;