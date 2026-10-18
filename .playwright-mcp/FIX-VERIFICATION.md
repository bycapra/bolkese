# Düzeltme doğrulaması — 18 Ekim 2026

Playwright MCP / Chromium; güncel kaynakların geçici kopyası, ayrı SQLite, frontend 5181 ve backend 4011. Mevcut kullanıcı verileri kullanılmadı.

- Not tarihi ileri/geri değiştirildiğinde liste anında doğru sıraya geçti. Yenileme sonrası sıra aynı kaldı.
- POST ve PATCH için 2026-02-31, 2026-02-29, 1900-02-29, 2026-04-31, geçersiz ay/gün, sıfır yılı ve yanlış tarih biçimi 400 / “Geçersiz tarih.” döndürdü. Reddedilen PATCH mevcut kaydı değiştirmedi.
- 2024-02-29 ve 2000-02-29 dahil beş geçerli tarih oluşturma/güncellemede kabul edildi.
- Notlar ve Raporlar 320, 375, 639, 641, 819, 821, 1059, 1061, 1440 px genişliklerde kontrol edildi. Sayfa yatay taşması ve ekran dışına çıkan filtre alanı yok.
- 320 px dolu Raporlar ekranında tarih/yön filtresi çalıştı; taşma yok. Tablonun kendi yatay kaydırması korundu.
- Kayıt/giriş/çıkış, kullanıcı izolasyonu, oturumsuz 401 ve başkasının notuna PATCH/DELETE 403 kontrolleri geçti.
- Ayrı test kaydıyla varlık oluşturma, miktar güncelleme, silme ve TRY fiyat sabiti geçti.
- `npm run build`, `node --check backend/src/routes/notes.js` ve `git diff --check` başarılı. Sözdizimi kontrolü işlevsel test yerine geçmez.

Kanıtlar: [Boş rapor / 320 px](fixed-reports-320.png), [dolu rapor / 320 px](fixed-reports-filled-320.png), [Notlar / 320 px](fixed-notes-320.png).

Sınır: Tek tarayıcı motoru kullanıldı. Eski geçersiz tarihli veriler değiştirilmedi; doğrulama yeni oluşturma ve tarih güncellemelerini korur. Mevcut çalışan uygulamanın backend sürecine müdahale edilmedi.
