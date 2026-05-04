#!/usr/bin/env python3
"""
Script to reset a user's password
Usage: python reset_password.py <email> <new_password>
"""

import sys
import bcrypt
from app.database import SessionLocal
from app.models import User


def reset_password(email: str, new_password: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"❌ User with email '{email}' not found")
            return False

        # Hash the new password
        hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
        user.hashed_password = hashed.decode("utf-8")
        db.commit()

        admin_status = "Admin" if user.is_admin else "User"
        print(f"✅ Password reset successfully for '{user.email}' ({user.name})")
        print(f"   Role: {admin_status}")
        print(f"   New password: {new_password}")
        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python reset_password.py <email> <new_password>")
        print("\nExample:")
        print("  python reset_password.py admin@example.com MyNewPass123")
        sys.exit(1)

    email = sys.argv[1]
    new_password = sys.argv[2]

    if len(new_password) < 8:
        print("❌ Password must be at least 8 characters long")
        sys.exit(1)

    success = reset_password(email, new_password)
    sys.exit(0 if success else 1)
