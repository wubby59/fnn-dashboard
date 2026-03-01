#!/usr/bin/env python3
"""
FNN Monitoring Agent
Reports system metrics to the FNN Dashboard API every 60 seconds.

Usage:
    python3 fnn_agent.py --server http://dashboard-host:3000 --id MY-DEVICE
"""

import argparse
import json
import logging
import platform
import socket
import time

import psutil
import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [FNN-Agent] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("fnn-agent")

DEFAULT_SERVER = "http://localhost:3000"
DEFAULT_INTERVAL = 60


def get_device_id():
    """Generate a device ID from hostname."""
    hostname = socket.gethostname().upper()
    # Truncate to reasonable length
    return hostname[:20] if len(hostname) > 20 else hostname


def get_ip_address():
    """Get the primary IP address."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def get_uptime():
    """Get system uptime as a human-readable string."""
    boot = psutil.boot_time()
    elapsed = time.time() - boot
    days = int(elapsed // 86400)
    hours = int((elapsed % 86400) // 3600)
    minutes = int((elapsed % 3600) // 60)
    return f"{days}d {hours}h {minutes}m"


def get_services(service_names=None):
    """Check status of specified services, or auto-detect running services."""
    services = []

    if service_names:
        for name in service_names:
            running = False
            for proc in psutil.process_iter(["name", "cmdline"]):
                try:
                    pname = proc.info["name"] or ""
                    if name.lower() in pname.lower():
                        running = True
                        break
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            services.append({
                "service_name": name,
                "is_running": running,
                "remote_site": get_ip_address(),
            })
    return services


def get_partitions():
    """Get disk partition usage."""
    partitions = []
    for part in psutil.disk_partitions(all=False):
        try:
            usage = psutil.disk_usage(part.mountpoint)
            partitions.append({
                "partition_name": part.mountpoint,
                "total_space_mb": round(usage.total / (1024 * 1024)),
                "free_space_mb": round(usage.free / (1024 * 1024)),
                "used_space_mb": round(usage.used / (1024 * 1024)),
            })
        except (PermissionError, OSError):
            continue
    return partitions


def collect_report(device_id, display_name, acronym, orb_color, service_names):
    """Collect all system metrics into a report payload."""
    mem = psutil.virtual_memory()

    report = {
        "device_id": device_id,
        "display_name": display_name or device_id,
        "ip_address": get_ip_address(),
        "acronym": acronym or device_id[:6],
        "orb_color": orb_color or "#0EA5E9",
        "cpu_usage": round(psutil.cpu_percent(interval=1), 1),
        "free_memory_mb": round(mem.available / (1024 * 1024)),
        "total_memory_mb": round(mem.total / (1024 * 1024)),
        "system_uptime": get_uptime(),
        "services": get_services(service_names),
        "partitions": get_partitions(),
    }
    return report


def send_report(server_url, report):
    """POST the report to the FNN API."""
    url = f"{server_url}/api/agent/report"
    try:
        resp = requests.post(url, json=report, timeout=10)
        resp.raise_for_status()
        log.info("Report sent: %s (CPU: %.1f%%, RAM: %sMB free)",
                 report["device_id"], report["cpu_usage"], report["free_memory_mb"])
        return True
    except requests.RequestException as e:
        log.error("Failed to send report: %s", e)
        return False


def main():
    parser = argparse.ArgumentParser(description="FNN Monitoring Agent")
    parser.add_argument("--server", default=DEFAULT_SERVER, help="Dashboard server URL")
    parser.add_argument("--id", default=None, help="Device ID (default: hostname)")
    parser.add_argument("--name", default=None, help="Display name")
    parser.add_argument("--acronym", default=None, help="Short acronym for orb display")
    parser.add_argument("--color", default="#0EA5E9", help="Orb color (hex)")
    parser.add_argument("--interval", type=int, default=DEFAULT_INTERVAL, help="Report interval in seconds")
    parser.add_argument("--services", nargs="*", default=[], help="Service names to monitor")
    parser.add_argument("--once", action="store_true", help="Send one report and exit")
    args = parser.parse_args()

    device_id = args.id or get_device_id()
    log.info("FNN Agent starting: device=%s server=%s interval=%ds",
             device_id, args.server, args.interval)

    while True:
        report = collect_report(device_id, args.name, args.acronym, args.color, args.services)
        send_report(args.server, report)

        if args.once:
            break

        time.sleep(args.interval)


if __name__ == "__main__":
    main()
