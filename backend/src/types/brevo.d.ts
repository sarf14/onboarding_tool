declare module '@getbrevo/brevo' {
  export class TransactionalEmailsApi {
    authentications: {
      apiKey: {
        apiKey: string;
      };
    };
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<{ body?: { messageId?: string } }>;
  }

  export class SendSmtpEmail {
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    sender?: { name: string; email: string };
    to?: Array<{ email: string; name?: string }>;
  }
}
