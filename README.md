# Mini Task Manager

Bu proje, kullanıcıların yalnızca kendi görevlerini oluşturup yönettiği, Supabase + Next.js tabanlı küçük bir görev yöneticisidir. Temel amaç, güvenli, sade ve anlaşılır bir iş akışı kurmaktır.

**Canlı demo:** https://mini-task-manager-ecetokgoezs-projects.vercel.app
**Kaynak kod:** https://github.com/EceTokgoez/mini-task-manager

> Demo kolay denenebilsin diye Supabase tarafında e-posta onayı kapalı tutuldu; kayıt olur olmaz uygulamayı kullanabilirsiniz. Üretimde bu ayar açık olmalıdır — kod her iki durumu da ele alıyor: `signUp` bir session döndürmezse kullanıcıya "e-postandaki linke tıkla" mesajı gösteriliyor.

---

## Özellikler

- E-posta/şifre ile kayıt, giriş, çıkış
- İş oluşturma: başlık, açıklama ve öncelik (düşük / orta / yüksek)
- Durum güncelleme: yapılacak / devam ediyor / tamamlandı
- İş silme — iki adımlı onay ile
- Durum ve öncelik filtresi; filtre durumu URL'de tutulur, link paylaşılabilir
- Yükleme iskeletleri ve hata durumları
- Mobil ve masaüstü uyumlu arayüz
- Form doğrulama — hem istemci hem sunucu tarafında
- **Her kullanıcı yalnızca kendi işlerine erişir** — uygulama kodunda ve veritabanı seviyesinde (RLS)

---

## Teknoloji seçimi

- Framework: Next.js 16 + App Router — Server Components ve Server Actions ile veri akışını tek yerde tutmak kolaylaştı.
- Dil: TypeScript — `status` ve `priority` gibi alanlar için tip güvenliği sağlar; derleme sırasında hataları yakalar.
- Veritabanı: Supabase (PostgreSQL) — Auth, veri tabanı ve RLS aynı ekosistemde çalışır.
- Kimlik doğrulama: Supabase Auth — `auth.uid()` ile RLS politikalarına doğrudan bağlanır.
- Stil: Tailwind CSS — ek UI kütüphanesi kurmadan hızlı, tutarlı arayüz üretmeyi sağlar.

Ek bağımlılık kullanılmadı; proje ölçeği için gerekli araçlar minimumda tutuldu.

---

## Projeyi yerelde çalıştırma

### Gereksinimler

- Node.js 20+
- npm
- Supabase projesi

### 1) Projeyi klonla ve bağımlılıkları kur

```bash
git clone https://github.com/EceTokgoez/mini-task-manager.git
cd mini-task-manager
npm install
```

### 2) Supabase projesini hazırla

