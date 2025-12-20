
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Order, CustomRequest, Coupon } from '../types';
import { LogOut, Package, MapPin, User as UserIcon, Clock, Lock, CreditCard, Bell, ChevronRight, MessageSquare, X, ShoppingBag, Save, Plus, Trash2, ToggleLeft, ToggleRight, Check, Star, Ticket, Percent } from 'lucide-react';

interface ProfileProps {
    onGoHome: () => void;
    customRequests: CustomRequest[];
    orders: Order[];
    coupons: Coupon[]; // Props olarak kuponları al
    onCancelOrder: (id: string) => void;
    onReturnOrder: (id: string) => void;
}

type TabType = 'USER_INFO' | 'ADDRESS' | 'CARDS' | 'NOTIFICATIONS' | 'PASSWORD' | 'ORDERS' | 'OFFERS' | 'COUPONS';

export const Profile: React.FC<ProfileProps> = ({ onGoHome, customRequests, orders, coupons, onCancelOrder, onReturnOrder }) => {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('USER_INFO');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    // Mock States for Forms
    const [addressForm, setAddressForm] = useState({
        title: 'Ev Adresi',
        city: 'İstanbul',
        district: 'Kadıköy',
        address: 'Bağdat Caddesi, No: 123, Daire: 5',
        phone: '0555 123 45 67'
    });

    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        whatsapp: true
    });

    const [savedCards, setSavedCards] = useState([
        { id: 1, last4: '4242', holder: user?.user_metadata?.full_name || 'Kullanıcı', expiry: '12/25', type: 'Mastercard' },
        { id: 2, last4: '8899', holder: user?.user_metadata?.full_name || 'Kullanıcı', expiry: '09/26', type: 'Visa' }
    ]);

    if (!user) {
        onGoHome();
        return null;
    }

    const handleLogout = () => {
        signOut();
        onGoHome();
    };

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Adres bilgileriniz güncellendi.');
    };

    const handleSavePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            alert('Yeni şifreler eşleşmiyor!');
            return;
        }
        alert('Şifreniz başarıyla değiştirildi.');
        setPasswordForm({ current: '', new: '', confirm: '' });
    };

    const removeCard = (id: number) => {
        if(confirm('Kartı silmek istediğinize emin misiniz?')) {
            setSavedCards(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleOpenReview = (order: Order) => {
        setReviewOrder(order);
        setReviewModalOpen(true);
        setRating(5);
        setComment('');
    };

    const handleSubmitReview = () => {
        alert('Değerlendirmeniz için teşekkürler! Puanınız kaydedildi.');
        setReviewModalOpen(false);
        setReviewOrder(null);
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Teslim Edildi': return 'bg-green-100 text-green-700 border-green-200';
            case 'Baskı Aşamasında': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Kargoya Verildi': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'İptal Edildi': return 'bg-red-100 text-red-700 border-red-200';
            case 'İade Edildi': return 'bg-slate-200 text-slate-700 border-slate-300';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const MenuItem = ({ icon: Icon, label, tab }: { icon: any, label: string, tab: TabType }) => (
        <button 
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{label}</span>
            </div>
            <ChevronRight size={16} className={`text-slate-400 ${activeTab === tab ? 'text-brand-400' : ''}`} />
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                        <div className="p-6 border-b border-slate-100 text-center">
                            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mx-auto mb-4 text-2xl font-bold">
                                {user?.user_metadata?.full_name?.charAt(0) || 'K'}
                            </div>
                            <h2 className="font-bold text-slate-900">{user?.user_metadata?.full_name || 'Kullanıcı'}</h2>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        
                        <div className="p-4 space-y-1">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 px-3">Hesabım & Yardım</h3>
                            <MenuItem icon={UserIcon} label="Kullanıcı Bilgilerim" tab="USER_INFO" />
                            <MenuItem icon={MapPin} label="Adres Bilgilerim" tab="ADDRESS" />
                            <MenuItem icon={CreditCard} label="Kayıtlı Kartlarım" tab="CARDS" />
                            <MenuItem icon={Ticket} label="Kuponlarım" tab="COUPONS" /> {/* YENİ EKLENDİ */}
                            <MenuItem icon={Bell} label="Duyuru Tercihlerim" tab="NOTIFICATIONS" />
                            <MenuItem icon={Lock} label="Şifre Değişikliği" tab="PASSWORD" />
                        </div>

                        <div className="p-4 space-y-1 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 px-3">Siparişlerim</h3>
                            <MenuItem icon={Package} label="Sipariş Geçmişim" tab="ORDERS" />
                            <MenuItem icon={MessageSquare} label="Tekliflerim" tab="OFFERS" />
                        </div>

                        <div className="p-4 border-t border-slate-100">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Oturumu Kapat</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    
                    {/* User Info Content */}
                    {activeTab === 'USER_INFO' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-fade-in">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Kullanıcı Bilgileri</h2>
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900">{user?.user_metadata?.full_name || 'Kullanıcı'}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900">{user.email}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Kayıt Tarihi</label>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900">{user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Address Content */}
                    {activeTab === 'ADDRESS' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-fade-in">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Adres Bilgilerim</h2>
                            <form onSubmit={handleSaveAddress} className="max-w-2xl space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Adres Başlığı</label>
                                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                                            value={addressForm.title} onChange={e => setAddressForm({...addressForm, title: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                                            value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">İl</label>
                                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                                            value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
                                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                                            value={addressForm.district} onChange={e => setAddressForm({...addressForm, district: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Açık Adres</label>
                                    <textarea rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none" 
                                        value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2">
                                        <Save size={18} /> Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Coupons Content */}
                    {activeTab === 'COUPONS' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-fade-in">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">İndirim Kuponlarım</h2>
                            {coupons.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                                    <Ticket className="mx-auto text-slate-300 mb-2" size={48} />
                                    <p className="text-slate-500">Aktif kuponunuz bulunmuyor.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {coupons.map((coupon) => (
                                        <div key={coupon.id} className="relative overflow-hidden bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
                                            {/* Decorative Circle */}
                                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-r border-green-200"></div>
                                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-l border-green-200"></div>

                                            <div className="bg-green-100 text-green-600 p-3 rounded-full">
                                                <Percent size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-green-700 text-lg tracking-wide">{coupon.code}</h3>
                                                <p className="text-sm text-green-800 font-medium">{coupon.description}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {coupon.isUsed ? 'Kullanıldı' : 'Aktif • Sepette Kullanılabilir'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Saved Cards Content */}
                    {activeTab === 'CARDS' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Kayıtlı Kartlarım</h2>
                                <button className="text-sm font-bold text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                    <Plus size={16} /> Yeni Kart Ekle
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {savedCards.map(card => (
                                    <div key={card.id} className="relative bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
                                        <button 
                                            onClick={() => removeCard(card.id)}
                                            className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="flex justify-between items-start mb-6">
                                            <CreditCard size={28} className="opacity-80" />
                                            <span className="font-mono text-sm italic opacity-50">{card.type}</span>
                                        </div>
                                        <p className="font-mono text-xl tracking-widest mb-4">•••• •••• •••• {card.last4}</p>
                                        <div className="flex justify-between items-end text-xs opacity-80 uppercase">
                                            <span>{card.holder}</span>
                                            <span>{card.expiry}</span>
                                        </div>
                                    </div>
                                ))}
                                {/* Add Card Placeholder */}
                                <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50 transition-colors cursor-pointer min-h-[180px]">
                                    <Plus size={32} className="mb-2" />
                                    <span className="font-medium">Yeni Kart Ekle</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Content */}
                    {activeTab === 'NOTIFICATIONS' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-fade-in">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Duyuru Tercihlerim</h2>
                            <div className="space-y-4 max-w-xl">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Package size={20} /></div>
                                        <div>
                                            <p className="font-bold text-slate-900">E-posta Bildirimleri</p>
                                            <p className="text-xs text-slate-500">Sipariş durumu ve kampanyalar</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setNotifications({...notifications, email: !notifications.email})} className={`transition-colors ${notifications.email ? 'text-brand-600' : 'text-slate-400'}`}>
                                        {notifications.email ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><MessageSquare size={20} /></div>
                                        <div>
                                            <p className="font-bold text-slate-900">WhatsApp Bildirimleri</p>
                                            <p className="text-xs text-slate-500">Hızlı destek ve kargo takibi</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setNotifications({...notifications, whatsapp: !notifications.whatsapp})} className={`transition-colors ${notifications.whatsapp ? 'text-brand-600' : 'text-slate-400'}`}>
                                        {notifications.whatsapp ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Bell size={20} /></div>
                                        <div>
                                            <p className="font-bold text-slate-900">SMS Bildirimleri</p>
                                            <p className="text-xs text-slate-500">Anlık durum güncellemeleri</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setNotifications({...notifications, sms: !notifications.sms})} className={`transition-colors ${notifications.sms ? 'text-brand-600' : 'text-slate-400'}`}>
                                        {notifications.sms ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Password Change Content */}
                    {activeTab === 'PASSWORD' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-fade-in">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Şifre Değişikliği</h2>
                            <form onSubmit={handleSavePassword} className="max-w-md space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mevcut Şifre</label>
                                    <input type="password" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                                    <input type="password" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre (Tekrar)</label>
                                    <input type="password" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                        value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2">
                                        <Check size={18} /> Şifreyi Güncelle
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Orders Content */}
                    {activeTab === 'ORDERS' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900">Sipariş Geçmişim</h2>
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="bg-slate-50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center border-b border-slate-100">
                                        <div className="flex gap-6">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-medium">Tarih</p>
                                                <p className="text-sm font-semibold text-slate-900">{order.date}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-medium">Tutar</p>
                                                <p className="text-sm font-semibold text-slate-900">₺{order.total.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-medium">Durum</p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border mt-1 ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm font-mono text-slate-500">#{order.orderNumber}</p>
                                    </div>
                                    <div className="px-6 py-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <Package className="text-brand-600" size={24} />
                                                <p className="font-medium text-slate-900">{order.items} Adet Ürün</p>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-brand-600 hover:text-brand-700 font-bold text-sm hover:underline"
                                            >
                                                Sipariş Detayı
                                            </button>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                                            {order.status === 'Hazırlanıyor' && (
                                                <button onClick={() => onCancelOrder(order.id)} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                                    İptal Et
                                                </button>
                                            )}
                                            {order.status === 'Kargoya Verildi' && (
                                                <button className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1">
                                                    <MapPin size={12}/> Kargoyu Takip Et
                                                </button>
                                            )}
                                            {order.status === 'Teslim Edildi' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleOpenReview(order)}
                                                        className="px-4 py-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors flex items-center gap-1"
                                                    >
                                                        <Star size={12}/> Siparişi Değerlendir
                                                    </button>
                                                    <button onClick={() => onReturnOrder(order.id)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                                                        İade Et
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Offers Content */}
                    {activeTab === 'OFFERS' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900">Tekliflerim & Özel İsteklerim</h2>
                            {customRequests.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                                    <MessageSquare className="mx-auto text-slate-300 mb-2" size={48} />
                                    <p className="text-slate-500">Henüz bir özel isteğiniz bulunmuyor.</p>
                                </div>
                            ) : (
                                customRequests.map((req) => (
                                    <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900">Özel Tasarım İsteği</h3>
                                                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{req.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 line-clamp-2">{req.description}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${req.status === 'Teklif Verildi' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {req.status}
                                            </span>
                                        </div>

                                        {req.status === 'Teklif Verildi' && req.offerPrice && (
                                            <div className="mt-4 bg-brand-50 border border-brand-100 rounded-lg p-4 animate-fade-in">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-white p-2 rounded-full text-brand-600 shadow-sm">
                                                        <MessageSquare size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-brand-900 mb-1">Gelen Teklif</p>
                                                        <p className="text-2xl font-black text-brand-700 mb-2">₺{req.offerPrice}</p>
                                                        {req.offerNote && (
                                                            <p className="text-sm text-brand-800 bg-white/50 p-2 rounded border border-brand-100 mb-3">
                                                                "{req.offerNote}"
                                                            </p>
                                                        )}
                                                        <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors">
                                                            Teklifi Kabul Et & Sepete Ekle
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ORDER DETAIL MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">Sipariş Detayı</h3>
                                <p className="text-sm text-slate-500">#{selectedOrder.orderNumber}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {/* Products */}
                            <h4 className="font-bold text-sm uppercase text-slate-500 mb-4 flex items-center gap-2">
                                <ShoppingBag size={16}/> Ürünler
                            </h4>
                            <div className="space-y-4 mb-8">
                                {selectedOrder.orderItems?.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 border border-slate-100 p-3 rounded-xl">
                                        <img src={item.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                                        <div>
                                            <p className="font-bold text-slate-900">{item.productName}</p>
                                            <p className="text-xs text-slate-500">{item.variantInfo}</p>
                                            <p className="text-sm font-semibold text-brand-600 mt-1">{item.quantity} x ₺{item.unitPrice}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <h4 className="font-bold text-sm text-slate-900 mb-2">Teslimat Adresi</h4>
                                    <p className="text-sm text-slate-600">{selectedOrder.customerAddress}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <h4 className="font-bold text-sm text-slate-900 mb-2">Ödeme & Kargo</h4>
                                    <p className="text-sm text-slate-600 flex justify-between"><span>Yöntem:</span> <span className="font-medium">{selectedOrder.paymentMethod}</span></p>
                                    <p className="text-sm text-slate-600 flex justify-between"><span>Kargo:</span> <span className="font-medium">{selectedOrder.shippingCompany}</span></p>
                                    {selectedOrder.trackingNumber && (
                                        <p className="text-sm text-slate-600 flex justify-between mt-1 pt-1 border-t border-slate-200">
                                            <span>Takip No:</span> <span className="font-mono">{selectedOrder.trackingNumber}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Toplam Tutar</span>
                            <span className="text-2xl font-black text-slate-900">₺{selectedOrder.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* REVIEW MODAL */}
            {reviewModalOpen && reviewOrder && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                        <button 
                            onClick={() => setReviewModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"
                        >
                            <X size={24} />
                        </button>
                        
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">Siparişi Değerlendir</h3>
                        <p className="text-center text-slate-500 text-sm mb-6">
                            #{reviewOrder.orderNumber} numaralı sipariş deneyimini paylaş.
                        </p>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <Star 
                                        size={32} 
                                        fill={star <= rating ? "#fbbf24" : "none"} 
                                        className={star <= rating ? "text-amber-400" : "text-slate-300"}
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea 
                            className="w-full border border-slate-200 rounded-xl p-4 mb-6 outline-none focus:ring-2 focus:ring-brand-500 resize-none h-32"
                            placeholder="Ürün kalitesi, kargo süreci ve genel deneyimin hakkında ne düşünüyorsun?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <button 
                            onClick={handleSubmitReview}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            Değerlendirmeyi Gönder
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
