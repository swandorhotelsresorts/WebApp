# Otel Fiyat Yönetimi Dashboard

Bu depo, otel kontrat fiyatlarını farklı pazarlarla karşılaştırmak ve değişimlerini izlemek için hazırlanan statik dashboard uygulamasını içerir. Uygulama yalnızca istemci tarafında çalışır; tüm veriler tarayıcıdaki localStorage üzerinde tutulur.

## Geliştirme Ortamı

1. Depoyu klonlayın ve klasöre geçin.
2. Yerel bir HTTP sunucusu açarak `index.html` dosyasını servis edin.
   - Node.js yüklüyse `npx serve .` ya da `npx http-server .`
   - Python yüklüyse `python -m http.server`
3. Tarayıcıda `http://localhost:3000` (veya komutun gösterdiği port) adresine giderek uygulamayı görüntüleyin.

## Dağıtım (Deployment)

GitHub Pages üzerinden otomatik dağıtım yapılması için bir GitHub Actions iş akışı eklenmiştir.

- `main` branşına yapılan her push sonrası iş akışı tetiklenir.
- İş akışı `index.html`, `styles.css` ve `app.js` dosyalarını `dist/` klasörüne kopyalayarak statik site artefaktını oluşturur.
- Ardından bu artefakt GitHub Pages ortamına yüklenir ve yayınlanır.

Dağıtımı elle tetiklemek için GitHub Actions sekmesinden **Deploy dashboard to GitHub Pages** iş akışını seçip **Run workflow** butonuna basabilirsiniz.

## Dosya Yapısı

- `index.html` – Uygulamanın ana HTML iskeleti.
- `styles.css` – Dashboard bileşenlerinin stil tanımları.
- `app.js` – Veri modelleri, hesaplama motoru ve arayüz etkileşimleri.
- `.github/workflows/deploy.yml` – GitHub Pages dağıtım iş akışı.

## Lisans

Bu proje özel bir lisans belirtilmediği için varsayılan depoya özgü koşullarla kullanılabilir.
