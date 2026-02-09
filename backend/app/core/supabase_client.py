from supabase import Client, create_client

from app.core.settings import get_settings

settings = get_settings()


def get_supabase_admin() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
