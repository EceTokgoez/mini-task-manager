# Mini Task Manager

Bu proje, kullanıcıların yalnızca kendi görevlerini oluşturup yönettiği, Supabase + Next.js tabanlı küçük bir görev yöneticisidir. Temel amaç, güvenli, sade ve anlaşılır bir iş akışı kurmaktır.

**Canlı demo:** https://mini-task-manager-ecetokgoezs-projects.vercel.app
**Kaynak kod:** https://github.com/EceTokgoez/mini-task-manager

> Demo kolay denenebilsin diye Supabase tarafında e-posta onayı kapalı tutuldu; kayıt olur olmaz uygulamayı kullanabilirsiniz.

---

## Özellikler

- E-posta/şifre ile kayıt, giriş, çıkış
- İş oluşturma: başlık, açıklama ve öncelik (düşük / orta / yüksek)
- Durum güncelleme: yapılacak / devam ediyor / tamamlandı
- İş silme — iki adımlı onay ile
- Son tarih ve geciken işlerin görsel olarak vurgulanması
- Durum ve öncelik filtresi; filtre durumu URL'de tutulur, link paylaşılabilir
- Salt-okunur paylaşım linki: giriş yapmamış biri listeyi görebilir, değiştiremez
- Realtime: başka bir sekmede yapılan değişiklik listeye anında yansır
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
3. [supabase/migrations](supabase/migrations) içindeki dosyaları numara sırasıyla çalıştır:

- [0001_create_tasks.sql](supabase/migrations/0001_create_tasks.sql) — `tasks` tablosu, index, trigger ve RLS politikaları
- [0002_add_task_due_date.sql](supabase/migrations/0002_add_task_due_date.sql) — `due_date` alanı
- [0003_add_task_shares.sql](supabase/migrations/0003_add_task_shares.sql) — `task_shares` tablosu ve paylaşılan liste mantığı
- [0004_add_share_validity_check.sql](supabase/migrations/0004_add_share_validity_check.sql) — token doğrulama fonksiyonu
- [0005_enable_realtime.sql](supabase/migrations/0005_enable_realtime.sql) — Realtime aktivasyonu

Sıra önemli; sonraki dosyalar öncekilerin oluşturduğu nesnelere dayanıyor.

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

> Not: Supabase Auth'te e-posta onayı varsayılan olarak açıktır. Geliştirme sırasında hızlı test için "Confirm email" seçeneğini kapatabilirsin. Canlı demoda da bu ayar kapalı tutuldu.

---

## Canlı ortama alma (Vercel)

Proje Vercel'in ücretsiz planında yayında. Kurulum adımları:

### 1) Projeyi bağla

Vercel'de **Add New → Project** ile GitHub deposunu içe aktar. Next.js otomatik algılanıyor, ek build ayarı gerekmiyor.

### 2) Ortam değişkenlerini ekle

**Settings → Environment Variables** altında aşağıdaki iki değer mutlaka eklenmeli:

- `NEXT_PUBLIC_SUPABASE_URL` — Production, Preview, Development
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Production, Preview, Development

Önemli notlar:

- `NEXT_PUBLIC_` değerleri `Config` olarak eklenmeli; `Secret` olarak değil. Bu değerler build sırasında istemci tarafına gömülür ve doğal olarak herkese açıktır; güvenlik sorumluluğu RLS ile sağlanır.
- Bu değişkenler build anında gerekli. Eksikse uygulama derlenmez ve [src/lib/supabase/env.ts](src/lib/supabase/env.ts) içinde hata verir.

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

Veri işlemleri için ayrı API katmanı kurmak yerine Server Actions seçildi. Bu sayede form submit akışı doğrudan sunucuya gider; `fetch`/`response` boilerplate'i azalır ve App Router ile uyumlu bir yapı elde edilir.

### 2) Minimal veri modeli

Tek tablo yeterli göründü: `tasks`. `profiles` gibi ekstra kullanıcı tablosu eklenmedi; kullanıcı ile görev ilişkisi `user_id` üzerinden kuruldu. `status` ve `priority` alanları `enum` yerine `text + check constraint` olarak tasarlandı; böylece değerler daha esnek ve migration yönetimi daha hafif kalıyor.

### 3) RLS, asıl güvenlik katmanı

Uygulama tarafında da kontrol var ama asıl güvenlik veritabanında kuruldu. Kodda bir filtre unutulsa bile Supabase RLS, başka kullanıcıların verisine erişimi engeller. Bu yüzden güvenlik için nihai kural RLS oldu.

### 4) `getUser()` kullanıldı

