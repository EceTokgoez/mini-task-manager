-- Isler icin son tarih.
--
-- Tip olarak timestamptz degil date sectik: bir isin son tarihi gun
-- seviyesinde anlamli. timestamptz kullansaydik saat dilimi cevrimi
-- yuzunden ayni tarih farkli kullanicilarda farkli gorunebilirdi.
--
-- Kolon nullable: son tarih zorunlu degil, mevcut kayitlar da bos kaliyor.

alter table public.tasks
  add column due_date date;
