from core.config import settings

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema

conf = ConnectionConfig(
    MAIL_USERNAME=settings.smtp_username,
    MAIL_PASSWORD=settings.smtp_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.smtp_port,
    MAIL_SERVER="smtp-relay.brevo.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

async def send_email_service(
    email: str,
    subject: str,
    body: str
):
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=body,
        subtype="html"
    )

    fm = FastMail(conf)
    return await fm.send_message(message)