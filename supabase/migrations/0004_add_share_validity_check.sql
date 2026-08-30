-- Paylasim token'i gecerli mi?
--
-- get_shared_tasks bos bir liste dondugunde iki durum ayirt edilemiyor:
-- (a) token gecersiz/iptal edilmis, (b) token gecerli ama kullanicinin hic
-- isi yok. Ilkinde 404, ikincisinde bos liste gostermek istiyoruz.
--
-- Bu fonksiyon yalnizca "var/yok" bilgisi donuyor; hicbir icerik sizdirmiyor.
-- Guvenlik onlemleri get_shared_tasks ile ayni: security definer calisirken
-- RLS atlaniyor, bu yuzden search_path bosaltiliyor ve nesneler tam nitelikli
-- yaziliyor; EXECUTE yetkisi acikca veriliyor.

create function public.share_exists(p_token uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.task_shares s
    where s.share_token = p_token
      and s.is_active
  );
$$;

revoke all on function public.share_exists(uuid) from public;
grant execute on function public.share_exists(uuid) to anon, authenticated;
