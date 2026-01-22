import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = React.useState('');

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email').required('Required'),
            password: Yup.string().required('Required')
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const res = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Login failed');

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            } catch (err) {
                setError(err.message);
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <img src="/header-bg.png" className="w-full h-full object-cover opacity-30" alt="" />
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Login to your financial dashboard</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            {...formik.getFieldProps('email')}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
                            placeholder="you@example.com"
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <div className="text-rose-400 text-xs mt-1">{formik.errors.email}</div>
                        ) : null}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            {...formik.getFieldProps('password')}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-teal-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center"
                    >
                        {formik.isSubmitting ? <Loader2 className="animate-spin" /> : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">
                        Register
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