Oturum doğrulamasında `getSession()` yerine `getUser()` tercih edildi. `getSession()` cookie'den okur ve güveni zayıflattığı için, sunucu tarafında yetkilendirme kararı verilecekse doğrulanan kullanıcı kullanılmalı.

### 5) Filtreler URL'de tutuluyor

Filtreler `useState` yerine URL arama parametrelerinde saklanıyor. Bu sayede link paylaşılabilir, sayfa yenilense bile filtre korunur ve veritabanında filtreleme yapılır.

### 6) Hata ve yükleme akışı net ayrıldı

Beklenen hatalar action içinde `{ error }` olarak döner; beklenmedik hatalar [error.tsx](src/app/%28dashboard%29/tasks/error.tsx) üzerinden yakalanır. Yükleme sürecinde [loading.tsx](src/app/%28dashboard%29/tasks/loading.tsx) ve `Suspense` ayrı amaçlara hizmet eder.

### 7) Doğrulama hem istemcide hem sunucuda

HTML kontrolleri hızlı geri bildirim verir; Server Action içinde aynı kurallar tekrar kontrol edilir. Bu, istemci tarafı manipülasyonlarını önler ve güvenli davranışı sağlar.

### 8) Responsive ve erişilebilir tasarım

Mobil öncelikli tasarım, `sm:` kırılmaları ve `focus-visible` / `sr-only` kullanımları ile arayüz hem görsel olarak sade hem de erişilebilir kaldı.

### 9) Son tarih için `date` tipi seçildi

`due_date` alanı saat değil gün bazlı tutuluyor. Bu sayede zaman dilimi farkından kaynaklı yanlış tarih görünümü önleniyor.

### 10) Realtime için dikkatli kurulum yapıldı

Realtime aboneliği sadece oturum hazırlandıktan sonra başlatılıyor; aksi halde token eksikliği nedeniyle olaylar gelmiyor. Ayrıca `replica identity full` ayarı, güncelleme ve silme olaylarının gelmesini sağlar.

### 11) Durum seçicide `useOptimistic` kullanıldı

Durum değişimi anında tepki vermeli; sunucu geri çevirdiğinde ise değer kendiliğinden eski haline dönmeli. Bu yüzden `useOptimistic` tercih edildi.

---

## RLS ve veri izolasyonu

RLS, asıl güvenlik katmanı olarak kullanıldı. [supabase/migrations/0001_create_tasks.sql](supabase/migrations/0001_create_tasks.sql) içinde her kullanıcı yalnızca kendi `tasks` satırlarına erişebilir. `user_id = auth.uid()` kontrolü hem `SELECT`, hem `INSERT`, hem `UPDATE`, hem `DELETE` için uygulanıyor.

Bu önemli çünkü UI tarafında bir kontrol unutulsa bile veritabanı erişimi engellenir. Ayrıca action'lar da `eq('user_id', user.id)` kontrolü yapıyor; böylece arayüzdeki hata ile veritabanı güvenliği birlikte çalışır.

`UPDATE` politikasında `using` ve `with check` birlikte kullanıldı, çünkü ikisi farklı anı kontrol ediyor: `using` kullanıcının hangi mevcut satıra dokunabileceğine, `with check` değişiklikten **sonra** oluşan satırın hâlâ ona ait olup olmadığına bakıyor. Yalnızca `using` olsaydı kullanıcı kendi görevinin `user_id` alanını başkasına çevirebilirdi — değişiklikten önceki satır kendisinin olduğu için `using` buna izin verirdi. `INSERT` politikasında ise yalnızca `with check` var; ortada kontrol edilecek mevcut bir satır yok.

RLS'i test etmek için en güvenilir yöntem iki farklı kullanıcı açıp bir başkasının görevi silmeye veya güncellemeye çalışmaktır. Bu durumda Supabase sessizce boş sonuç döner; uygulama tarafında da "İş bulunamadı" hatası gösterilir.

> `service_role` ile SQL Editor üzerinden yapılan sorgular RLS'i bypass eder. Bu yüzden doğrulama her zaman gerçek kullanıcı akışı ile yapılmalı.

---

## Public paylaşım sayfası ve `anon` politikaları

Bu bonus özellik, giriş yapmamış bir kullanıcıya salt-okunur liste gösterme mantığıyla hazırlandı. Asıl kural basit: `tasks` tablosuna doğrudan `anon` erişimi açılmaz; erişim sadece doğrulanmış token üzerinden yapılır.

