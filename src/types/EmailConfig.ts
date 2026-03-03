// types/EmailConfig.ts

export interface EmailConfig {
    id: string
    mail_mailer: string
    mail_host: string
    mail_port: number
    mail_username: string
    mail_password: string
    mail_encryption: 'tls' | 'ssl' | 'none'
    mail_from_address: string
    mail_from_name: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export type CreateEmailConfigPayload = Omit<EmailConfig, 'id' | 'created_at' | 'updated_at'>

export type UpdateEmailConfigPayload = Partial<CreateEmailConfigPayload>