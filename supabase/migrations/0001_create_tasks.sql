-- tasks tablosu ve satir bazli guvenlik (RLS)
--
-- Veri izolasyonunu iki katmanda yapiyoruz: Server Action'larda auth kontrolu
-- var ama asil koruma burada. Uygulamada bir hata yapsak bile veritabani
-- kullanicinin baskasinin verisine erismesine izin vermiyor.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Her sorgu "kendi tasklarim" seklinde calisacagi icin user_id'ye index koyuyoruz.
create index tasks_user_id_created_at_idx
  on public.tasks (user_id, created_at desc);

-- updated_at'i uygulamada set etmek yerine trigger'a birakiyoruz ki
-- guncelleme nereden gelirse gelsin dogru kalsin.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- RLS'i acmadan asagidaki politikalar calismaz.
-- Acildiktan sonra varsayilan "hicbir sey goremezsin", izinleri tek tek veriyoruz.
alter table public.tasks enable row level security;

create policy "Users can view their own tasks"
  on public.tasks
  for select
  to authenticated
  using (auth.uid() = user_id);

-- insert'te "using" yok cunku kontrol edilecek mevcut bir satir yok,
-- olusturulan yeni satira "with check" bakiyor.
create policy "Users can create their own tasks"
  on public.tasks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- update'te ikisi de lazim: "using" hangi satiri degistirebilecegini,
-- "with check" degisiklikten sonra satirin hala bize ait oldugunu kontrol eder.
-- Boylece kullanici kendi taskinin user_id'sini baskasina veremez.
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
