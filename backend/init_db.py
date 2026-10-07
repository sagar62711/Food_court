from auth import hash_password
from database import Base, SessionLocal, engine
from models import User

DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "admin123"  # change this after the first login


def main():
    Base.metadata.create_all(bind=engine)
    print("Tables created (or already existed).")

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == DEFAULT_ADMIN_USERNAME).first()
        if existing:
            print("Default admin already exists, skipping.")
            return

        admin = User(
            username=DEFAULT_ADMIN_USERNAME,
            hashed_password=hash_password(DEFAULT_ADMIN_PASSWORD),
            role="admin",
            shop_id=None,
        )
        db.add(admin)
        db.commit()
        print(f"Created default admin: username='{DEFAULT_ADMIN_USERNAME}'")
    finally:
        db.close()


if __name__ == "__main__":
    main()
