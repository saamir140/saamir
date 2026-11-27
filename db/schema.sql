-- Apply in the owner's Supabase project before enabling intake.
create schema if not exists growth_private;
revoke all on schema growth_private from public, anon, authenticated;
create table if not exists growth_private.leads (
 lead_id uuid primary key default gen_random_uuid(), request_key uuid not null unique,
 payload jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 privacy_consent_at timestamptz not null default now(), policy_version text not null default 'v3',
 lead_status text not null default 'new' check(lead_status in ('new','contacted','qualified','not_fit')),
 notes text, admin_sent boolean not null default false, applicant_sent boolean not null default false
);
create table if not exists growth_private.rate_limits (
 network_key text primary key, started_at timestamptz not null, attempts int not null
);
create or replace function public.accept_growth_lead(p_key uuid,p_network text,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item growth_private.leads; n int;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into item from growth_private.leads where request_key=p_key;
 if found then
  if item.payload <> p_data then return '{"status":"conflict"}'; end if;
 else
  delete from growth_private.rate_limits where started_at < now()-interval '1 hour';
  insert into growth_private.rate_limits values(p_network,now(),1)
  on conflict(network_key) do update set attempts=growth_private.rate_limits.attempts+1 returning attempts into n;
  if n>5 then return '{"status":"limited"}'; end if;
  insert into growth_private.leads(request_key,payload) values(p_key,p_data) returning * into item;
 end if;
 return jsonb_build_object('lead_id',item.lead_id,'admin_sent',item.admin_sent,'applicant_sent',item.applicant_sent,'created_at',item.created_at);
end $$;
create or replace function public.growth_delivery_done(p_id uuid,p_kind text)
returns void language sql security definer set search_path='' as $$
 update growth_private.leads set admin_sent=admin_sent or p_kind='admin',applicant_sent=applicant_sent or p_kind='applicant',updated_at=now() where lead_id=p_id;
$$;
revoke all on function public.accept_growth_lead(uuid,text,jsonb), public.growth_delivery_done(uuid,text) from public, anon, authenticated;
grant execute on function public.accept_growth_lead(uuid,text,jsonb), public.growth_delivery_done(uuid,text) to service_role;
