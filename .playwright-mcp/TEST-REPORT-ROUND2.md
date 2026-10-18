# Playwright MCP — ikinci test turu

18 Ekim 2026. Güncel çalışma ağacının kopyası Chromium üzerinden test edildi. Yeni Notlar özelliğine ağırlık verildi. Frontend 5181, backend 4011 portunda; ayrı, geçici SQLite veritabanıyla çalıştırıldı. Önceden çalışan 5173/4000 servislerine ve mevcut kullanıcı verilerine dokunulmadı. Uygulama kaynakları değiştirilmedi.

## Doğrulanan sorunlar

### 1. Not tarihi düzenlenince liste yeniden sıralanmıyor — P2

Kaynak: `frontend/src/NotesPage.jsx:135`.

1. 1 Ekim tarihli “İLK YATIRIM” ve 18 Ekim tarihli “Sonraki çekim” notlarını oluşturun.
2. İlk notun tarihini 19 Ekim olarak değiştirip kaydedin.
3. Ekranda 18 Ekim notu üstte kalıyor; sayfayı yenileyip Notlar'a dönünce 19 Ekim notu üste geliyor.

Oluşturmada ve backend listesinde kullanılan azalan tarih sırası, düzenlemeden hemen sonra korunmuyor. [Ekran görüntüsü](round2-note-order-before.png).

### 2. Not API'si imkânsız takvim tarihini kabul ediyor — P2

Kaynak: `backend/src/routes/notes.js:40`.

Oturumlu Playwright API isteğiyle `POST /api/notes` gövdesinde `{"title":"İmkansız takvim tarihi","date":"2026-02-31"}` gönderildi. Beklenen geçersiz tarih hatası yerine 201 döndü ve yanıtın `note.date` alanı `2026-02-31` oldu. Test kaydı sonrasında silindi. Tarih doğrulaması biçimi kontrol ediyor, ayın gerçek gün sayısını doğrulamıyor. Bu bulgu doğrudan API üzerinden üretildi; tarayıcının tarih alanından bu değerin girilebildiği iddia edilmiyor.

### 3. Raporlar ekranındaki 320 px taşma devam ediyor — P2

Kaynak: `frontend/src/styles.css:2175` ve `.reports-filters` stilleri.

320 px görünümde boş Raporlar ekranı belge genişliği 352 px oluyor. Sağdaki filtreler dışarı taşıyor. 375 px ve denenen daha büyük genişliklerde sayfa genelinde yatay taşma ölçülmedi. [Ekran görüntüsü](round2-reports-320.png).

## Başarılı kontroller

- UI kayıt, otomatik oturum, çıkış ve tekrar giriş; notların tekrar girişten sonra korunması.
- Boş Notlar ekranı; not oluşturma ve ilk oluşturmadaki tarih sırası.
- Not düzenleme, düzenlemeden vazgeçme, silmeyi iptal etme ve onaylayarak silme.
- Türkçe büyük/küçük harfle başlık arama ve tür filtresi.
- Nota kategori bağlama; kategori silindiğinde notun korunup API'de bağlantısının null olması.
- Simüle edilen 500 kayıt hatasının gösterilmesi, form girdisinin korunması ve hata kaldırılınca yeniden kaydetme.
- Oturumsuz not listesi 401; başka kullanıcının notuna PATCH/DELETE 403; ikinci kullanıcının not listesinin boş olması.
- Başkasının kategorisine not bağlama girişiminin 400 ile reddi.
- Kısa başlık, geçersiz tür ve yanlış tarih biçiminin 400 ile reddi.
- Notlar, Raporlar ve Genel Bakış için 320, 375, 639, 641, 819, 821, 1059, 1061 ve 1440 px yatay taşma ölçümü. Yalnızca yukarıdaki Raporlar sorunu bulundu. Notlar'ın 320 px ekran görüntüsü ayrıca incelendi.
- `frontend` içinde `npm run build` başarılı.
- `backend/src/routes/notes.js` ve `backend/src/index.js` için `node --check` başarılı; bu kontroller işlevsel test yerine geçmez.

## Kapsam sınırları

Tek tarayıcı motoru kullanıldı. Bu tur tüm önceki portföy/piyasa senaryolarının tekrarı değildir; yeni Notlar akışı ve mobil regresyona odaklandı. Docker, mevcut veritabanında şema geçişi, tam klavye erişilebilirliği ve tüm sınır değerleri test edilmedi. Bulunan sorunlara bu test görevinde düzeltme uygulanmadı.
