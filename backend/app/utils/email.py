import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import os


class EmailService:
    """Email service for sending transactional emails."""

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)
        self.from_name = os.getenv("FROM_NAME", "QuickStore")

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send an email using SMTP."""
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email

            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, "plain")
                msg.attach(part1)

            part2 = MIMEText(html_content, "html")
            msg.attach(part2)

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            return True
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False

    def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str) -> bool:
        """Send password reset email."""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"

        subject = "Reset Your Password - QuickStore"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>We received a request to reset your password for your QuickStore account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">{reset_link}</p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request a password reset, you can safely ignore this email.</p>
                    <p>Best regards,<br>The QuickStore Team</p>
                </div>
                <div class="footer">
                    <p>© 2026 QuickStore. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Hi {user_name},

        We received a request to reset your password for your QuickStore account.

        Click the link below to reset your password:
        {reset_link}

        This link will expire in 1 hour.

        If you didn't request a password reset, you can safely ignore this email.

        Best regards,
        The QuickStore Team
        """

        return self.send_email(to_email, subject, html_content, text_content)

    def send_order_confirmation_email(
        self,
        to_email: str,
        user_name: str,
        order_id: str,
        total_price: float,
        items: List[dict],
    ) -> bool:
        """Send order confirmation email."""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        order_link = f"{frontend_url}/orders/{order_id}"

        subject = f"Order Confirmation #{order_id[:8]} - QuickStore"

        items_html = ""
        for item in items:
            items_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{item['title']}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">{item['quantity']}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item['price']:.2f}</td>
            </tr>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .order-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; }}
                .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
                .total {{ font-size: 18px; font-weight: bold; color: #667eea; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✓ Order Confirmed!</h1>
                    <p>Order #{order_id[:8]}</p>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Thank you for your order! We've received your payment and are processing your order.</p>

                    <h3>Order Details:</h3>
                    <table class="order-table">
                        <thead>
                            <tr style="background: #f3f4f6;">
                                <th style="padding: 10px; text-align: left;">Item</th>
                                <th style="padding: 10px; text-align: center;">Qty</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold;">Total:</td>
                                <td style="padding: 15px; text-align: right;" class="total">${total_price:.2f}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="text-align: center;">
                        <a href="{order_link}" class="button">View Order Details</a>
                    </div>

                    <p>We'll send you another email when your order ships.</p>
                    <p>Best regards,<br>The QuickStore Team</p>
                </div>
                <div class="footer">
                    <p>© 2026 QuickStore. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        items_text = "\n".join([f"- {item['title']} x{item['quantity']} - ${item['price']:.2f}" for item in items])

        text_content = f"""
        Hi {user_name},

        Thank you for your order! We've received your payment and are processing your order.

        Order #{order_id[:8]}

        Order Details:
        {items_text}

        Total: ${total_price:.2f}

        View your order: {order_link}

        We'll send you another email when your order ships.

        Best regards,
        The QuickStore Team
        """

        return self.send_email(to_email, subject, html_content, text_content)

    def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """Send welcome email to new users."""
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

        subject = "Welcome to QuickStore!"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to QuickStore! 🎉</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Welcome to QuickStore! We're excited to have you join our community of shoppers.</p>
                    <p>Your account has been successfully created and you're ready to start shopping.</p>
                    <div style="text-align: center;">
                        <a href="{frontend_url}/products" class="button">Start Shopping</a>
                    </div>
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                    <p>Happy shopping!<br>The QuickStore Team</p>
                </div>
                <div class="footer">
                    <p>© 2026 QuickStore. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Hi {user_name},

        Welcome to QuickStore! We're excited to have you join our community of shoppers.

        Your account has been successfully created and you're ready to start shopping.

        Visit us at: {frontend_url}/products

        If you have any questions, feel free to reach out to our support team.

        Happy shopping!
        The QuickStore Team
        """

        return self.send_email(to_email, subject, html_content, text_content)


# Singleton instance
email_service = EmailService()
