-- Verificação de dados, somente no projeto OXENTEBAR (lebythikaeyamezsbbbp).
select e.code, e.published,
  (select count(*) from public.categories c where c.establishment_id=e.id) as categorias,
  (select count(*) from public.products p where p.establishment_id=e.id) as produtos,
  (select count(*) from public.product_variations v join public.products p on p.id=v.product_id where p.establishment_id=e.id) as variacoes,
  (select jsonb_array_length(s.config->'catalogNotices') from public.commercial_settings s where s.establishment_id=e.id) as avisos
from public.establishments e where e.id='00000000-0000-4000-8000-000000000002';
select id, public, file_size_limit from storage.buckets where id='catalog-media';
select count(*) as administradores from public.administrators
where establishment_id='00000000-0000-4000-8000-000000000002';
