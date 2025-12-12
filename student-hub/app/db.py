import sqlite3
from pathlib import Path
from typing import Optional

DB_PATH = Path("student_hub.sqlite")

def init_db() -> None:
    with sqlite3.connect(DB_PATH) as con:
        con.execute(
            """
          CREATE TABLE IF NOT EXISTS kv (
            k TEXT PRIMARY KEY,
            v TEXT NOT NULL
          )
        """
        )
        con.commit()


def kv_set(k: str, v: str) -> None:
    with sqlite3.connect(DB_PATH) as con:
        con.execute(
            "INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v",
            (k, v),
        )
        con.commit()


def kv_get(k: str) -> Optional[str]:
    with sqlite3.connect(DB_PATH) as con:
        row = con.execute("SELECT v FROM kv WHERE k=?", (k,)).fetchone()
        return row[0] if row else None


def kv_del(k: str) -> None:
    with sqlite3.connect(DB_PATH) as con:
        con.execute("DELETE FROM kv WHERE k=?", (k,))
        con.commit()
