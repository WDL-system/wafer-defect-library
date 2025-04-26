import multiprocessing

# Bind to localhost:8000 (can be changed)
bind = "127.0.0.1:8000"

# Number of worker processes (adjust to your CPU cores)
workers = multiprocessing.cpu_count() * 2 + 1

# Worker class
worker_class = "sync"

# Logging
accesslog = "logs/gunicorn_access.log"
errorlog = "logs/gunicorn_error.log"
loglevel = "info"

# Timeout for workers (seconds)
timeout = 30

# PID file (optional)
pidfile = "gunicorn.pid"
