// src/pages/send-contact.ts
export const prerender = false; // 動的ルート（POST）を有効化

import { z } from 'zod';

// 入力バリデーション
const schema = z.object({
  name: z.string().min(1, 'お名前は必須です'),
  kana: z.string().optional(),
  tel: z.string().optional(),
  email: z.string().email('メール形式が正しくありません'),
  zip: z.string().regex(/^\d{3}-?\d{4}$/, '郵便番号は 012-3456 形式'),
  pref: z.string().optional(),
  addr: z.string().optional(),
  company: z.string().min(1, '会社名は必須です'),
  division: z.string().optional(),
  title: z.string().optional(),
  industry: z.string().optional(),
  message: z.string().min(1, '本文は必須です').max(4000, '本文が長すぎます'),
  // 蜜壺（ボット対策）。form側で <input type="text" name="hp" tabindex="-1" autocomplete="off" style="display:none"> を入れておく
  hp: z.string().max(0).optional(),
});

export async function POST({ request, redirect }: { request: Request; redirect: (url: string) => Response }) {
  const form = await request.formData();

  // formData -> 普通のオブジェクトへ
  const data = Object.fromEntries(form.entries());

  // バリデーション
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    // フロントでAJAXの場合用にJSON返却
    return new Response(JSON.stringify({
      ok: false,
      errors: parsed.error.flatten().fieldErrors
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const payload = parsed.data;

  // --- ここでメール送信 or 保存処理 ---
  // 簡易運用：環境変数が揃っていればメール送信、無ければスキップして受付だけ
  try {
    const hasSmtp =
      !!process.env.SMTP_HOST &&
      !!process.env.SMTP_PORT &&
      !!process.env.SMTP_USER &&
      !!process.env.SMTP_PASS &&
      !!process.env.MAIL_TO;

    if (hasSmtp) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
      });

      const text = [
        `【お問い合わせ】`,
        `--------------------------------`,
        `お名前: ${payload.name}`,
        `ふりがな: ${payload.kana ?? ''}`,
        `会社名: ${payload.company}`,
        `部署名: ${payload.division ?? ''}`,
        `役職名: ${payload.title ?? ''}`,
        `メール: ${payload.email}`,
        `電話  : ${payload.tel ?? ''}`,
        `郵便  : ${payload.zip}`,
        `都道府県: ${payload.pref ?? ''}`,
        `住所: ${payload.addr ?? ''}`,
        `業種: ${payload.industry ?? ''}`,
        `--------------------------------`,
        `${payload.message}`,
      ].join('\n');

      await transporter.sendMail({
        from: `"Webフォーム" <${process.env.SMTP_USER}>`,
        to: process.env.MAIL_TO!,
        subject: 'サイトお問い合わせ',
        text,
        replyTo: payload.email,
      });
    }
  } catch (e) {
    // 送信失敗でも受付自体は完了させる（必要ならログへ）
    console.error('[mail error]', e);
  }

  // 通常のフォーム送信ならサンクスページへリダイレクト
  return redirect('/thanks');
}