1. [supabase.com](https://supabase.com) üzerine yeni proje oluştur.
2. SQL Editor bölümünü aç.
3. [supabase/migrations/0001_create_tasks.sql](supabase/migrations/0001_create_tasks.sql) dosyasının içeriğini çalıştır.

Bu migration şunları kurar:

- `public.tasks` tablosu
- `(user_id, created_at desc)` indeksi
- `updated_at` trigger'ı
- Row Level Security politikaları

### 3) Ortam değişkenlerini ekle

Kök dizinde yer alan `.env.example` dosyasını kopyala:

```bash
cp .env.example .env.local
```

Daha sonra dosyaya Supabase değerlerini yaz:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=xxxxx
```

Bu değerler Supabase panelindeki **Project Settings → API** bölümünden alınır.

> `service_role` anahtarı buraya yazılmaz. Bu anahtar RLS'i bypass eder ve güvenliği bozar.

### 4) Uygulamayı başlat

```bash
npm run dev
```

Sonra browser'ı şu adrese aç:

```text
http://localhost:3000
```

> Not: Supabase Auth'te e-posta onayı varsayılan olarak açıktır. Geliştirme sırasında hızlı test için **Authentication → Sign In / Providers → Email** altında "Confirm email" seçeneğini kapatabilirsin. Canlı demoda da bu ayar kapalı tutuldu.

---

## Canlı ortama alma (Vercel)

Proje Vercel'in ücretsiz planında yayında. Kurulum adımları:

### 1) Projeyi bağla

Vercel'de **Add New → Project** ile GitHub deposunu içe aktar. Next.js otomatik algılanıyor, ek build ayarı gerekmiyor.

### 2) Ortam değişkenlerini ekle

**Settings → Environment Variables** altında yereldekiyle aynı iki değişken:

| Key | Environments |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production, Preview, Development |

İki nokta önemli:

- **Tip olarak `Config` seçilmeli, `Secret` değil.** `NEXT_PUBLIC_` önekli değerler build sırasında tarayıcı paketine gömülür, yani zaten herkese açıktır; Vercel bu çelişki yüzünden `Secret` tipini reddediyor. Bu değerlerin açık olması bir sorun değil — veriyi koruyan RLS politikalarıdır.
- **Değişkenler build anında gerekli.** `NEXT_PUBLIC_` değerleri çalışma anında değil derleme anında gömüldüğü için, eksiklerse build [src/lib/supabase/env.ts](src/lib/supabase/env.ts) içindeki kontrolde durur. Bu bilinçli: eksik yapılandırmayla sessizce bozuk bir uygulama yayına çıkmasın.

### 3) Supabase'i canlı adrese göre ayarla

**Authentication → URL Configuration**:

- **Site URL**: Vercel'in verdiği üretim adresi
- **Redirect URLs**: aynı adres ve geliştirme için `http://localhost:3000`

Bu ayar yapılmazsa e-posta ile gönderilen bağlantılar `localhost` adresine gider.

### 4) Erişimi kontrol et

Vercel'de **Settings → Deployment Protection** varsayılan olarak açık gelebiliyor; açıkken deployment adresleri Vercel oturumu ister ve dışarıdan görüntülenemez. Demo herkese açık olacaksa bu ayar kapatılmalı.

---

## Temel teknik kararlar ve nedenleri

### 1) Server Actions kullanıldı

Veri işlemleri için ayrı bir route handler yerine Server Actions seçildi. Neden?

- form submit akışı doğrudan server tarafında ilerliyor
- API katmanı yazmaya gerek kalmıyor
- `fetch`/`response` tiplerini iki kez tanımlamak gerekmiyor
- App Router ile uyumlu ve sade bir yapı sunuyor

Örnek olarak görev oluşturma, listeleme, durum güncelleme ve silme işlemleri [src/actions/tasks.ts](src/actions/tasks.ts) içinde tanımlı.

### 2) Minimal veri modeli

Tek tablo yeterli görüldü: `tasks`. `profiles` gibi ayrı bir kullanıcı tablosu eklenmedi çünkü görev akışı için böyle bir soyutlama gerekli değildi. Kullanıcı ile görev ilişkisi `user_id` üzerinden kuruldu.

`status` ve `priority` alanları `enum` yerine `text + check constraint` olarak tasarlandı. Bu tercih neden yapıldı?

- yeni değer eklemek daha esnek
- migration yönetimi daha hafif
- enum değişiklikleri daha kırılgan oluyor

### 3) RLS, asıl güvenlik katmanı

Uygulama tarafında da kontrol var ama veri güvenliği asıl olarak veritabanında kuruldu. Bunun nedeni:

- kodda bir filtre unutulursa veri izolasyonu bozulur
- başka bir servis veya script aynı veritabanına eriştiğinde aynı koruma çalışmalıdır
- sadece UI tarafında kontrol etmek güvenli değildir

Bu yüzden RLS, güvenlik için nihai kural olarak kullanıldı.

### 4) Oturum doğrulamada `getUser()`, `getSession()` değil

[src/proxy.ts](src/proxy.ts) her istekte oturumu yeniliyor ve giriş durumuna göre yönlendirme yapıyor; asıl mantık [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts) içindeki `updateSession` fonksiyonunda. Burada bilinçli olarak `getUser()` kullanıldı:

- `getSession()` cookie'deki token'ı okur ve içeriğine güvenir
- `getUser()` token'ı Supabase'e gönderip doğrulatır

Cookie kullanıcı tarafından düzenlenebilir bir alandır. Sunucu tarafında yetkilendirme kararı verilecekse doğrulanmış olan kullanılmalı.

### 5) Filtre durumu URL'de tutuluyor

Filtreler `useState` yerine URL arama parametrelerinde saklanıyor ([src/components/tasks/TaskFilters.tsx](src/components/tasks/TaskFilters.tsx)):

- link paylaşılabilir ve yer imine eklenebilir ("yüksek öncelikli yapılacaklar" gibi)
- sayfa yenilendiğinde filtre kaybolmuyor
- filtreleme veritabanında yapılıyor; tüm kayıtları indirip istemcide ayıklamak gerekmiyor

Geçmişe her filtre değişiminde yeni kayıt yığılmaması için `router.push` değil `router.replace` kullanılıyor.

### 6) Hata ve yükleme durumları üç katmanda

- Beklenen hata: Action'ların `{ error }` dönüşü — boş başlık, bulunamayan iş veya geçersiz değer gibi kullanıcı düzeltilebilecek durumları yakalar.
- Beklenmedik hata: [error.tsx](src/app/%28dashboard%29/tasks/error.tsx) — sunucu ya da bağlantı hatalarında devreye girer.
- Yanlış adres: [not-found.tsx](src/app/not-found.tsx) — mevcut olmayan bir URL için özel durum sayfası sunar.

`getTasks` hata fırlatmak yerine `{ error }` döndürüyor; böylece liste yüklenemese bile sayfanın geri kalanı (form, filtreler) çalışmaya devam ediyor. `error.tsx` gerçekten beklenmedik durumlara ayrılmış oluyor.

Yükleme tarafında iki ayrı senaryo var: [loading.tsx](src/app/%28dashboard%29/tasks/loading.tsx) sayfaya ilk gelişte, `Suspense` ise sayfa açıkken filtre değiştiğinde iskelet gösteriyor. `Suspense`'e filtreden türeyen bir `key` verilmesinin sebebi bu — `key` olmasaydı fallback yalnızca ilk render'da görünürdü.

### 7) Doğrulama hem istemcide hem sunucuda

> Bu, görev tanımındaki bonus maddelerinden biriydi ("form doğrulama ve anlamlı hata mesajları — hem istemci hem sunucu tarafında") ve uygulandı.

HTML attribute'ları (`required`, `maxLength`, `type="email"`) kullanıcıya sunucuya gitmeden hızlı geri bildirim veriyor. Aynı kurallar Server Action içinde tekrar kontrol ediliyor, çünkü istemci tarafı kontroller tarayıcı araçlarından kaldırılabilir.

`priority` ve `status` gibi kapalı değer kümeleri için tip guard'ları kullanılıyor:

```ts
function isTaskPriority(value: string): value is TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value)
}
```

Server Action'lar dışarıdan çağrılabilen HTTP endpoint'leridir; select'ten gelmeyen bir değer (`curl` ile gönderilmiş olabilir) reddediliyor.

Giriş hatalarında "e-posta bulunamadı" yerine **"E-posta veya şifre hatalı"** gösteriliyor. Hangisinin yanlış olduğunu söylemek, kayıtlı e-postaların tek tek denenerek tespit edilmesine imkan verirdi.

### 8) Responsive tasarım ve erişilebilirlik

Arayüz mobil öncelikli yazıldı; Tailwind'in `sm:` kırılımı masaüstü düzenine geçiyor. Kayda değer birkaç karar:

- **Yüklenen font kullanılmıyordu.** `create-next-app` iskeleti `globals.css` içinde `font-family: Arial, Helvetica, sans-serif` bırakıyor, `layout.tsx` ise Geist'i yüklüyordu. Yani iki font dosyası indiriliyor, hiçbiri uygulanmıyordu. `font-family` CSS değişkenine bağlandı.
- **iOS'ta otomatik yakınlaştırma.** Safari, 16px'ten küçük yazıya sahip bir form alanına odaklanınca sayfayı yakınlaştırıyor ve geri çıkmıyor. Filtre `select`'leri mobilde `text-base`, `sm:` üstünde `text-sm`.
- **Dokunma alanları.** Durum seçici ve silme butonu metin boyutunda, yaklaşık 20px yüksekliğindeydi. Görünümü bozmadan iç boşlukları büyütüldü.
- **Kart düzeni.** İş kartında başlık ve rozetler mobilde alt alta (`flex-col`), `sm:` üstünde yan yana. Önceki `flex-wrap` + `justify-between` kombinasyonu, rozetler alt satıra kaydığında onları sola itiyordu.
- **Odak görünürlüğü.** Tarayıcının varsayılan odak halkası kaldırılan yerlerde yerine `focus:border` / `focus-visible:ring` konuldu; klavyeyle gezinme bozulmuyor.
- **Ekran okuyucu.** Görsel olarak gereksiz ama yapısal olarak gerekli başlıklar ve form etiketleri `sr-only` ile veriliyor; yükleme iskeletleri `aria-hidden`.

Ortak sayfa kabı [PageContainer](src/components/ui/PageContainer.tsx) içinde tutuluyor — genişlik sınırı ve kenar boşlukları dört sayfada (liste, hata, 404, yükleme) tek yerden yönetiliyor.

---

## RLS ve veri izolasyonu

Migration dosyası [supabase/migrations/0001_create_tasks.sql](supabase/migrations/0001_create_tasks.sql) içinde RLS açık ve politika yapısı aşağıdaki gibidir:

```sql
alter table public.tasks enable row level security;

create policy "Users can view their own tasks"
  on public.tasks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on public.tasks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks
  for delete
  to authenticated
  using (auth.uid() = user_id);
```

`using` kontrolü mevcut satıra erişimi belirler; `with check` ise işlem sonrası satırın doğru kullanıcıya ait olup olmadığını kontrol eder.

Özellikle `UPDATE` için her ikisi birlikte kullanılır. Yalnızca `using` varsa kullanıcı kendi işinin `user_id` alanını başka bir kullanıcıya çevirme riskine girer. `with check` bu davranışı engeller.

Kod tarafında da benzer mantık vardır: [src/actions/tasks.ts](src/actions/tasks.ts) içinde her sorgu `user_id` eşleşmesiyle çalışır. Bu, güvenlik için tek başına yeterli değildir; asıl koruyucu katman RLS'dir. Ama sorgu seviyesinde kullanıcı kimliğinin açıkça belirtilmesi, hangi verinin istendiğini okunur kılıyor ve `(user_id, created_at desc)` index'inin doğrudan kullanılmasını sağlıyor.

### RLS'in sessiz davranışı ve uygulamadaki karşılığı

Bu, RLS ile çalışırken en kolay gözden kaçan nokta: **RLS erişilemeyen satırı hata vermeden gizler.** Başka bir kullanıcının iş id'si ile UPDATE veya DELETE gönderildiğinde Supabase hata döndürmez — sadece hiçbir satır eşleşmez ve `error` alanı `null` gelir.

Bu kontrol edilmezse başarısız bir işlem kullanıcıya başarılı görünür. Bu yüzden mutasyon action'ları etkilenen satırı geri isteyip ayrıca kontrol ediyor:

```ts
const { data, error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId)
  .eq('user_id', user.id)
  .select('id')

if (error) return { error: 'İş silinemedi. Lütfen tekrar dene.' }
if (data.length === 0) return { error: 'İş bulunamadı.' }
```

`.select('id')` olmasaydı `data` boş dönerdi ve hiç eşleşme olup olmadığı anlaşılamazdı.

### RLS nasıl test edilir?

- İki farklı hesap oluştur
- Her hesap kendi işini oluştur
- Diğer hesapla o işin ID'si üzerinden update/delete dene
- Sonuç: yukarıdaki kontrol devreye girer ve "İş bulunamadı" döner

> Supabase SQL Editor üzerinden `service_role` ile çalışan sorgular RLS'i bypass eder. Bu nedenle politikaları doğrulamak için uygulama üzerinden gerçek kullanıcı akışı gerekir.

---

## Public /share/[token] için önerilen tasarım

Bu özellik kodda mevcut değildir; ancak bonus gereklilik olarak açıkça tanımlanmıştır ve güvenli bir şekilde uygulanabilir. Mevcut proje yalnızca giriş yapmış kullanıcının kendi işlerini yönetmesine odaklanır; bu nedenle public sayfa, mevcut sistemin dışında ayrı bir paylaşım katmanı ile eklenmelidir.

### Amaç

- giriş yapmamış biri paylaşılan listeyi görebilsin
- listeyi değiştiremesin, sadece okuma izni olsun
- `tasks` tablosuna doğrudan `anon` erişimi açılmasın
- paylaşım iptal edilebilir ve süresi dolabilir olsun

### Önerilen yaklaşım

Ayrı bir `task_shares` tablosu eklenir. Burada paylaşılan şey tek bir görev değil, bir kullanıcıya ait iş listesi / görev setidir.

```sql
create table public.task_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  share_token text not null unique,
  is_active boolean not null default true,
  expires_at timestamptz null,
  created_at timestamptz not null default now()
);
```

Bu modelde `anon` kullanıcıya doğrudan `tasks` tablosu `SELECT` izni verilmez. Bunun yerine, `share_token` doğrulayan bir fonksiyon veya server-side sorgu çalıştırılır. Bu sorgu yalnızca geçerli ve aktif paylaşım için izin verilen görevleri döndürür; `UPDATE` veya `DELETE` işlemi için ayrı yetki verilmez.

Sonuç olarak `/share/[token]` sayfası sadece okunur bir görünüm sunar. Arayüzde edit butonu gösterilmez ve mutasyon çağrıları hiç çalışmaz.

### RLS mantığı

Merkezi güvenlik kuralı şudur:

- `authenticated` kullanıcılar yalnızca kendi `tasks`'ına erişebilir
- `anon` kullanıcı sadece doğrulanmış ve aktif `share_token` ile erişebilir
- `tasks` tablosuna genel public `SELECT` açılmaz

Bu yaklaşım, “paylaşılan link herkes görebilsin” hedefini güvenli biçimde çözer.

---

## Tamamlamaya fırsat bulamadığım ya da kapsam dışı bıraktığım kısımlar

### Bilinçli olarak yapmadıklarım

Bunlar süre yetmediği için değil, projeye değer katmayacağına karar verdiğim için dışarıda kaldı:

- **`profiles` tablosu.** Görev; kullanıcı adı, avatar veya profil bilgisi istemiyor. `auth.users` ile `tasks` arasında doğrudan ilişki yeterliydi. Ara bir tablo, ihtiyaç olmadan bakım maliyeti getiren bir soyutlama olurdu.
- **Zod veya benzeri bir doğrulama kütüphanesi.** Doğrulanan alan sayısı az (başlık, açıklama, öncelik, durum) ve kuralları basit. Elle yazılan kontroller ve tip guard'ları aynı işi bağımlılık eklemeden yapıyor. Alan sayısı artsaydı tercih değişirdi.
- **UI kütüphanesi.** Bu ölçekte Tailwind yeterliydi; hazır bileşen seti, öğrenme ve paket maliyetine değmezdi.
- **Sayfalama.** Kişisel bir iş listesinde beklenen kayıt sayısı düşük. İhtiyaç doğduğunda mevcut `(user_id, created_at desc)` index'i sayfalamayı doğrudan destekliyor — yani karar geri alınabilir.
- **Kullanıcılar arası atama, paylaşım ve ekip özellikleri.** Görev tanımında açıkça kapsam dışı bırakılmıştı.

### Mevcut sürümün dışında kalanlar

Bunlar temel gereksinimlerin dışında kalan, çekirdek çalışır hale geldikten sonra sıraya girecek maddeler:

- **Public paylaşım sayfası (`/share/[token]`).** Tasarımı yukarıda anlatıldı; ayrı bir tablo, token üretimi ve `anon` rolü için ek politikalar gerektiriyor.
- **Supabase Realtime.** Başka bir oturumdaki değişikliklerin listeye canlı yansıması.
- **Son tarih (deadline) ve geciken işlerin vurgulanması.**
- **Görev düzenleme ekranı.** Şu an başlık ve açıklama oluşturulduktan sonra değiştirilemiyor; yalnızca durum güncelleniyor.
- **Testler ve CI.**

---

## Daha fazla vaktim olsaydı ne eklerdim

Yukarıdaki listeyi öncelik sırasına koyarsam:

1. **RLS için entegrasyon testi.** Projenin asıl iddiası veri izolasyonu; bunu her değişiklikte otomatik doğrulayan bir test, elle iki hesapla denemekten çok daha güvenilir. İlk sıraya bunu koymamın sebebi: kırıldığında en pahalı olan şey bu.
2. **Görev düzenleme.** Kullanıcının en çok isteyeceği eksik özellik; bir işi yanlış yazdığında silip yeniden oluşturması gerekiyor.
3. **Son tarih ve gecikme vurgusu.** Küçük bir kolon ekleme ve görsel bir işaret; maliyeti düşük, kullanım değeri yüksek.
4. **Public paylaşım sayfası.** RLS tarafı gerçek iş olduğu için önce yukarıdakileri bitirirdim.
5. **Supabase CLI ile migration yönetimi.** Şu an SQL dosyası panelden elle çalıştırılıyor; sürümlenmiş bir migration akışı ekip çalışmasında şart olurdu.
6. **`getTasks` için ayrı bir okuma modülü.** `'use server'` dosyasındaki her export bir HTTP endpoint'i haline geliyor. Okuma işlemlerini `actions/` dışına almak, mutasyonlarla okumalar arasında daha net bir sınır çizerdi. (RLS koruduğu için mevcut haliyle bir güvenlik açığı değil, bir tasarım tercihi.)

---

## Proje yapısı

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   └── tasks/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
│
├── actions/
│   ├── auth.ts
│   └── tasks.ts
│
├── components/
│   ├── auth/
│   ├── tasks/
│   └── ui/
│
├── lib/supabase/
│   ├── client.ts
│   ├── env.ts
│   ├── middleware.ts
│   └── server.ts
│
├── types/
│   └── task.ts
└── proxy.ts

supabase/
└── migrations/
    └── 0001_create_tasks.sql
```

### Neden bu yapı?

- **`actions/`** yalnızca veri işlemlerini barındırıyor. Yetkilendirme kontrollerinin nerede yapıldığı böylece tek bakışta görülüyor.
- **`(auth)` ve `(dashboard)`** parantezli klasörlerdir; URL'e yansımazlar. Yalnızca farklı layout vermek için kullanılıyorlar — auth sayfaları ortalanmış dar bir kutu, dashboard geniş bir sayfa.
- **`lib/supabase/`** altında üç ayrı istemci var çünkü cookie erişimi üç ortamda farklı: tarayıcı, Server Component/Action ve proxy.
- **`proxy.ts`** Next.js 16'da `middleware.ts` konvansiyonunun yerini aldı; eski isim deprecate edildiği için yeni ada geçildi. `lib/supabase/middleware.ts` ise bir konvansiyon dosyası değil, `updateSession` yardımcısını barındıran kendi modülümüz — Supabase belgeleriyle aynı adı taşısın diye adı korundu.
- **`types/task.ts`** `TASK_PRIORITIES` ve `TASK_STATUSES` sabitlerini tutuyor. Bu diziler hem select seçeneklerini üretmekte, hem tip türetmekte, hem de çalışma anı doğrulamasında kullanılıyor — değerler migration'daki `check` constraint'leriyle birebir aynı.
