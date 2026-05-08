import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: Number(env.SMTP_PORT),
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASSWORD,
	},
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
	await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
}
