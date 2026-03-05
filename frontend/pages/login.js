// frontend/pages/login.js - Login page with glassmorphism design
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '../lib/api';
import { theme } from '../styles/theme';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);

            if (response.data.success) {
                // Store tokens
                localStorage.setItem('token', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));

                // Redirect based on role
                const user = response.data.data.user;
                if (user.role === 'admin' || user.role === 'super_admin') {
                    router.push('/admin/dashboard');
                } else if (user.role === 'company') {
                    router.push('/company/dashboard');
                } else {
                    router.push('/profile');
                }
            } else {
                setError(response.data.error || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg">
                <div className="bg-shape shape-1"></div>
                <div className="bg-shape shape-2"></div>
                <div className="bg-shape shape-3"></div>
            </div>

            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-card">
                    <div className="login-header">
                        <Link href="/" className="logo">
                            <span className="logo-icon">💼</span>
                            <span className="logo-text">RojgarSetu</span>
                        </Link>
                        <h1>Welcome Back</h1>
                        <p>Sign in to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <motion.div
                                className="error-message"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="forgot-link">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link href="/register" className="register-link">
                                Create Account
                            </Link>
                        </p>
                    </div>

                    <div className="demo-credentials">
                        <p><strong>Demo Credentials:</strong></p>
                        <p>Email: admin@rojgarsetu.com</p>
                        <p>Password: admin123</p>
                    </div>
                </div>
            </motion.div>

            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${theme.colors.background.primary};
                    position: relative;
                    overflow: hidden;
                    padding: 20px;
                }

                .login-bg {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                }

                .bg-shape {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    opacity: 0.4;
                }

                .shape-1 {
                    width: 600px;
                    height: 600px;
                    background: ${theme.colors.primary};
                    top: -200px;
                    left: -200px;
                    animation: float 20s ease-in-out infinite;
                }

                .shape-2 {
                    width: 500px;
                    height: 500px;
                    background: ${theme.colors.secondary};
                    bottom: -150px;
                    right: -150px;
                    animation: float 25s ease-in-out infinite reverse;
                }

                .shape-3 {
                    width: 300px;
                    height: 300px;
                    background: #8B5CF6;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation: pulse 15s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, 30px); }
                }

                @keyframes pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
                }

                .login-container {
                    width: 100%;
                    max-width: 440px;
                    position: relative;
                    z-index: 1;
                }

                .login-card {
                    background: ${theme.gradients.card};
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: ${theme.borderRadius['2xl']};
                    padding: ${theme.spacing['2xl']};
                    box-shadow: ${theme.shadows.xl};
                }

                .login-header {
                    text-align: center;
                    margin-bottom: ${theme.spacing['2xl']};
                }

                .logo {
                    display: inline-flex;
                    align-items: center;
                    gap: ${theme.spacing.sm};
                    text-decoration: none;
                    margin-bottom: ${theme.spacing.lg};
                }

                .logo-icon {
                    font-size: 2rem;
                }

                .logo-text {
                    font-family: ${theme.typography.fontFamily.heading};
                    font-size: ${theme.typography.fontSize['2xl']};
                    font-weight: ${theme.typography.fontWeight.bold};
                    background: ${theme.gradients.primary};
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .login-header h1 {
                    font-size: ${theme.typography.fontSize['3xl']};
                    font-weight: ${theme.typography.fontWeight.bold};
                    color: ${theme.colors.text.primary};
                    margin-bottom: ${theme.spacing.sm};
                }

                .login-header p {
                    color: ${theme.colors.text.secondary};
                    font-size: ${theme.typography.fontSize.base};
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: ${theme.spacing.lg};
                }

                .error-message {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: ${theme.colors.accent.error};
                    padding: ${theme.spacing.md};
                    border-radius: ${theme.borderRadius.md};
                    font-size: ${theme.typography.fontSize.sm};
                    text-align: center;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: ${theme.spacing.sm};
                }

                .form-group label {
                    color: ${theme.colors.text.primary};
                    font-size: ${theme.typography.fontSize.sm};
                    font-weight: ${theme.typography.fontWeight.medium};
                }

                .form-group input {
                    padding: 14px 16px;
                    background: ${theme.colors.background.tertiary};
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: ${theme.borderRadius.md};
                    color: ${theme.colors.text.primary};
                    font-size: ${theme.typography.fontSize.base};
                    transition: all ${theme.transitions.fast};
                }

                .form-group input:focus {
                    outline: none;
                    border-color: ${theme.colors.primary};
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
                }

                .form-group input::placeholder {
                    color: ${theme.colors.text.tertiary};
                }

                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: ${theme.spacing.sm};
                    color: ${theme.colors.text.secondary};
                    font-size: ${theme.typography.fontSize.sm};
                    cursor: pointer;
                }

                .remember-me input {
                    width: 16px;
                    height: 16px;
                    accent-color: ${theme.colors.primary};
                }

                .forgot-link {
                    color: ${theme.colors.primaryLight};
                    font-size: ${theme.typography.fontSize.sm};
                    text-decoration: none;
                    transition: color ${theme.transitions.fast};
                }

                .forgot-link:hover {
                    color: ${theme.colors.primary};
                }

                .login-btn {
                    padding: 14px 24px;
                    background: ${theme.gradients.primary};
                    color: white;
                    border: none;
                    border-radius: ${theme.borderRadius.md};
                    font-size: ${theme.typography.fontSize.base};
                    font-weight: ${theme.typography.fontWeight.semibold};
                    cursor: pointer;
                    transition: all ${theme.transitions.normal};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 50px;
                }

                .login-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: ${theme.shadows.glow.primary};
                }

                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .loading-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .login-footer {
                    margin-top: ${theme.spacing['2xl']};
                    text-align: center;
                    padding-top: ${theme.spacing.lg};
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .login-footer p {
                    color: ${theme.colors.text.secondary};
                    font-size: ${theme.typography.fontSize.sm};
                }

                .register-link {
                    color: ${theme.colors.primaryLight};
                    text-decoration: none;
                    font-weight: ${theme.typography.fontWeight.medium};
                    transition: color ${theme.transitions.fast};
                }

                .register-link:hover {
                    color: ${theme.colors.primary};
                }

                .demo-credentials {
                    margin-top: ${theme.spacing.lg};
                    padding: ${theme.spacing.md};
                    background: rgba(79, 70, 229, 0.1);
                    border: 1px solid rgba(79, 70, 229, 0.2);
                    border-radius: ${theme.borderRadius.md};
                    font-size: ${theme.typography.fontSize.xs};
                    color: ${theme.colors.text.secondary};
                    text-align: center;
                }

                .demo-credentials p {
                    margin: 2px 0;
                }

                @media (max-width: 480px) {
                    .login-card {
                        padding: ${theme.spacing.lg};
                    }

                    .login-header h1 {
                        font-size: ${theme.typography.fontSize['2xl']};
                    }
                }
            `}</style>
        </div>
    );
}

