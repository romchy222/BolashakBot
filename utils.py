"""Utility functions for the application"""

import pytz
from datetime import datetime

def convert_utc_to_local(utc_dt, timezone='Asia/Almaty'):
    """Convert UTC datetime to local timezone

    Args:
        utc_dt: UTC datetime object
        timezone: Timezone string (default: 'Asia/Almaty' for Kazakhstan)

    Returns:
        Datetime object in local timezone
    """
    if not utc_dt:
        return None

    if not utc_dt.tzinfo:
        # If the datetime is naive, assume it's UTC
        utc_dt = utc_dt.replace(tzinfo=pytz.UTC)

    local_tz = pytz.timezone(timezone)
    return utc_dt.astimezone(local_tz)

def format_datetime(dt, format_str='%d.%m.%Y %H:%M:%S'):
    """Format datetime object to string

    Args:
        dt: Datetime object
        format_str: Format string (default: DD.MM.YYYY HH:MM:SS)

    Returns:
        Formatted datetime string
    """
    if not dt:
        return ''

    return dt.strftime(format_str)

def get_current_time_utc():
    """Get current UTC time with timezone info

    Returns:
        Current UTC datetime with timezone
    """
    return datetime.now(pytz.UTC)
