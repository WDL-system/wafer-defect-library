import os
from app import create_app

# Set environment variable for production
os.environ.setdefault('FLASK_ENV', 'production')

# Create the app using the factory function
app = create_app()

# If necessary, configure logging or other setup here

if __name__ == "__main__":
    app.run(debug=False)  # This is a fallback for development, Gunicorn will use this in production
