-- tasks tablosunu Realtime yayinina ekle
--
-- Supabase'de canli guncelleme icin tablonun supabase_realtime publication'ina
-- dahil olmasi gerekiyor. Bu olmadan istemci abone olur ama hicbir olay gelmez.
--
-- Guvenlik notu: postgres_changes olaylari da RLS'e tabidir. Kullanici yalnizca
-- SELECT politikasinin izin verdigi satirlarin olaylarini alir, yani baskasinin
-- isi degistiginde haber almaz. Yayina eklemek veriyi herkese acmiyor.
--
-- do blogu: ayni migration iki kez calistirilirsa "already member of
-- publication" hatasi almamak icin once uyelik kontrol ediliyor.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;
end
$$;

-- UPDATE ve DELETE olaylarinin ulasabilmesi icin gerekli.
--
-- Varsayilan replica identity'de WAL'a yalnizca birincil anahtar yaziliyor,
-- yani eski kayitta id var ama user_id yok. Hem RLS politikasi
-- (auth.uid() = user_id) hem de abonelik filtresi user_id'ye baktigi icin
-- Supabase bu olaylari degerlendiremeyip eliyordu: INSERT geliyor, UPDATE ve
-- DELETE gelmiyordu.
--
-- FULL ile eski kaydin tamami yaziliyor ve iki kontrol de calisabiliyor.
-- Maliyeti WAL boyutunun artmasi; bu tablonun satir boyutunda ihmal edilebilir.
alter table public.tasks replica identity full;