`task_shares` tablosu kullanıcıya ait aktif paylaşım linkini tutar; `share_token` değeri `gen_random_uuid()` ile veritabanında üretiliyor, yani tahmin edilemez. Token doğrulaması uygulamada değil **veritabanında** yapılıyor: [src/actions/shares.ts](src/actions/shares.ts) token'ı `get_shared_tasks` adlı Postgres fonksiyonuna parametre olarak geçiriyor, fonksiyon da yalnızca geçerli ve aktif bir paylaşıma karşılık gelen görevleri döndürüyor. Böylece paylaşılan sayfa okuma modunda kalır; güncelleme veya silme için ayrı izin verilmez.

[`/share/[token]`](src/app/share/%5Btoken%5D/page.tsx) sayfasında auth kontrolü yoktur; yetki token üzerinden veritabanı tarafında kontrol edilir. Link geçersizse 404 döner; aktif ama boş liste varsa boş görünüm gösterilir. Bu da güvenli ve anlaşılır bir davranıştır.

### Politikalar nasıl kuruldu

`tasks` ve `task_shares` tablolarının ikisinde de yalnızca `authenticated` rolü için politika var; `anon` rolüne **hiçbir politika verilmedi**. RLS açıkken politika yoksa erişim de yoktur — yani anonim ziyaretçi iki tabloya da doğrudan ulaşamıyor. `task_shares`'a okuma izni vermek özellikle tehlikeli olurdu: anonim biri tabloyu tarayıp tüm aktif token'ları listeleyebilirdi ve token'ın gizliliği tek koruma.

Erişimin tek kapısı bu yüzden `get_shared_tasks` fonksiyonu. Fonksiyon `security definer` ile tanımlı, yani çağıranın değil sahibinin yetkisiyle çalışıyor ve RLS'i atlıyor. Güçlü bir yetki olduğu için kapsamı dar tutuldu:

- yalnızca geçerli ve aktif bir token'a karşılık gelen kullanıcının görevlerini döndürüyor; token bilinmeden hiçbir şey dönmüyor
- `set search_path = ''` ile tanımlandı ve içindeki nesneler tam nitelikli yazıldı. Bu olmadan çağıran taraf `search_path`'i değiştirip fonksiyonun kullandığı tabloları sahte nesnelerle değiştirebilirdi
- dönen kolonlar arasında `user_id` yok: anonim ziyaretçinin listeyi görmek için sahibinin kimliğine ihtiyacı yok. Bu ayrım tip seviyesinde de var — `SharedTask = Omit<Task, 'user_id'>`

Yani ana fikir şudur: kullanıcılar kendi listelerine RLS politikaları üzerinden erişir; paylaşılan link ise tablolara hiç dokunmayan, ayrı ve dar kapsamlı bir fonksiyon üzerinden yalnızca okuma sağlar.

## Gereksinimlerin karşılığı

Temel gereksinimlerin beşi ve bonusların dördü uygulandı.

- Supabase Auth ile e-posta/şifre kaydı ve girişi; giriş yapmamış kullanıcı listeye erişemez — [src/actions/auth.ts](src/actions/auth.ts), [src/proxy.ts](src/proxy.ts)
- İş oluşturma, listeleme, durum değiştirme ve silme — [src/actions/tasks.ts](src/actions/tasks.ts), [src/components/tasks](src/components/tasks)
- Veri izolasyonu; uygulama kodunda ve veritabanında RLS ile — [supabase/migrations/0001_create_tasks.sql](supabase/migrations/0001_create_tasks.sql), "RLS ve veri izolasyonu"
- Durum ve önceliğe göre filtreleme — [src/components/tasks/TaskFilters.tsx](src/components/tasks/TaskFilters.tsx)
- Tailwind ile sade arayüz; hata/yükleme durumu ve responsive tasarım — teknik kararlar 6 ve 8
- Next.js App Router + Server Actions, TypeScript, Supabase — teknik karar 1
- Çalışan canlı demo — başlıktaki Vercel bağlantısı, giriş gerektirmeden erişilebilir

Bonuslar:

- Public salt-okunur paylaşım sayfası ve RLS kurulumu — "Public paylaşım sayfası ve `anon` politikaları"
- Supabase Realtime ile canlı güncelleme — teknik karar 10
- Son tarih ve geciken işlerin vurgulanması — teknik karar 9
- Form doğrulama, hem istemci hem sunucu tarafında — teknik karar 7

---

## Tamamlamaya fırsat bulamadığım ya da bilinçli olarak kapsam dışı bıraktığım kısımlar

