import os
from cryptography.fernet import Fernet


def _fernet() -> Fernet:
    key = os.getenv("MASTER_KEY", "").encode()
    if not key:
        raise RuntimeError("MASTER_KEY is missing. Set it in your .env")
    return Fernet(key)


def encrypt_text(plain: str) -> str:
    f = _fernet()
    return f.encrypt(plain.encode("utf-8")).decode("utf-8")


def decrypt_text(cipher: str) -> str:
    f = _fernet()
    return f.decrypt(cipher.encode("utf-8")).decode("utf-8")
