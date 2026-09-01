import React, { useState, useMemo } from 'react';
import { Product, Order, Customer, CustomRequest, MaterialType } from '../types';
import { 
    LayoutDashboard, 
    Box, 
    ShoppingBag, 
    Users, 
    Plus, 
    Printer, 
    Moon, 
    TrendingUp, 
    Calculator,
    Trash2,
    MapPin,
    Phone,
    Sun,
    X,
    ImagePlus,
    Maximize2,
    Info,
    Edit2,
    ChevronLeft,
    ChevronRight,
    CheckSquare,
    Square,
    Search,
    Layers,
    ListChecks,
    Pencil,
    Tags,
    FileText,
    Palette,
    Settings2,
    Youtube,
    Video,
    Film,
    Zap,
    CircleDollarSign,
    Package,
    BarChart3,
    AlertCircle,
    MessageSquare,
    Mail,
    Eye,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
    RotateCcw,
    CreditCard,
    Save,
    Upload,
    Send,
    Tag,
    Download,
    History
} from 'lucide-react';

interface AdminPanelProps {
    products: Product[];
    orders: Order[];
    customers: Customer[];
    customRequests?: CustomRequest[];
    onAddProduct: (product: any) => void;
    onEditProduct: (product: any) => void;
    onDeleteProduct: (id: number) => void;
    onUpdateProductStock: (id: number, stock: number) => void;
    onBulkUpdateStock: (ids: number[], stockToAdd: number) => void;
    onUpdateOrderStatus: (id: string, newStatus: Order['status']) => void;
    onAddCustomer: (customer: Customer) => void;
    onUpdateCustomer: (customer: Customer) => void;
    onDeleteCustomer: (id: string) => void;
    onExit: () => void;
}

