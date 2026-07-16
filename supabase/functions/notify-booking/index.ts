// 예약 등록 시 관리자에게 이메일 알림을 보내는 Supabase Edge Function
//
// 흐름: bookings 테이블 INSERT → Database Webhook → 이 함수 → Resend API → 관리자 메일
// 설정 방법은 README의 "6. 예약 알림 메일 설정" 참고.
//
// 필요한 secret (Supabase 대시보드 > Edge Functions > Secrets):
//   RESEND_API_KEY : Resend에서 발급받은 API 키
//   ADMIN_EMAIL    : 알림을 받을 관리자 이메일 주소
//   NOTIFY_SECRET  : 웹훅 위조 방지용 임의 문자열 (웹훅 헤더와 동일한 값)
//   FROM_EMAIL     : (선택) 발신 주소. 도메인 미인증 시 onboarding@resend.dev 사용

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')
const NOTIFY_SECRET = Deno.env.get('NOTIFY_SECRET')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev'

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function weekdayName(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return WEEKDAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
}

// '13:00:00' → '13:00 ~ 14:00'
function slotLabel(startTime: string): string {
  const hh = startTime.slice(0, 2)
  const start = startTime.slice(0, 5)
  const end = `${String(Number(hh) + 1).padStart(2, '0')}:00`
  return `${start} ~ ${end}`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // 설정 누락 시 조용히 실패하지 않도록 명시적으로 알림
  if (!RESEND_API_KEY || !ADMIN_EMAIL || !NOTIFY_SECRET) {
    console.error('필수 secret 누락: RESEND_API_KEY / ADMIN_EMAIL / NOTIFY_SECRET 확인 필요')
    return new Response('Server not configured', { status: 500 })
  }

  // 함수 URL은 공개되므로, 약속한 비밀 헤더가 있는 요청만 처리한다.
  if (req.headers.get('x-notify-secret') !== NOTIFY_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  let payload: { type?: string; record?: Record<string, string> }
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const record = payload.record
  if (!record) {
    return new Response('No record in payload', { status: 400 })
  }

  const bookingDate = record.booking_date ?? ''
  const booth = record.booth ?? ''
  const startTime = record.start_time ?? ''
  const name = record.customer_name ?? ''
  const phone = record.customer_phone ?? ''

  const dateLabel = `${bookingDate} (${weekdayName(bookingDate)}요일)`
  const timeLabel = slotLabel(startTime)
  const subject = `[드론 부스] 새 예약 - ${bookingDate} ${startTime.slice(0, 5)} Booth ${booth}`

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #222;">
      <h2 style="margin: 0 0 12px;">새 예약이 접수되었습니다</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1px solid #ddd;">
        <tr><td style="background:#f5f5f5;"><b>예약 일자</b></td><td>${escapeHtml(dateLabel)}</td></tr>
        <tr><td style="background:#f5f5f5;"><b>시간</b></td><td>${escapeHtml(timeLabel)}</td></tr>
        <tr><td style="background:#f5f5f5;"><b>부스</b></td><td>Booth ${escapeHtml(booth)}</td></tr>
        <tr><td style="background:#f5f5f5;"><b>신청자</b></td><td>${escapeHtml(name)}</td></tr>
        <tr><td style="background:#f5f5f5;"><b>연락처</b></td><td>${escapeHtml(phone)}</td></tr>
      </table>
      <p style="margin-top: 16px; font-size: 13px; color: #666;">
        개인정보 보호를 위해 예약이 종료된 알림 메일은 주기적으로 삭제해 주세요.
      </p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `드론 부스 예약 <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error('Resend 발송 실패:', res.status, detail)
    return new Response(`Email send failed: ${detail}`, { status: 502 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
