declare module '@getbrevo/brevo' {
  export class ApiClient {
    static instance: ApiClient;
    authentications: {
      'api-key'?: {
        apiKey: string;
      };
      apiKey?: {
        apiKey: string;
      };
    };
  }

  export class TransactionalEmailsApi {
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
