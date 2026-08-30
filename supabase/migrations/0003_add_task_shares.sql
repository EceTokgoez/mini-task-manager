-- Salt-okunur paylasim linkleri
--
-- Amac: giris yapmamis biri, kendisiyle paylasilan bir link uzerinden bir
-- kullanicinin is listesini GOREBILSIN ama degistiremesin.
--
-- Buradaki asil tasarim karari sudur: anon rolune ne tasks ne de task_shares
-- tablosunda HICBIR politika verilmiyor. Anonim erisim yalnizca asagidaki
-- token dogrulayan fonksiyon uzerinden mumkun.

create table public.task_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Token'in tahmin edilemez olmasi gerekiyor; uuid v4 bunu sagliyor.
  share_token uuid not null default gen_random_uuid() unique,
  -- Iptal etme: satiri silmek yerine pasife cekiyoruz.
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bir kullanicinin ayni anda en fazla bir aktif linki olabilir. Bunu
-- uygulamada degil veritabaninda garanti ediyoruz; boylece bir hata
-- durumunda bile ortada birden fazla gecerli link kalmiyor.
create unique index task_shares_one_active_per_user
  on public.task_shares (user_id)
  where is_active;

alter table public.task_shares enable row level security;

-- Politikalar yalnizca 'authenticated' icin ve yalnizca kendi satirlari uzerinde.
-- 'anon' icin bilerek hicbir politika yok: RLS acikken politika yoksa erisim yok.

create policy "Users can view their own share links"
  on public.task_shares
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own share links"
  on public.task_shares
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- tasks tablosundaki update politikasiyla ayni mantik: using hangi satiri
-- degistirebilecegini, with check degisiklikten sonra satirin hala bize ait
-- oldugunu kontrol ediyor.
create policy "Users can update their own share links"
  on public.task_shares
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own share links"
  on public.task_shares
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Anonim erisimin TEK kapisi
--
-- security definer: fonksiyon cagiran degil, sahibi yetkisiyle calisir ve
-- RLS'i atlar. Bu guclu bir yetki, o yuzden fonksiyonun kapsami dar tutuldu:
-- sadece gecerli ve aktif bir token'a karsilik gelen kullanicinin isleri.
-- Token bilinmeden hicbir sey donmuyor, tablo taranamiyor.
--
-- set search_path = '': security definer fonksiyonlarda zorunlu bir onlem.
-- Aksi halde cagiran taraf search_path'i degistirip fonksiyonun cagirdigi
-- nesneleri kendi sahte nesneleriyle degistirebilir. Bu yuzden asagida her
-- sey tam nitelikli (public.xxx) yazildi.
--
-- Donen kolonlarda user_id yok: anonim ziyaretcinin isleri gormek icin
-- listenin sahibinin kimligine ihtiyaci yok, o yuzden disari verilmiyor.

create function public.get_shared_tasks(p_token uuid)
returns table (
  id uuid,
  title text,
  description text,
  priority text,
  status text,
  due_date date,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    t.id,
    t.title,
    t.description,
    t.priority,
    t.status,
    t.due_date,
    t.created_at,
    t.updated_at
  from public.task_shares s
  join public.tasks t on t.user_id = s.user_id
  where s.share_token = p_token
    and s.is_active
  order by t.created_at desc;
$$;

-- Postgres yeni fonksiyonlara varsayilan olarak PUBLIC'e EXECUTE veriyor.
-- Once bunu geri alip yetkiyi acikca veriyoruz.
revoke all on function public.get_shared_tasks(uuid) from public;
grant execute on function public.get_shared_tasks(uuid) to anon, authenticated;
