#!/usr/bin/env python3
"""
Script to promote a user to admin status
Usage: python make_admin.py <email>
"""

import sys
from app.database import SessionLocal
from app.models import User


def make_admin(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"❌ User with email '{email}' not found")
            print("\nAvailable users:")
            users = db.query(User).all()
            for u in users:
                admin_status = "✓ Admin" if u.is_admin else "  User"
                print(f"  [{admin_status}] {u.email} - {u.name}")
            return False

        if user.is_admin:
            print(f"ℹ️  User '{user.email}' is already an admin")
            return True

        user.is_admin = True
        db.commit()
        print(f"✅ Successfully promoted '{user.email}' ({user.name}) to admin!")
        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python make_admin.py <email>")
        print("\nExample:")
        print("  python make_admin.py admin@example.com")
        sys.exit(1)

    email = sys.argv[1]
    success = make_admin(email)
    sys.exit(0 if success else 1)