Görevin istediği her şey tamamlandı; aşağıdakiler istenmeyen ama akla gelebilecek eklemeler. İkiye ayırdım çünkü gerekçeleri farklı: ilk gruptakiler projeye değer katmayacağı için, ikinci gruptakiler önceliği daha düşük olduğu için dışarıda kaldı.

### Değer katmayacağına karar verdiklerim

- **`profiles` tablosu.** Görev kullanıcı adı, avatar veya profil bilgisi istemiyor. `auth.users` ile `tasks` arasında `user_id` üzerinden doğrudan ilişki kurmak yeterliydi. Araya bir tablo koysaydım, hiçbir alanını kullanmadığım bir varlığı bakmak zorunda kalırdım.
- **Zod veya benzeri bir doğrulama kütüphanesi.** Doğrulanan alan sayısı beş (başlık, açıklama, öncelik, durum, son tarih) ve kuralları basit: boş mu, uzunluk sınırında mı, kapalı değer kümesinde mi. Elle yazılan kontroller ve tip guard'ları bunu bağımlılık eklemeden yapıyor. Alan sayısı artsaydı ya da aynı şemayı istemciyle paylaşmam gerekseydi tercih değişirdi.
- **UI kütüphanesi.** Arayüz beş ekrandan oluşuyor ve bileşenlerin çoğu tek kullanımlık. Hazır bir set, kazandıracağı zamandan fazlasını paket boyutu ve API öğrenme maliyeti olarak geri alırdı.
- **Sayfalama, arama ve sıralama seçenekleri.** Liste `created_at desc` ile sabit sıralı ve filtreleme zaten var. Kişisel bir iş listesinde beklenen kayıt sayısı bunları gerektirmiyor. Karar geri alınabilir: mevcut `(user_id, created_at desc)` index'i sayfalamayı doğrudan destekliyor.
- **Kullanıcılar arası atama ve ekip akışı.** Görev tanımında açıkça kapsam dışı bırakılmıştı.
- **Tema değiştirme düğmesi.** Arayüz `prefers-color-scheme` ile işletim sistemi temasını izliyor, yani koyu tema zaten çalışıyor. Ayrı bir düğme, tercihi saklamak için ek state ve depolama gerektirirdi; kazancı buna değmezdi.
- **Son tarih alanında geçmiş günleri engellemek.** Bir iş yöneticisine kayıt çoğu zaman sonradan girilir; engellemek kullanıcıyı gerçek tarihi girmekten alıkoyardı. Ayrıca sunucu tarafında geçmiş tarihi reddetmiyoruz — yalnızca istemcide engellemek iki katmanı tutarsız hale getirirdi.

### Önceliği düşük kaldığı için yapmadıklarım

- **Görev düzenleme ekranı.** Oluşturulduktan sonra yalnızca durum değiştirilebiliyor; başlık, açıklama, öncelik ve son tarih sabit. Görev tanımı durum yönetimini istiyordu, tam düzenleme akışı kapsamı genişletirdi. Mevcut eksikler içinde kullanıcıyı en çok zorlayan bu.
- **Şifre sıfırlama ve e-posta değiştirme.** Auth akışı kayıt, giriş ve çıkış ile sınırlı. Supabase bunları destekliyor ama akış ek sayfalar ve e-posta şablonları gerektiriyordu; şifresini unutan kullanıcının şu an bir yolu yok.
- **Hesap silme.** Veritabanı tarafı hazır — `on delete cascade` sayesinde kullanıcı silinince işleri de siliniyor — ama arayüzde bir giriş noktası yok.
- **"Geç tamamlandı" etiketi.** Bunu doğru gösterebilmek için `completed_at` damgası gerekiyor. Elimizdeki veriyle "son tarihi geçmiş + tamamlanmış" ile "geç tamamlanmış" ayırt edilemiyor: zamanında bitirilmiş bir iş de son tarih geçtikten sonra aynı görünür. Yanlış bilgi göstermektense göstermemeyi seçtim. (`updated_at` bu iş için uygun değil; her güncellemede değişiyor, tamamlanma anını temsil etmiyor.)
- **Paylaşım linkine süre sınırı ve birden fazla link.** Şema `is_active` ile iptal etmeyi destekliyor; zamana bağlı sona erme için ek bir kolon ve arayüz gerekirdi. Hiç kullanılmayacak bir kolon bırakmaktansa iptali tek mekanizma yaptım. Kısmi unique index şu an kullanıcı başına tek aktif linke izin veriyor.
- **Testler ve CI.** Otomatik test yok. Doğrulama elle yapıldı: iki hesapla veri izolasyonu, `set local role anon` ile RLS politikaları, iki sekmeyle Realtime.
- **Bir performans ayrıntısı.** Sayfa ve `getTasks` ayrı ayrı `getUser()` çağırıyor, yani istek başına iki auth doğrulaması oluyor. Bu bilinçli: `getTasks` bir Server Action, yani sayfadan bağımsız da çağrılabilir ve kendi kontrolünü kendisi yapmalı. `user`'ı parametre olarak geçirmek çağrı sayısını yarıya indirirdi ama action'ın tek başına güvenli olma özelliğini kaybederdi. Bu ölçekte güvenliği tercih ettim.

