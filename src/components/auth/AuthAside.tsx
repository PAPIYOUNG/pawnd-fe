import Image from 'next/image';

function PetIllustration() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="h-full w-full"
      role="img"
      aria-label="Dog and cat cuddling"
    >
      <ellipse cx="120" cy="205" rx="80" ry="10" fill="#0F2A1E" opacity="0.08" />

      {/* dog ear */}
      <path
        d="M78 70c-26-8-46 10-40 34 5 20 26 30 46 24-18-10-24-38-6-58Z"
        fill="#F0A93B"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* dog body */}
      <path
        d="M46 150c-4-34 20-64 58-64 34 0 60 24 62 56 2 24-4 34-14 38-10-18-8-30-8-30s-8 16-30 16c-14 0-20-6-20-6s-6 20-30 20c-16 0-20-14-18-30Z"
        fill="#FFF6E2"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* dog face */}
      <path
        d="M70 108c2-16 16-28 34-28 20 0 36 14 38 34"
        fill="none"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M84 122c4 4 10 4 14 0M108 124c4 5 12 5 16 0"
        fill="none"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse cx="118" cy="140" rx="7" ry="5" fill="#1B3A2E" />
      <path
        d="M100 150c8 10 24 10 32 0"
        fill="none"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* dog paw hug */}
      <path
        d="M108 168c-14 12-34 14-46 0-8-10-4-24 8-26"
        fill="#FFF6E2"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* location pin heart */}
      <path
        d="M150 150c0 12-14 24-14 24s-14-12-14-24a14 14 0 1 1 28 0Z"
        fill="#F2764B"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="136" cy="150" r="5" fill="#FFF6E2" />

      {/* cat ear */}
      <path
        d="M150 96l10-24 14 18Z"
        fill="#F2764B"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M182 100l4-22 14 16Z"
        fill="#F2764B"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* cat body */}
      <path
        d="M150 190c-10-4-16-14-14-28 2-18 18-38 44-38 22 0 40 16 42 38 2 18-8 30-24 32-4-10 0-18 0-18s-10 12-24 12c-10 0-16-4-16-4s-2 10-8 6Z"
        fill="#F2764B"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* cat tail */}
      <path
        d="M188 188c18 6 34-2 36-18 2-12-6-22-16-22"
        fill="none"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* cat face */}
      <path
        d="M172 138c3 3 9 3 12 0M192 138c3 3 9 3 12 0"
        fill="none"
        stroke="#1B3A2E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M198 146l-4 4-4-4" fill="none" stroke="#1B3A2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M160 148h-14M160 152h-16M228 148h14M228 152h16"
        stroke="#FFF6E2"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type AuthAsideProps = {
  title?: string;
  description?: string;
};

export function AuthAside({
  title = 'ตรวจสอบกล่องข้อความ',
  description = 'ระบบส่งลิงก์ยืนยันตัวตนความปลอดภัยสูงไปยังกล่องข้อความของคุณแล้ว เพื่อป้องกันสแปมและดูแลความเป็นส่วนตัวให้แก่สมาชิกในเครือข่ายสูงสุด',
}: AuthAsideProps) {
  return (
    <aside className="relative hidden h-full min-h-screen w-full flex-col justify-between overflow-hidden bg-primary px-10 py-8 text-primary-foreground md:flex md:w-[38%] lg:w-[35%]">
      <div className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="PAWND"
          width={32}
          height={32}
          className="size-8 rounded-full"
        />
        <span className="text-xl font-bold">PAWND</span>
      </div>

      <div className="flex flex-col items-center gap-8 text-center">
        <div className="flex aspect-square w-full max-w-[260px] items-center justify-center rounded-3xl bg-primary-foreground/10 p-8">
          <PetIllustration />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/80">
            {description}
          </p>
        </div>
      </div>

      <p className="text-xs text-primary-foreground/70">
        © 2026 PAWND Thailand. All rights reserved.
      </p>
    </aside>
  );
}
