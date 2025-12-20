
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'LOGIN' | 'REGISTER';
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'RESET';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'LOGIN' }) => {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Yükleniyor durumu
    const { signIn, signUp, signInWithGoogle } = useAuth();

    useEffect(() => {
        if(isOpen) {
            setMode(initialMode);
            setResetSent(false);
            setPassword('');
            setIsLoading(false);
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    // Password Validation
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isPasswordSecure = hasMinLength && hasUpperCase && hasNumber;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'RESET') {
            setResetSent(true);
            return;
        }

        if (!email || !password) return;
        if (mode === 'REGISTER' && (!fullName || !isPasswordSecure)) return;

        setIsLoading(true);
        
        try {
            if (mode === 'REGISTER') {
                await signUp(email, password, fullName);
            } else {
                await signIn(email, password);
            }
            // Modal otomatik kapanacak çünkü auth state değişecek
        } catch (error) {
            console.error('Auth error:', error);
            // Hata durumunda kullanıcıya gösterilebilir
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: 'Google') => {
        setIsLoading(true);
        try {
            signInWithGoogle();
        } catch (error) {
            console.error('Social login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Modal Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in transform transition-all scale-100">
                {/* Header Image/Color */}
                <div className="h-32 bg-brand-600 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                         <img src="https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="bg" />
                    </div>
                    <div className="z-10 text-center">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Bulut 3D</h2>
                        <p className="text-brand-100 text-sm font-medium">Atölye Satış Portalı</p>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={isLoading}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {mode !== 'RESET' && (
                        <div className="flex gap-4 mb-6 p-1 bg-slate-100 rounded-xl">
                            <button 
                                onClick={() => setMode('LOGIN')}
                                disabled={isLoading}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'LOGIN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Giriş Yap
                            </button>
                            <button 
                                onClick={() => setMode('REGISTER')}
                                disabled={isLoading}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'REGISTER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Üye Ol
                            </button>
                        </div>
                    )}

                    {mode === 'RESET' && (
                        <div className="mb-6 text-center">
                            <h3 className="text-lg font-bold text-slate-900">Şifremi Unuttum</h3>
                            <p className="text-sm text-slate-500">E-posta adresinize sıfırlama bağlantısı göndereceğiz.</p>
                        </div>
                    )}

                    {!resetSent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'REGISTER' && (
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                                    <input 
                                        type="text" 
                                        placeholder="Ad Soyad"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            )}

                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    placeholder="E-posta Adresi"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {mode !== 'RESET' && (
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                                        <input 
                                            type="password" 
                                            placeholder="Şifre"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    
                                    {mode === 'LOGIN' && (
                                        <div className="text-right">
                                            <button type="button" onClick={() => setMode('RESET')} className="text-xs text-brand-600 hover:underline">
                                                Şifremi unuttum?
                                            </button>
                                        </div>
                                    )}

                                    {mode === 'REGISTER' && (
                                        <div className="text-xs space-y-1 px-1">
                                            <p className={`flex items-center gap-1 ${hasMinLength ? 'text-green-600' : 'text-slate-400'}`}>
                                                <Check size={12} /> En az 8 karakter
                                            </p>
                                            <p className={`flex items-center gap-1 ${hasUpperCase ? 'text-green-600' : 'text-slate-400'}`}>
                                                <Check size={12} /> En az 1 büyük harf
                                            </p>
                                            <p className={`flex items-center gap-1 ${hasNumber ? 'text-green-600' : 'text-slate-400'}`}>
                                                <Check size={12} /> En az 1 rakam
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'LOGIN' ? 'Giriş Yap' : 'Üyeliği Tamamla')}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-fade-in">
                                <Check size={32} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Bağlantı Gönderildi!</h3>
                            <p className="text-sm text-slate-600 mb-6">E-posta kutunuzu kontrol edin.</p>
                            <button 
                                onClick={() => setMode('LOGIN')}
                                className="text-brand-600 font-bold hover:underline"
                            >
                                Giriş Ekranına Dön
                            </button>
                        </div>
                    )}

                    {/* Social Login - Sadece Login/Register modunda göster */}
                    {mode !== 'RESET' && !resetSent && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">veya</span>
                                </div>
                            </div>

                            <button 
                                type="button"
                                onClick={() => handleSocialLogin('Google')}
                                disabled={isLoading}
                                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google ile Giriş Yap
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
