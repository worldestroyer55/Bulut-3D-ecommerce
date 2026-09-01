@echo off
title PrintShop - E-Commerce Web Site - Uygulama Baslatici
color 0b

echo ===========================================
echo    PRINTSHOP E-COMMERCE WEB SITE BASLATILIYOR
echo ===========================================

:: 1. Node_modules kontrolü
if not exist node_modules (
    echo [!] Kutuhaneler eksik görünüyor. Yukleme baslatiliyor...
    call npm install
    if %errorlevel% neq 0 (
        echo [X] Kutuhane yuklemede hata olustu! Lutfen internet baglantinizi kontrol edin.
        pause
        exit /b
    )
)

:: 2. Uygulamayı baslat
echo [OK] Uygulama yerel sunucuda baslatiliyor...
echo [TIP] Tarayicinizda http://localhost:5173 adresini acin.
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo [X] Uygulama baslatilirken bir hata olustu.
    echo [TIP] Hata mesajini yukarida gorebilirsiniz.
    pause
)

pause