---

## Demo ortamına özel not

Supabase'de e-posta onayı kapalı tutuldu; böylece değerlendiren kayıt olur olmaz uygulamayı deneyebiliyor. Üretimde bu ayar açık olmalı ve kod her iki durumu da destekliyor: `signUp` bir session döndürmezse kullanıcıya doğrulama mesajı gösteriliyor.

İkinci bir sebebi daha var: Supabase'in ücretsiz planındaki yerleşik SMTP servisi saatte birkaç e-posta ile sınırlı ve dokümantasyonunda yalnızca test için önerildiği yazıyor. Onay açık bırakılsaydı, onay maili gecikince demo kendi hatası olmadan kırılmış görünebilirdi.

## Daha fazla vaktim olsaydı ne eklerdim

Öncelik sırasıyla:

1. **RLS için entegrasyon testi.** Projenin asıl iddiası veri izolasyonu; bunu her değişiklikte otomatik doğrulayan bir test, elle iki hesapla denemekten çok daha güvenilir. İlk sıraya koymamın sebebi: kırıldığında en pahalı olan şey bu.
2. **Görev düzenleme.** Kullanıcının en çok isteyeceği eksik özellik; şu an bir işi yanlış yazınca silip yeniden oluşturmak gerekiyor.
3. **`completed_at` ve "geç tamamlandı" göstergesi.** Yukarıda anlatılan veri eksikliğini kapatırdı.
4. **Supabase CLI ile migration yönetimi.** Şu an SQL dosyaları panelden elle çalıştırılıyor; sürümlenmiş bir migration akışı ekip çalışmasında şart olurdu.
5. **Paylaşım linkine süre sınırı ve birden fazla link.** Şema tek aktif linke göre kurgulandı; farklı kişilere farklı linkler vermek istenirse kısmi unique index gözden geçirilmeli.

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
│   ├── share/
│   │   └── [token]/page.tsx      # public, salt okunur
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
│
├── actions/
│   ├── auth.ts
│   ├── tasks.ts
│   └── shares.ts
│
├── components/
│   ├── auth/AuthForm.tsx
│   ├── tasks/
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskListSkeleton.tsx
│   │   ├── TaskFilters.tsx
│   │   ├── TaskStatusSelect.tsx
│   │   ├── TaskDeleteButton.tsx
│   │   ├── TaskRealtime.tsx
│   │   └── ShareLinkPanel.tsx
│   └── ui/PageContainer.tsx
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
    ├── 0001_create_tasks.sql
    ├── 0002_add_task_due_date.sql
    ├── 0003_add_task_shares.sql
    ├── 0004_add_share_validity_check.sql
    └── 0005_enable_realtime.sql
```

### Neden bu yapı?

- **`actions/`** yalnızca veri işlemlerini barındırıyor. Yetkilendirme kontrollerinin nerede yapıldığı böylece tek bakışta görülüyor.
- **`(auth)` ve `(dashboard)`** parantezli klasörlerdir; URL'e yansımazlar. Yalnızca farklı layout vermek için kullanılıyorlar — auth sayfaları ortalanmış dar bir kutu, dashboard geniş bir sayfa.
- **`lib/supabase/`** altında üç ayrı istemci var çünkü cookie erişimi üç ortamda farklı: tarayıcı, Server Component/Action ve proxy.
- **`proxy.ts`** Next.js 16'da `middleware.ts` konvansiyonunun yerini aldı; eski isim deprecate edildiği için yeni ada geçildi. `lib/supabase/middleware.ts` ise bir konvansiyon dosyası değil, `updateSession` yardımcısını barındıran kendi modülümüz — Supabase belgeleriyle aynı adı taşısın diye adı korundu.
- **`types/task.ts`** `TASK_PRIORITIES` ve `TASK_STATUSES` sabitlerini tutuyor. Bu diziler hem select seçeneklerini üretmekte, hem tip türetmekte, hem de çalışma anı doğrulamasında kullanılıyor — değerler migration'daki `check` constraint'leriyle birebir aynı.
