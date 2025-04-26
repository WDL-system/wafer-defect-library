"""
Run script to start the Wafer Defect Library Flask app.
"""
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
