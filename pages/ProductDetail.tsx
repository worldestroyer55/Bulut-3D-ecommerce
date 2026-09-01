
import React, { useState, useEffect, useRef } from 'react';
import { Product, MaterialType, SizeType, VariantConfig, Review } from '../types';
import { ArrowLeft, Check, ShieldCheck, Truck, Clock, PlayCircle, X, Minus, Plus, ChevronLeft, ChevronRight, Video, Tag, Star, MessageCircle } from 'lucide-react';

interface ProductDetailProps {
    product: Product;
    onBack: () => void;
    onAddToCart: (product: Product, variant: VariantConfig, quantity: number) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart }) => {
    const [material, setMaterial] = useState<MaterialType>(product.availableMaterials?.[0] || 'PLA' as MaterialType);
    const [size] = useState<SizeType>(SizeType.MEDIUM); 
    const [color, setColor] = useState<string>(product.availableColors?.[0] || '#000000');
    const [price, setPrice] = useState<number>(product.basePrice);
    const [quantity, setQuantity] = useState<number | string>(1);
    
    // Reviews Ref for scrolling
    const reviewsRef = useRef<HTMLDivElement>(null);

    // Mock Reviews Data
    const mockReviews: Review[] = [
        { id: 1, userName: "Mert Y.", rating: 5, comment: "Baskı kalitesi inanılmaz! Detaylar çok net çıkmış.", date: "10 Kasım 2024" },
        { id: 2, userName: "Selin K.", rating: 4, comment: "Kargo biraz geç geldi ama paketleme çok iyiydi. Ürün harika.", date: "12 Kasım 2024" },
        { id: 3, userName: "Caner D.", rating: 5, comment: "Tam istediğim renkte geldi. Teşekkürler PrintShop!", date: "15 Aralık 2024" }
    ];
    
    // Gallery Logic
    const hasVideo = !!product.videoUrl;
    
    let galleryItems: { type: 'image' | 'video', url: string }[] = [];

    if (product.images && product.images.length > 0) {
        galleryItems = product.images.map(url => ({ type: 'image', url }));
    } else {
        galleryItems = [
            { type: 'image', url: product.imageUrl },
            { type: 'image', url: `https://picsum.photos/600/600?random=${product.id + 1}` },
            { type: 'image', url: `https://picsum.photos/600/600?random=${product.id + 2}` },
        ];
    }

    if (hasVideo) {
        galleryItems.push({ type: 'video', url: product.videoUrl! });
    }

    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (galleryItems[currentIndex]?.type === 'video' && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }, [currentIndex, galleryItems]);


    useEffect(() => {
        let modifier = 0;
        // RESIN removed
        if (material === MaterialType.ABS) modifier += 50;
        setPrice((product.basePrice  ?? 0)+ modifier);
    }, [material, product.basePrice]);

    const handleAddToCart = () => {
        const finalQty = typeof quantity === 'string' ? parseInt(quantity) || 1 : quantity;
        const variant: VariantConfig = {
            material,
            size,
            color,
            priceModifier: price - product.basePrice,
            stock: 99 
        };
        onAddToCart(product, variant, finalQty);
    };

    const increaseQty = () => {
        setQuantity(prev => (typeof prev === 'number' ? prev : parseInt(prev) || 1) + 1);
    };

    const decreaseQty = () => {
        setQuantity(prev => {
            const val = typeof prev === 'number' ? prev : parseInt(prev) || 1;
            return val > 1 ? val - 1 : 1;
        });
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setQuantity('');
        } else {
            const num = parseInt(val);
            if (!isNaN(num)) {
                setQuantity(num);
            }
        }
    };

    const handleQuantityBlur = () => {
        if (quantity === '' || quantity === 0) {
            setQuantity(1);
        }
    };

    const scrollToReviews = () => {
        reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
        return map[code] || map[code.toLowerCase()] || 'Özel Renk';
    };

    const nextSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(prev => (prev === galleryItems.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(prev => (prev === 0 ? galleryItems.length - 1 : prev - 1));
    };

    const currentItem = galleryItems[currentIndex];

    if (!currentItem) return null;

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-10">
                <button 
                    onClick={onBack}
                    className="flex items-center text-slate-500 hover:text-brand-600 transition-colors mb-6 group"
                >
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Ürünlere Dön
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image/Video Gallery Side */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group bg-black">
                            {currentItem.type === 'video' ? (
                                <video 
                                    ref={videoRef}
                                    src={currentItem.url}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                    muted={false}
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img 
                                    src={currentItem.url} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover transition-all duration-500"
                                />
                            )}
                            
                            {galleryItems.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    <button 
                                        onClick={prevSlide}
                                        className="bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg pointer-events-auto transition-transform hover:scale-110"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button 
                                        onClick={nextSlide}
                                        className="bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg pointer-events-auto transition-transform hover:scale-110"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {galleryItems.length > 1 && (
                            <div className="grid grid-cols-5 gap-2 sm:gap-4">
                                {galleryItems.map((item, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setCurrentIndex(i)}
                                        className={`aspect-square rounded-lg border overflow-hidden cursor-pointer transition-colors relative ${currentIndex === i ? 'border-brand-500 ring-2 ring-brand-500 ring-offset-2' : 'border-slate-200 hover:border-brand-400'}`}
                                    >
                                        {item.type === 'video' ? (
                                            <div className="w-full h-full bg-black flex items-center justify-center relative group">
                                                <div className="absolute inset-0 bg-slate-800 opacity-50"></div>
                                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                                    <div className="bg-red-600 text-white rounded-full p-1.5 shadow-sm">
                                                        <PlayCircle size={20} fill="currentColor" />
                                                    </div>
                                                </div>
                                                <Video className="text-white opacity-30 absolute bottom-1 right-1" size={12}/>
                                            </div>
                                        ) : (
                                            <img src={item.url} alt="Thumbnail" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Side */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {product.categories?.map((cat, idx) => (
                                    <span key={idx} className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                            
                            {/* Product Tags Display */}
                            {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {product.tags.map((tag, idx) => (
                                        <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Tag size={10} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 mb-2">{product.name}</h1>
                            
                            {/* Clickable Reviews Header */}
                            <div 
                                onClick={scrollToReviews}
                                className="flex items-center gap-4 text-sm text-slate-500 cursor-pointer hover:bg-slate-50 w-fit p-2 rounded-lg -ml-2 transition-colors"
                                title="Yorumları gör"
                            >
                                <div className="flex items-center text-yellow-500">
                                    {Array.from({length: 5}).map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "" : "text-slate-300"} />
                                    ))}
                                    <span className="text-slate-400 ml-2 font-medium">({product.reviewCount} Değerlendirme)</span>
                                </div>
                                <span>•</span>
                                <span className="text-green-600 font-medium">Stokta Var</span>
                            </div>
                        </div>

                        <div className="text-3xl font-bold text-slate-900 mb-8">
                           ₺{(price ?? 0).toFixed(2)}
                        </div>

                        {/* Configuration Form */}
                        <div className="space-y-6 flex-1">
                            
                            {/* Material Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Malzeme (Materyal)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {product.availableMaterials.map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMaterial(m)}
                                            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                                material === m 
                                                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500' 
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Renk: <span className="font-bold text-slate-900 ml-1">{getColorName(color)}</span> <span className="text-slate-400 font-normal">({color})</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {product.availableColors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                                                color === c ? 'border-brand-500 scale-110 shadow-md ring-2 ring-brand-200' : 'border-transparent hover:scale-105 hover:shadow-sm'
                                            }`}
                                            style={{ backgroundColor: c }}
                                            title={`${getColorName(c)} (${c})`}
                                        >
                                            {color === c && <Check size={16} className={c === 'white' || c === '#ffffff' ? 'text-black' : 'text-white'} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description Text */}
                            <div className="bg-slate-50 p-4 rounded-xl text-slate-600 text-sm leading-relaxed border border-slate-100">
                                {product.description}
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <ShieldCheck className="text-brand-600" size={18} />
                                    <span>Yüksek Kalite Baskı</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Truck className="text-brand-600" size={18} />
                                    <span>Güvenli Kargo</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock className="text-brand-600" size={18} />
                                    <span>3-5 İş Gününde Teslim</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                             
                             {/* Quantity Selector */}
                             <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <span className="font-medium text-slate-700">Adet</span>
                                <div className="flex items-center gap-4 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                                    <button 
                                        onClick={decreaseQty}
                                        className="p-2 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <input 
                                        type="number" 
                                        className="font-bold text-lg w-12 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        onBlur={handleQuantityBlur}
                                        min="1"
                                    />
                                    <button 
                                        onClick={increaseQty}
                                        className="p-2 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                             </div>

                             <button 
                                onClick={handleAddToCart}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                <span>Sepete Ekle</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-medium">
                                    ₺{((typeof quantity === 'number' ? quantity : parseInt(quantity) || 1) * (price ?? 0)).toFixed(2)}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div id="reviews" ref={reviewsRef} className="border-t border-slate-200 pt-12 pb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                        Değerlendirmeler <span className="text-slate-400 text-lg font-normal">({product.reviewCount})</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mockReviews.map((review) => (
                            <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold">
                                            {review.userName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{review.userName}</p>
                                            <div className="flex text-yellow-400">
                                                {Array.from({length: 5}).map((_, i) => (
                                                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-200"} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">{review.date}</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    "{review.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                        <button className="text-brand-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto">
                            Tüm Değerlendirmeleri Gör <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
