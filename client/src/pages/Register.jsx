import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_CURRENCIES } from '../data/currency';

const Register = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [error, setError] = React.useState('');

    const formik = useFormik({
        initialValues: { name: '', email: '', password: '', currency: 'USD' },
        validationSchema: Yup.object({
            name: Yup.string().required('Required'),
            email: Yup.string().email('Invalid email').required('Required'),
            password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
            currency: Yup.string().required('Required')
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const res = await fetch('/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Registration failed');

                navigate('/login');
            } catch (err) {
                setError(err.message);
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="min-h-screen w-full flex items-center justify-center app-shell px-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <img src="/header-bg.png" className="w-full h-full object-cover opacity-30" alt="" />
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/10 via-slate-950/50 to-amber-500/10 pointer-events-none" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl ring-1 ring-white/5"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{t?.auth?.create_account}</h1>
                    <p className="text-slate-400">{t?.auth?.join_platform}</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t?.auth?.name}</label>
                        <input
                            type="text"
                            {...formik.getFieldProps('name')}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                            placeholder={t?.auth?.placeholder_name}
                        />
                        {formik.touched.name && formik.errors.name ? (
                            <div className="text-rose-400 text-xs mt-1">{formik.errors.name}</div>
                        ) : null}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t?.auth?.email}</label>
                        <input
                            type="email"
                            {...formik.getFieldProps('email')}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                            placeholder={t?.auth?.placeholder_email}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <div className="text-rose-400 text-xs mt-1">{formik.errors.email}</div>
                        ) : null}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t?.auth?.password}</label>
                        <input
                            type="password"
                            {...formik.getFieldProps('password')}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                            placeholder={t?.auth?.placeholder_password}
                        />
                        {/* Validation error for password */}
                        {formik.touched.password && formik.errors.password ? (
                            <div className="text-rose-400 text-xs mt-1">{formik.errors.password}</div>
                        ) : null}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t?.auth?.currency_label || 'Base currency'}</label>
                        <select
                            {...formik.getFieldProps('currency')}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        >
                            {SUPPORTED_CURRENCIES.map((code) => (
                                <option key={code} value={code} className="bg-slate-900 text-white">
                                    {code}
                                </option>
                            ))}
                        </select>
                        {formik.touched.currency && formik.errors.currency ? (
                            <div className="text-rose-400 text-xs mt-1">{formik.errors.currency}</div>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-emerald-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center border border-white/10"
                    >
                        {formik.isSubmitting ? <Loader2 className="animate-spin" /> : t?.auth?.register_btn}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    {t?.auth?.has_account}{' '}
                    <Link to="/login" className="text-emerald-300 hover:text-emerald-200 font-medium transition-colors">
                        {t?.auth?.login_link}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