type AdminView = 'DASHBOARD' | 'PRODUCTS' | 'ORDERS' | 'CUSTOMERS' | 'CUSTOM_REQUESTS';

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
    products, 
    orders, 
    customers, 
    customRequests = [],
    onAddProduct, 
    onEditProduct,
    onDeleteProduct, 
    onUpdateProductStock, 
    onBulkUpdateStock,
    onUpdateOrderStatus, 
    onAddCustomer,
    onUpdateCustomer,
    onDeleteCustomer,
    onExit 
}) => {
    const [view, setView] = useState<AdminView>('DASHBOARD');
    const [darkMode, setDarkMode] = useState(false);
    const [isActiveOrdersModalOpen, setIsActiveOrdersModalOpen] = useState(false);
    const [isCriticalStockModalOpen, setIsCriticalStockModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = true as any; 
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
    const [selectedFilterTag, setSelectedFilterTag] = useState<string | null>(null);
    const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(null);
    const [quickStockAmount, setQuickStockAmount] = useState<number>(0);

    const [productForm, setProductForm] = useState<any>({
        name: '', 
        categories: [], 
        basePrice: 0, 
        costPrice: 0, 
        stock: 10, 
        barcode: '', 
        images: [], 
        videoUrl: '',
        tags: [], 
        description: '',
        shortDescription: '',
        availableColors: [],
        availableMaterials: []
    });

    const [colorsString, setColorsString] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [orderTab, setOrderTab] = useState<'ACTIVE' | 'HISTORY' | 'CANCELLED' | 'RETURNED'>('ACTIVE');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [customerForm, setCustomerForm] = useState<Partial<Customer>>({ fullName: '', phone: '', location: '', address: '' });
    const [viewingRequest, setViewingRequest] = useState<CustomRequest | null>(null);
    const [offeringRequest, setOfferingRequest] = useState<CustomRequest | null>(null);
    const [offerForm, setOfferForm] = useState({ price: '', note: '', image: '', video: '' });

    // --- LOGIC ---

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'images' | 'videoUrl') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (field === 'images') {
            const fileReaders: Promise<string>[] = [];
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                const promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                });
                reader.readAsDataURL(file);
                fileReaders.push(promise);
            });

            Promise.all(fileReaders).then(base64Images => {
                setProductForm((prev: any) => ({
                    ...prev, 
                    images: [...(prev.images || []), ...base64Images]
                }));
            });
        } else {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => setProductForm((prev: any) => ({ ...prev, videoUrl: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    const saveProduct = () => {
        if (!productForm.name) return;
        
        const colorsArray = colorsString.split(',').map(c => c.trim()).filter(c => c !== '');
        
        // KRİTİK: Veritabanındaki sütun isimlerine (snake_case) tam uyum sağlama
        const mappedProduct = {
            name: productForm.name,
            basePrice: Number(productForm.basePrice), // Sütun camelCase
            cost_price: Number(productForm.costPrice || 0), // Sütun snake_case
            stock: Number(productForm.stock || 0),
            barcode: productForm.barcode || '',
            description: productForm.description || '',
            short_description: productForm.shortDescription || '', // Sütun snake_case
            categories: productForm.categories || ['Genel'],
            tags: productForm.tags || [],
            images: productForm.images || [], // Sütun camelCase
            video_url: productForm.videoUrl || '', // Sütun snake_case
            availableMaterials: (productForm.availableMaterials && productForm.availableMaterials.length > 0) 
                ? productForm.availableMaterials 
                : ['PLA'], // Boş gitmemesi için
            available_colors: (colorsArray.length > 0) 
                ? colorsArray 
                : ['#000000'], // Boş gitmemesi için
            rating: 5,
            review_count: 0 // Sütun snake_case
        };

        if (editingProductId) {
            onEditProduct({ ...mappedProduct, id: editingProductId });
        } else {
            onAddProduct(mappedProduct);
        }
        setIsProductModalOpen(false);
    };

    const openEditProductModal = (product: any) => {
        setEditingProductId(product.id);
        // Veritabanındaki alt tireli isimleri formdaki camelCase'e geri çevirme
        setProductForm({
            name: product.name,
            basePrice: product.basePrice || 0,
            costPrice: product.cost_price || 0,
            stock: product.stock || 0,
            barcode: product.barcode || '',
            description: product.description || '',
            shortDescription: product.short_description || '',
            categories: product.categories || [],
            tags: product.tags || [],
            images: product.images || [],
            videoUrl: product.video_url || '',
            availableMaterials: product.availableMaterials || [],
            availableColors: product.available_colors || []
        });
        setColorsString(product.available_colors?.join(', ') || '');
        setIsProductModalOpen(true);
    };

    const openAddProductModal = () => {
        setEditingProductId(null);
        setProductForm({
            name: '', categories: ['Figür'], basePrice: 0, costPrice: 0, stock: 10,
            barcode: '', images: [], videoUrl: '', tags: [], description: '',
            shortDescription: '', availableColors: ['Siyah'], availableMaterials: ['PLA']
        });
        setColorsString('Siyah');
        setIsProductModalOpen(true);
    };

    // Diğer yardımcı fonksiyonlar (silme, etiket ekleme vb.) mevcuttaki gibi kalıyor...
    const handleAddTag = () => { if (!tagInput.trim()) return; setProductForm((prev:any) => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] })); setTagInput(''); };
    const handleRemoveTag = (tagToRemove: string) => { setProductForm((prev:any) => ({ ...prev, tags: (prev.tags || []).filter((t:any) => t !== tagToRemove) })); };
    const handleRemoveImage = (indexToRemove: number) => { setProductForm((prev: any) => ({ ...prev, images: (prev.images || []).filter((_: any, idx: number) => idx !== indexToRemove) })); };
    const toggleProductMaterial = (material: MaterialType) => { setProductForm((prev: any) => { const current = prev.availableMaterials || []; return { ...prev, availableMaterials: current.includes(material) ? current.filter((m: any) => m !== material) : [...current, material] }; }); };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || p.barcode?.includes(productSearchTerm);
            const matchesCategory = selectedCategory === 'Tümü' || p.categories.includes(selectedCategory);
            const matchesTag = selectedFilterTag === null || (p.tags && p.tags.includes(selectedFilterTag));
            return matchesSearch && matchesCategory && matchesTag;
        });
    }, [products, productSearchTerm, selectedCategory, selectedFilterTag]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const activeOrdersList = orders.filter(o => !['Teslim Edildi', 'İptal Edildi', 'İade Edildi'].includes(o.status));
    const criticalStockList = products.filter(p => (p.stock || 0) < 5);
    const inputClassName = `w-full p-2.5 rounded-lg border border-blue-200 text-sm outline-none transition-colors bg-blue-50 text-slate-900 placeholder-slate-400 focus:border-brand-500`;

    return (
        <div className={`flex min-h-screen font-sans ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
            {/* SIDEBAR */}
            <aside className={`w-64 border-r fixed h-full z-20 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`p-6 flex items-center gap-2 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <Printer size={24} />
                    <h1 className="text-xl font-bold">PrintShop</h1>
                    <button onClick={() => setDarkMode(!darkMode)} className="ml-auto p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    <button onClick={() => setView('DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'DASHBOARD' ? 'bg-blue-100 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutDashboard size={18} /> Genel Bakış</button>
                    <button onClick={() => setView('PRODUCTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'PRODUCTS' ? 'bg-blue-100 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}><Box size={18} /> Stok Yönetimi</button>
                    <button onClick={() => setView('ORDERS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${view === 'ORDERS' ? 'bg-blue-100 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}><ShoppingBag size={18} /> Siparişler</button>
                    <button onClick={onExit} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 mt-8"><TrendingUp size={18} className="rotate-180" /> Çıkış Yap</button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 p-8">
                {view === 'DASHBOARD' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl border shadow-sm"><p className="text-sm text-slate-500">Toplam Ciro</p><p className="text-2xl font-bold">₺{totalRevenue.toLocaleString()}</p></div>
                        <div className="bg-white p-6 rounded-xl border shadow-sm cursor-pointer" onClick={()=>setIsActiveOrdersModalOpen(true)}><p className="text-sm text-slate-500">Aktif Siparişler</p><p className="text-2xl font-bold">{activeOrdersList.length}</p></div>
                        <div className="bg-white p-6 rounded-xl border shadow-sm cursor-pointer" onClick={()=>setIsCriticalStockModalOpen(true)}><p className="text-sm text-slate-500">Kritik Stok</p><p className="text-2xl font-bold text-red-500">{criticalStockList.length}</p></div>
                    </div>
                )}

                {view === 'PRODUCTS' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Stok Yönetimi</h2>
                            <button onClick={openAddProductModal} className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16}/> Yeni Ürün</button>
                        </div>
                        <div className="bg-white rounded-xl border overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b">
                                    <tr><th className="p-4">Ürün</th><th className="p-4">Stok</th><th className="p-4">Fiyat</th><th className="p-4 text-right">İşlem</th></tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(p => (
                                        <tr key={p.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => openEditProductModal(p)}>
                                            <td className="p-4 flex items-center gap-3">
                                                <img src={p.images?.[0] || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded object-cover" />
                                                <span className="font-medium">{p.name}</span>
                                            </td>
                                            <td className="p-4">{p.stock}</td>
                                            <td className="p-4">₺{p.basePrice}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={(e)=>{e.stopPropagation(); openEditProductModal(p)}} className="p-2 text-slate-500 hover:text-slate-800"><Pencil size={18}/></button>
                                                <button onClick={(e)=>{e.stopPropagation(); onDeleteProduct(p.id)}} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* PRODUCT MODAL */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 bg-[#d0e8f2] flex justify-between items-center">
                            <h3 className="font-bold text-xl">{editingProductId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
                            <button onClick={()=>setIsProductModalOpen(false)}><X size={24}/></button>
                        </div>
                        <div className="p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8 text-slate-900">
                            <div className="space-y-4">
                                <div><label className="block text-sm font-bold mb-1">Ürün Adı</label><input className={inputClassName} value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})}/></div>
                                <div><label className="block text-sm font-bold mb-1">Satış Fiyatı (TL)</label><input type="number" className={inputClassName} value={productForm.basePrice} onChange={e=>setProductForm({...productForm, basePrice: e.target.value})}/></div>
                                <div><label className="block text-sm font-bold mb-1">Stok</label><input type="number" className={inputClassName} value={productForm.stock} onChange={e=>setProductForm({...productForm, stock: e.target.value})}/></div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Görseller</label>
                                    <input type="file" multiple accept="image/*" onChange={(e)=>handleFileUpload(e, 'images')} className="mb-2 text-xs" />
                                    <div className="flex gap-2 flex-wrap">
                                        {productForm.images?.map((img:any, i:number)=>(
                                            <div key={i} className="relative w-16 h-16 border rounded overflow-hidden">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button onClick={()=>handleRemoveImage(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"><X size={10}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div><label className="block text-sm font-bold mb-1">Kısa Açıklama</label><input className={inputClassName} value={productForm.shortDescription} onChange={e=>setProductForm({...productForm, shortDescription: e.target.value})}/></div>
                                <div><label className="block text-sm font-bold mb-1">Renkler (Virgülle Ayırın)</label><input className={inputClassName} value={colorsString} onChange={e=>setColorsString(e.target.value)} placeholder="Siyah, Beyaz, Mavi" /></div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Materyaller</label>
                                    <div className="flex gap-2">
                                        {['PLA', 'ABS', 'PETG', 'TPU'].map((m: any) => (
                                            <button key={m} onClick={() => toggleProductMaterial(m)} className={`px-3 py-1 rounded-full text-xs font-bold border ${productForm.availableMaterials?.includes(m) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{m}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                            <button onClick={()=>setIsProductModalOpen(false)} className="px-6 py-2 border rounded-lg">İptal</button>
                            <button onClick={saveProduct} className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};