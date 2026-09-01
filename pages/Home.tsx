
import React from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Printer, Layers, Box, Cloud, Star, Quote } from 'lucide-react';

interface HomeProps {
    products: Product[]; // Öne Çıkanlar (Featured)
    wishlistIds: number[];
    onProductSelect: (product: Product) => void;
    onToggleWishlist: (e: React.MouseEvent, product: Product) => void;
    onOpenCatalog: (title: string, products: Product[]) => void;
    onCustomOrderClick: () => void;
}

export const Home: React.FC<HomeProps> = ({ 
    products, 
    wishlistIds, 
    onProductSelect, 
    onToggleWishlist,
    onOpenCatalog,
    onCustomOrderClick
}) => {
    
    // Static Hero Content
    const HeroSection = () => (
        <div className="w-full relative h-[350px] sm:h-[450px] flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Cloud shapes / decorations */}
                <div className="absolute top-10 right-20 w-64 h-64 bg-pastel-pink rounded-full blur-3xl opacity-50 animate-float"></div>
                <div className="absolute bottom-10 left-20 w-80 h-80 bg-pastel-blue rounded-full blur-3xl opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
                <div className="max-w-3xl animate-fade-in py-8 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-brand-700 font-semibold mb-6 shadow-sm border border-white/50">
                        <Cloud size={20} className="fill-brand-200" />
                        <span>PrintShop Atölyesi</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 text-slate-900 leading-[1.1]">
                        Hayalinizdeki <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Tasarımlar</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl font-medium mx-auto">
                        Pamuk şekeri tadında tasarımlar, profesyonel 3D baskı kalitesiyle buluşuyor. 
                        Koleksiyonluk figürler ve özel hediyeler için doğru adres.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                        <button 
                            onClick={() => onOpenCatalog('Tüm Ürünler', products)}
                            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center text-lg hover:-translate-y-1"
                        >
                            Ürünleri İncele
                            <ArrowRight className="ml-2" size={22} />
                        </button>
                        <button 
                            onClick={onCustomOrderClick}
                            className="bg-white/60 hover:bg-white text-slate-800 font-bold py-3.5 px-8 rounded-2xl transition-all border border-white shadow-sm text-lg hover:-translate-y-1"
                        >
                            Özel Sipariş Ver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Collection Cards Data
    const collections = [
        { title: "Figür & Karakter", bg: "bg-brand-100/80 hover:bg-brand-100", category: "Figür" },
        { title: "Dekorasyon", bg: "bg-pastel-blue/80 hover:bg-pastel-blue", category: "Dekorasyon" },
        { title: "Yılbaşı Özel", bg: "bg-green-100/80 hover:bg-green-100", category: "Yılbaşı" },
        { title: "Kahve Temalı Ürünler", bg: "bg-[#f3f4e6] hover:bg-[#eaeed5]", category: "Kahve" }
    ];

    const handleCollectionClick = (collection: typeof collections[0]) => {
        const filtered = products.filter(p => p.categories.some(c => c.includes(collection.category) || collection.category === 'Figür')); 
        onOpenCatalog(collection.title, filtered.length > 0 ? filtered : products);
    };

    return (
        <div className="pb-20">
            {/* Main Hero Section */}
            <HeroSection />

            {/* Features Section - REDUCED HEIGHT (py-6 instead of py-10) */}
            <div className="bg-white/50 backdrop-blur-sm border-y border-white/50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 bg-white/60 p-3 rounded-2xl border border-white shadow-sm">
                            <div className="bg-brand-100 p-2.5 rounded-xl text-brand-600">
                                <Printer size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Endüstriyel Kalite</h3>
                                <p className="text-xs text-slate-500">Bambu Lab & SLA yazıcılar</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/60 p-3 rounded-2xl border border-white shadow-sm">
                            <div className="bg-pastel-blue p-2.5 rounded-xl text-blue-600">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Geniş Materyal</h3>
                                <p className="text-xs text-slate-500">PLA, PETG ve TPU</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/60 p-3 rounded-2xl border border-white shadow-sm">
                            <div className="bg-pastel-green p-2.5 rounded-xl text-green-600">
                                <Box size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Özenli Paketleme</h3>
                                <p className="text-xs text-slate-500">Kırılmaya karşı tam koruma</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW SECTION: Discover Collections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-slate-900">Koleksiyonları Keşfet</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {collections.map((col, idx) => (
                        <div 
                            key={idx}
                            onClick={() => handleCollectionClick(col)}
                            className={`${col.bg} aspect-[4/3] rounded-3xl flex items-center justify-center p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md border border-white/50 backdrop-blur-sm group`}
                        >
                            <h3 className="text-slate-800 font-bold text-center text-lg md:text-xl group-hover:text-slate-900 transition-colors">
                                {col.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">Öne Çıkan Ürünler</h2>
                        <p className="text-slate-500 mt-2 font-medium">PrintShop atölyesinin en çok tercih edilen tasarımları.</p>
                    </div>
                    <button 
                        onClick={() => onOpenCatalog('Tüm Ürünler', products)}
                        className="bg-white px-4 py-2 rounded-lg text-brand-600 font-bold hover:text-brand-700 hover:bg-brand-50 transition-colors hidden sm:block shadow-sm"
                    >
                        Tümünü Gör →
                    </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            isWishlisted={wishlistIds.includes(product.id)}
                            onToggleWishlist={onToggleWishlist}
                            onClick={onProductSelect} 
                        />
                    ))}
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="bg-brand-50/50 py-16 mb-8 rounded-3xl mx-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Müşterilerimiz Ne Diyor?</h2>
                        <p className="text-slate-500">Mutlu müşterilerimizin deneyimleri</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Elif Demir", comment: "Özel tasarım siparişim tam istediğim gibi geldi. İletişim harikaydı.", stars: 5 },
                            { name: "Can Yılmaz", comment: "Baskı kalitesi çok yüksek, katman izleri neredeyse görünmüyor.", stars: 5 },
                            { name: "Zeynep S.", comment: "Paketleme çok özenliydi, kırılmadan ulaştı. Teşekkürler!", stars: 4 }
                        ].map((review, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100 flex flex-col">
                                <div className="text-brand-300 mb-4"><Quote size={32} fill="currentColor" /></div>
                                <p className="text-slate-600 mb-6 flex-1 italic">"{review.comment}"</p>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                    <span className="font-bold text-slate-900">{review.name}</span>
                                    <div className="flex text-yellow-400">
                                        {Array.from({length: 5}).map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.stars ? "currentColor" : "none"} className={i < review.stars ? "" : "text-slate-200"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
