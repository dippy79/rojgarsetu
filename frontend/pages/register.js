// frontend/pages/register.js - Registration page with glassmorphism design
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '../lib/api';
import { theme } from '../styles/theme';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'candidate',
        companyName: ''
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

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                role: formData.role,
                firstName: formData.firstName,
                lastName: formData.lastName,
                companyName: formData.companyName
            };

            const response = await authAPI.register(payload);

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
                setError(response.data.error || 'Registration failed');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-bg">
                <div className="bg-shape shape-1"></div>
                <div className="bg-shape shape-2"></div>
                <div className="bg-shape shape-3"></div>
            </div>

            <motion.div
                className="register-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="register-card">
                    <div className="register-header">
                        <Link href="/" className="logo">
                            <span className="logo-icon">💼</span>
                            <span className="logo-text">RojgarSetu</span>
                        </Link>
                        <h1>Create Account</h1>
                        <p>Join thousands of job seekers and employers</p>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        {error && (
                            <motion.div
                                className="error-message"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'candidate' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'candidate' })}
                            >
                                <span className="role-icon">👤</span>
                                <span>Job Seeker</span>
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'company' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'company' })}
                            >
                                <span className="role-icon">🏢</span>
                                <span>Employer</span>
                            </button>
                        </div>

                        <div className="name-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    required
                                />
                            </div>
                        </div>

                        {formData.role === 'company' && (
                            <div className="form-group">
                                <label htmlFor="companyName">Company Name</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Your company name"
                                    required={formData.role === 'company'}
                                />
                            </div>
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
                                placeholder="Create a password"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="terms-check">
                            <label>
                                <input type="checkbox" required />
                                <span>
                                    I agree to the{' '}
                                    <Link href="/terms" className="link">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="link">Privacy Policy</Link>
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="register-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="register-footer">
                        <p>
                            Already have an account?{' '}
                            <Link href="/login" className="login-link">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>

            <style jsx>{`
                .register-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${theme.colors.background.primary};
                    position: relative;
                    overflow: hidden;
                    padding: 20px;
                }

                .register-bg {
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
                    right: -200px;
                    animation: float 20s ease-in-out infinite;
                }

                .shape-2 {
                    width: 500px;
                    height: 500px;
                    background: ${theme.colors.secondary};
                    bottom: -150px;
                    left: -150px;
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
                    50% { transform: translate(-30px, -30px); }
                }

                @keyframes pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
                }

                .register-container {
                    width: 100%;
                    max-width: 500px;
                    position: relative;
                    z-index: 1;
                }

                .register-card {
                    background: ${theme.gradients.card};
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: ${theme.borderRadius['2xl']};
                    padding: ${theme.spacing['2xl']};
                    box-shadow: ${theme.shadows.xl};
                }

                .register-header {
                    text-align: center;
                    margin-bottom: ${theme.spacing.xl};
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

                .register-header h1 {
                    font-size: ${theme.typography.fontSize['3xl']};
                    font-weight: ${theme.typography.fontWeight.bold};
                    color: ${theme.colors.text.primary};
                    margin-bottom: ${theme.spacing.sm};
                }

                .register-header p {
                    color: ${theme.colors.text.secondary};
                    font-size: ${theme.typography.fontSize.base};
                }

                .register-form {
                    display: flex;
                    flex-direction: column;
                    gap: ${theme.spacing.md};
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

                .role-selector {
                    display: flex;
                    gap: ${theme.spacing.md};
                    margin-bottom: ${theme.spacing.sm};
                }

                .role-btn {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: ${theme.spacing.sm};
                    padding: ${theme.spacing.md};
                    background: ${theme.colors.background.tertiary};
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: ${theme.borderRadius.lg};
                    color: ${theme.colors.text.secondary};
                    cursor: pointer;
                    transition: all ${theme.transitions.fast};
                }

                .role-btn:hover {
                    border-color: ${theme.colors.primary};
                }

                .role-btn.active {
                    border-color: ${theme.colors.primary};
                    background: rgba(79, 70, 229, 0.1);
                    color: ${theme.colors.text.primary};
                }

                .role-icon {
                    font-size: 1.5rem;
                }

                .name-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: ${theme.spacing.md};
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
                    padding: 12px 14px;
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

                .terms-check {
                    color: ${theme.colors.text.secondary};
                    font-size: ${theme.typography.fontSize.sm};
                }

                .terms-check label {
                    display: flex;
                    align-items: flex-start;
                    gap: ${theme.spacing.sm};
                    cursor: pointer;
                }

                .terms-check input {
                    width: 16px;
                    height: 16px;
                    margin-top: 2px;
                    accent-color: ${theme.colors.primary};
                }

                .link {
                    color: ${theme.colors.primaryLight};
                    text-decoration: none;
                }

                .link:hover {
                    text-decoration: underline;
                }

                .register-btn {
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
                    margin-top: ${theme.spacing.sm};
                }

                .register-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: ${theme.shadows.glow.primary};
                }

                .register-btn:disabled {
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

                .register-footer {
                    margin-top: ${theme.spacing.xl};
                    text-align: center;
                    padding-top: ${theme.spacing.lg};
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .register-footer p {
                    color: ${theme.colors.text.secondary};
                    font-size: ${theme.typography.fontSize.sm};
                }

                .login-link {
                    color: ${theme.colors.primaryLight};
                    text-decoration: none;
                    font-weight: ${theme.typography.fontWeight.medium};
                    transition: color ${theme.transitions.fast};
                }

                .login-link:hover {
                    color: ${theme.colors.primary};
                }

                @media (max-width: 480px) {
                    .register-card {
                        padding: ${theme.spacing.lg};
                    }

                    .name-row {
                        grid-template-columns: 1fr;
                    }

                    .register-header h1 {
                        font-size: ${theme.typography.fontSize['2xl']};
                    }
                }
            `}</style>
        </div>
    );
}

