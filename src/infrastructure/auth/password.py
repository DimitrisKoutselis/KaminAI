import hashlib
import secrets


def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with salt."""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a hash."""
    try:
        salt, stored_hash = hashed.split(":")
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return secrets.compare_digest(password_hash, stored_hash)
    except ValueError:
        return False
