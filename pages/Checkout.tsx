
import React, { useState, useMemo } from 'react';
import { CartItem, CreditCardForm, AddressForm, MaterialType, Coupon } from '../types';
import { CreditCard, Truck, ShieldCheck, CheckCircle, UserPlus, LogIn, ArrowRight, ArrowLeft, ShoppingBag, Ticket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutProps {
    items: CartItem[];
    onPlaceOrder: (address: AddressForm, payment: CreditCardForm) => void;
    total: number;
    availableCoupons?: Coupon[]; // Kullanıcının sahip olduğu kuponlar
    onOpenAuth: () => void; // Prop to trigger auth modal
    onBack: () => void; // Prop for back navigation (Home)
    onBackToCart: () => void; // New prop for back to cart
}

// Renk kodlarını Türkçe isme çeviren yardımcı fonksiyon (Tekrar kullanım)
const getColorName = (code: string) => {
    const map: Record<string, string> = {
        '#ef4444': 'Kırmızı', 'red': 'Kırmızı',
        '#3b82f6': 'Mavi', 'blue': 'Mavi',
        '#22c55e': 'Yeşil', 'green': 'Yeşil',
        '#a855f7': 'Mor', 'purple': 'Mor',
        'gold': 'Altın', '#ffd700': 'Altın',
        'silver': 'Gümüş', '#c0c0c0': 'Gümüş',
        '#1e293b': 'Koyu Slate', 'black': 'Siyah', '#000000': 'Siyah',
        '#ffffff': 'Beyaz', 'white': 'Beyaz',
        '#94a3b8': 'Gri', 'gray': 'Gri',
        '#78350f': 'Kahverengi', 'brown': 'Kahverengi',
        '#ea580c': 'Turuncu', 'orange': 'Turuncu',
        'yellow': 'Sarı'
    };
    return map[code] || map[code.toLowerCase()] || code;
};

export const Checkout: React.FC<CheckoutProps> = ({ items, onPlaceOrder, total, availableCoupons = [], onOpenAuth, onBack, onBackToCart }) => {
    // States
    const [step, setStep] = useState<1 | 2>(1); // 1: Address, 2: Payment
    const [showAuthPrompt, setShowAuthPrompt] = useState(false); // New state for registration prompt
    
    // Coupon States
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState('');
    
    const [address, setAddress] = useState<AddressForm>({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        district: '',
        fullAddress: ''
    });
    const [payment, setPayment] = useState<CreditCardForm>({
        cardHolder: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        installments: 1
    });

    const { user } = useAuth();
    const isAuthenticated = !!user;

    // Calculate total quantity
    const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    // Calculate Final Total with Discount
    const discountAmount = appliedCoupon ? total * appliedCoupon.discountRate : 0;
    const finalTotal = total - discountAmount;

    // Dinamik Kargo Süresi Hesaplama
    const shippingEstimate = useMemo(() => {
        let days = 2; // Temel süre (Stoktan gönderim için min süre)
        
        // Ürün adedi arttıkça üretim/paketleme süresi artabilir
        const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);
        if (totalQty > 3) days += 1;
        if (totalQty > 10) days += 2;

        // Resin based calculation removed

        // Maksimum 7 günü geçmesin (veya gerçekçi bir üst sınır)
        return Math.min(days, 7);
    }, [items]);

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            setCouponError('Lütfen bir kupon kodu giriniz.');
            return;
        }

        // Kullanıcının sahip olduğu geçerli kuponları kontrol et
        const validCoupon = availableCoupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && !c.isUsed);
        
        if (validCoupon) {
            setAppliedCoupon(validCoupon);
            setCouponError('');
            setCouponCode('');
        } else {
            setAppliedCoupon(null);
            setCouponError('Geçersiz veya süresi dolmuş kupon kodu.');
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // If user is NOT logged in, prompt them to create an account
        if (!isAuthenticated) {
            setShowAuthPrompt(true);
        } else {
            // Already logged in, proceed
            setStep(2);
            window.scrollTo(0,0);
        }
    };

    const handleContinueAsGuest = () => {
        setShowAuthPrompt(false);
        setStep(2);
        window.scrollTo(0,0);
    };

    const handleCreateAccount = () => {
        setShowAuthPrompt(false);
        onOpenAuth(); // Trigger the main AuthModal in Register mode
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onPlaceOrder(address, payment);
    };

    // Helper for input formatting
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50 min-h-screen">
            
            {/* Header Navigation Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <button 
                    onClick={onBack}
                    className="flex items-center text-slate-500 hover:text-brand-600 transition-colors group"
                >
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Ana Sayfaya Dön
                </button>

                 <button 
                    onClick={onBackToCart}
                    className="flex items-center text-brand-600 hover:text-brand-700 font-medium transition-colors bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg"
                >
                    <ShoppingBag size={18} className="mr-2" />
                    Sepete Dön
                </button>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-8">Güvenli Ödeme</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: FORMS */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* STEP 1: ADDRESS */}
                    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-opacity ${step === 2 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step === 1 ? 'bg-brand-600' : 'bg-green-500'}`}>
                                {step === 1 ? '1' : <CheckCircle size={18} />}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Teslimat & Fatura Adresi</h2>
                        </div>

                        {step === 1 && !showAuthPrompt && (
                            <form onSubmit={handleAddressSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                        <input required type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white" 
                                            value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">E-posta (Sipariş Takibi İçin)</label>
                                        <input required type="email" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                            value={address.email} onChange={e => setAddress({...address, email: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                        <input required type="tel" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                            value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">İl</label>
                                            <input required type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                                value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
                                            <input required type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                                value={address.district} onChange={e => setAddress({...address, district: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Açık Adres</label>
                                    <textarea required rows={3} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none bg-white"
                                        value={address.fullAddress} onChange={e => setAddress({...address, fullAddress: e.target.value})} />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                                        Ödemeye Geç
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Account Creation Prompt Modal (Inline) */}
                        {showAuthPrompt && (
                            <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 animate-fade-in text-center">
                                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserPlus size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Hesap Oluşturmak İster misiniz?</h3>
                                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                    Siparişinizi takip etmek, geçmiş alışverişlerinizi görüntülemek ve kampanyalardan haberdar olmak için hesabınızı şimdi oluşturun.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button 
                                        onClick={handleCreateAccount}
                                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <UserPlus size={18} /> Hesap Oluştur
                                    </button>
                                    <button 
                                        onClick={handleContinueAsGuest}
                                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        Üye Olmadan Devam Et <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="text-sm text-slate-600 flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                <div>
                                    <p className="font-bold">{address.fullName}</p>
                                    <p>{address.city} / {address.district}</p>
                                </div>
                                <button onClick={() => setStep(1)} className="text-brand-600 font-medium hover:underline">Düzenle</button>
                            </div>
                        )}
                    </div>

                    {/* STEP 2: PAYMENT */}
                    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all ${step === 1 ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                         <div className="flex items-center gap-3 mb-6">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step === 2 ? 'bg-brand-600' : 'bg-slate-300'}`}>
                                2
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Ödeme Bilgileri</h2>
                        </div>
                        
                        {step === 2 && (
                            <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                {/* Simulated Card Visual */}
                                <div className="relative w-full max-w-sm mx-auto h-48 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 shadow-xl mb-6">
                                    <div className="flex justify-between items-start">
                                        <CreditCard size={32} className="opacity-80" />
                                        <span className="font-mono text-lg italic opacity-50">BANK</span>
                                    </div>
                                    <div className="mt-8">
                                        <p className="font-mono text-xl tracking-widest">{payment.cardNumber || '•••• •••• •••• ••••'}</p>
                                    </div>
                                    <div className="flex justify-between items-end mt-8">
                                        <div>
                                            <p className="text-xs opacity-70 uppercase">Kart Sahibi</p>
                                            <p className="font-medium uppercase tracking-wide">{payment.cardHolder || 'AD SOYAD'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs opacity-70 uppercase">SKT</p>
                                            <p className="font-medium">{payment.expiryDate || 'MM/YY'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Kart Üzerindeki İsim</label>
                                        <input required type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none uppercase bg-white"
                                            value={payment.cardHolder} onChange={e => setPayment({...payment, cardHolder: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Kart Numarası</label>
                                        <input required type="text" maxLength={19} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono bg-white"
                                            value={payment.cardNumber} onChange={e => setPayment({...payment, cardNumber: formatCardNumber(e.target.value)})} placeholder="0000 0000 0000 0000" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Son Kullanma (AA/YY)</label>
                                            <input required type="text" maxLength={5} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-center bg-white"
                                                value={payment.expiryDate} onChange={e => setPayment({...payment, expiryDate: formatExpiry(e.target.value)})} placeholder="MM/YY" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                                            <input required type="text" maxLength={3} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-center bg-white"
                                                value={payment.cvc} onChange={e => setPayment({...payment, cvc: e.target.value.replace(/\D/g,'')})} placeholder="123" />
                                        </div>
                                    </div>
                                </div>

                                {/* Installments */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h3 className="font-semibold mb-3 text-sm text-slate-900">Taksit Seçenekleri</h3>
                                    <div className="space-y-2">
                                        {[1, 3, 6, 9].map(inst => (
                                            <label key={inst} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300">
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="radio" 
                                                        name="installments" 
                                                        checked={payment.installments === inst}
                                                        onChange={() => setPayment({...payment, installments: inst})}
                                                        className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                                                    />
                                                    <span className="text-sm font-medium text-slate-700">{inst === 1 ? 'Tek Çekim' : `${inst} Taksit`}</span>
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">₺{(finalTotal / inst).toFixed(2)} / ay</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 hover:bg-brand-600 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                    <ShieldCheck size={20} />
                                    <span>{finalTotal.toFixed(2)} TL Öde</span>
                                </button>
                                <div className="flex justify-center gap-2 mt-4">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4 opacity-50" alt="Visa" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 opacity-50" alt="Mastercard" />
                                    <img src="https://iyzico.com/assets/images/content/logo.svg" className="h-4 opacity-50" alt="Iyzico" />
                                </div>
                            </form>
                        )}
                    </div>

                </div>

                {/* RIGHT COLUMN: SUMMARY */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
                        <h3 className="font-bold text-lg mb-4 text-slate-900">Sipariş Özeti</h3>
                        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                            {items.map(item => {
                                const colorName = getColorName(item.selectedVariant.color);
                                return (
                                    <div key={item.cartId} className="flex gap-3">
                                        <img src={item.product.imageUrl} className="w-12 h-12 rounded-lg object-cover border border-slate-100" alt="" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                                            <p className="text-xs text-slate-500">{colorName} • {item.selectedVariant.size} • {item.quantity} Adet</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">₺{((item.product.basePrice + item.selectedVariant.priceModifier) * item.quantity).toFixed(2)}</p>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* COUPON SECTION */}
                        <div className="border-t border-slate-100 py-4">
                            {!appliedCoupon ? (
                                <div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="İndirim Kodu"
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-500 bg-white text-slate-900"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                        />
                                        <button 
                                            onClick={handleApplyCoupon}
                                            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                                        >
                                            Uygula
                                        </button>
                                    </div>
                                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-100 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                                            <Ticket size={12}/> {appliedCoupon.code}
                                        </p>
                                        <p className="text-[10px] text-green-600">%{(appliedCoupon.discountRate * 100).toFixed(0)} İndirim Uygulandı</p>
                                    </div>
                                    <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:underline">Kaldır</button>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 pt-4 space-y-2">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Toplam Ürün</span>
                                <span>{totalItemCount} Adet</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Ara Toplam</span>
                                <span>₺{total.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>İndirim</span>
                                    <span>-₺{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Kargo</span>
                                <span className="text-green-600 font-medium">Ücretsiz</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100 mt-2">
                                <span>Toplam</span>
                                <span>₺{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs mt-6 flex items-start gap-2">
                            <Truck size={16} className="shrink-0 mt-0.5" />
                            <span>Tahmini Kargoya Veriliş: <span className="font-bold">{shippingEstimate} iş günü</span> içinde.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
