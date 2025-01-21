from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    suspicious_blocks = db.Column(db.Integer, nullable=False)  # Número de bloques sospechosos

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)  # Hashed password
    role = db.Column(db.String(50), nullable=False)  # e.g., "admin", "user"
