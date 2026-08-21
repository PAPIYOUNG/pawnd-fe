<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — PAWND Frontend Engineering Guide

> เอกสารนี้เป็นข้อกำหนดกลางสำหรับมนุษย์และ AI Coding Agent ทุกค่ายที่เข้ามาทำงานใน PAWND Frontend (`pawnd-fe`)  
> **ให้อ่านไฟล์นี้และตรวจสอบโค้ด/สไตล์/คอมโพเนนต์ที่มีอยู่เดิมทั้งหมดก่อนวิเคราะห์ แก้ไข หรือสร้างโค้ดทุกครั้ง**

---

## 1. เป้าหมายของเอกสาร

เอกสารนี้มีไว้เพื่อให้สมาชิกในทีมและ AI Agent ทำงานร่วมกันไปในทิศทางเดียวกันอย่างมีประสิทธิภาพ โดยกำหนดแนวทางและมาตรฐานด้าน:

- **Frontend Architecture & Project Structure** บน Next.js 16 (App Router) และ React 19
- **Design System, Styling & UI Tokens** บน Tailwind CSS v4 และ Shadcn UI (Base UI primitives)
- **Form Handling, State Management & Validation** ด้วย React Hook Form และ Zod
- **API Integration & Data Handling** ที่เชื่อมต่อกับ PAWND Backend Contract ได้อย่างถูกต้อง
- **Performance, Accessibility (a11y) & Mobile-First Best Practices**
- **Testing, Linting, Code Quality & Definition of Done**
- **Git Workflow และรูปแบบ Commit มาตรฐาน**

> ⚠️ **คำเตือน:** หากเอกสารนี้ขัดกับ requirement หรือ Design UI ล่าสุดที่ทีมอนุมัติ ให้หยุดและสอบถามทีมก่อนแก้ไข ห้าม AI ตัดสินใจเปลี่ยน Business Rule, User Flow หรือ Design System สำคัญเองโดยพลการ

---

## 2. ข้อบังคับสำหรับ AI Agent

### 2.1 ก่อนเริ่มงานทุกครั้ง (Mandatory Preparation Steps)

AI Agent **ต้องดำเนินการตามลำดับต่อไปนี้อย่างเคร่งครัด**:

1. **อ่าน `AGENTS.md` ทั้งหมด**
2. **ตรวจดู Shared Utilities, Components และ Styles เดิมทั้งหมดก่อนเสมอ**:
   - ตรวจสอบ [`src/lib/`](src/lib) (เช่น `utils.ts` สำหรับ `cn()` helper)
   - ตรวจสอบ [`src/styles/`](src/styles) (เช่น `globals.css` เพื่อดู Theme colors/tokens และ `font.ts` สำหรับ Font setup)
   - ตรวจสอบ [`src/components/ui/`](src/components/ui) (เช่น `button`, `input`, `checkbox`, `label`, etc.) และ [`src/components/`](src/components)
   - **ห้ามสร้างคอมโพเนนต์พื้นฐาน ซ้ำกับที่มีอยู่แล้วใน `src/components/ui/` หรือเขียน helper ซ้ำซ้อนเด็ดขาด**
3. ตรวจ `git status` และ branch ปัจจุบัน
4. อ่าน Ticket, Requirement, Acceptance Criteria และ UI Wireframe / Figma Spec ที่เกี่ยวข้อง
5. ตรวจสอบ API Contract ของ Backend (Endpoint, DTO, Enums, Error Response Structure)
6. สรุปขอบเขตงาน, ไฟล์ที่คาดว่าจะสร้าง/แก้ไข และคอมโพเนนต์ส่วนกลางที่จะนำมาใช้
7. **หาก Requirement, UI Flow หรือ Business Rule ไม่ชัดเจน ให้ถามก่อนลงมือทำ ห้ามเดาเอง**

### 2.2 Source of Truth

เมื่อพบข้อมูลไม่ตรงกัน ให้ยึดลำดับความสำคัญดังนี้:

1. Requirement, UI Design (Figma) หรือการตัดสินใจล่าสุดที่ทีมยืนยัน
2. Ticket และ Acceptance Criteria ปัจจุบัน
3. `AGENTS.md` (Frontend & Backend Guides)
4. API Contract และ Backend Schema ที่ใช้งานอยู่
5. Shared Components และ Implementation เดิมใน Repository
6. Mock data หรือ Test ปัจจุบัน

### 2.3 ขอบเขตการทำงาน (Scope of Work)

- ทำงานเฉพาะ Page, Feature หรือ Bug ที่ได้รับมอบหมายเท่านั้น
- ห้าม Refactor โค้ดหรือจัด Format ทั้งโปรเจกต์โดยไม่ได้รับอนุญาต
- ห้ามเปลี่ยน Design Tokens, Theme Colors หรือ Global CSS นอกเหนือจากที่ได้รับมอบหมาย
- ห้ามเพิ่ม npm/pnpm dependency หากของเดิมในโปรเจกต์สามารถทำงานได้อยู่แล้ว
- หากจำเป็นต้องเพิ่ม dependency ใหม่ ต้องอธิบายเหตุผล ประเมิน bundle size และขออนุมัติก่อน
- ห้าม commit หรือ hardcode secret, API key, credential หรือ token ลงใน repository
- ห้ามแก้ไข `.env` ของผู้อื่น และห้าม commit `.env`; ให้อัปเดตตัวแปรใหม่ลงใน `.env.example` เท่านั้น
- ห้ามใช้คำสั่ง Git ที่มีผลทำลายงาน (destructive) เช่น `reset --hard`, `force checkout` หรืองาน uncommitted ของสมาชิกคนอื่น

### 2.4 ข้อห้ามด้าน Git ที่สำคัญที่สุด

AI Agent สามารถสร้าง Local Commit เมื่อ Feature ผ่าน Definition of Done แล้ว แต่:

- ❌ **ห้าม `git push` ทุกกรณี เว้นแต่มนุษย์สั่งอย่างชัดเจนในคำสั่งนั้น**
- ❌ **ห้ามสร้าง Pull Request อัตโนมัติ**
- ❌ **ห้าม merge branch หรือ rebase อัตโนมัติ**
- ❌ **ห้าม force push หรือ reset history**
- ✅ หลัง commit ให้รายงาน commit hash, commit message, ผลการทดสอบ (lint/build) และรายการไฟล์สำคัญ แล้วหยุดรอมนุษย์ตรวจและ push เอง

---

## 3. ภาพรวมระบบ PAWND (Product Overview)

**PAWND** คือแพลตฟอร์มช่วยตามหาสัตว์เลี้ยงหายและจับคู่ประกาศ Lost & Found อัจฉริยะด้วย AI สำหรับช่วยเหลือเจ้าของสัตว์เลี้ยงและสร้างคอมมูนิตี้คนรักสัตว์

### 3.1 Technology Stack

- **Framework / Runtime:** Next.js 16 (App Router), React 19, TypeScript (Strict Mode)
- **Styling:** Tailwind CSS v4, `tw-animate-css`, OKLCH Semantic Colors
- **UI Components:** Shadcn UI (Base-rhea style บน `@base-ui/react` primitives), `lucide-react` icons
- **Form & Validation:** `react-hook-form`, `@hookform/resolvers`, `zod`
- **Typography:** `Noto Sans` ผ่าน `next/font/google`
- **Package Manager:** `pnpm` (v10.x)

### 3.2 Local Development Setup

```bash
# ติดตั้ง dependencies
pnpm install

# รัน Development Server (พอร์ต 3000)
pnpm dev

# ตรวจสอบ Lint และ Formatting
pnpm lint
pnpm format:check

# ทดสอบ Build โปรเจกต์
pnpm build
```

#### Environment Variables

คัดลอก `.env.example` → `.env.local` หรือ `.env`:

| ตัวแปร | คำอธิบาย | ตัวอย่าง |
| :--- | :--- | :--- |
| `API_URL` | Base URL ของ Backend API | `http://localhost:8000` |
| `AUTH_SECRET` | Secret key สำหรับ Auth session | `secret-key-32-chars-long` |

---

## 4. Architecture และโครงสร้างไฟล์ (Frontend Project Structure)

โครงสร้างโฟลเดอร์ใน `src/` กำหนดเป็นมาตรฐานดังนี้:

```text
src/
├── app/                        # Next.js App Router (Routing & Pages)
│   ├── (auth)/                 # Route Group สำหรับ Authentication
│   │   ├── layout.tsx          # Auth Layout
│   │   ├── login/
│   │   │   └── page.tsx        # Login Page
│   │   └── register/
│   │       ├── _components/    # Page-specific components (ใช้เฉพาะหน้านี้)
│   │       │   └── register-form.tsx
│   │       └── page.tsx        # Register Page
│   ├── (main)/                 # Route Group สำหรับ Main Application
│   │   ├── layout.tsx          # Main Layout (Header, Sticky Nav)
│   │   ├── page.tsx            # Home Page / Feed
│   │   ├── posts/              # Lost / Found Posts
│   │   ├── pets/               # Pet Profiles & QR Code
│   │   ├── matches/            # AI Smart Matching Results
│   │   ├── chat/               # Realtime Chat
│   │   └── community/          # Community Board
│   ├── layout.tsx              # Root Layout (Font, Global CSS, Root Providers)
│   └── not-found.tsx           # 404 Not Found Page
│
├── components/                 # Shared Components
│   ├── ui/                     # Base UI primitives (Button, Input, Checkbox, Dialog, etc.)
│   ├── layout/                 # Global layout parts (Header, Footer, Sidebar, Navigation)
│   ├── auth/                   # Shared auth components (AuthAside, BrandIcons)
│   ├── common/                 # Reusable domain-agnostic components (EmptyState, LoadingSpinner)
│   └── <feature>/              # Shared feature components (PetCard, MatchScoreBadge, etc.)
│
├── lib/                        # Shared Helpers & Utilities
│   └── utils.ts                # cn() classnames merge utility
│
├── hooks/                      # Custom React Hooks (useDebounce, useMediaQuery, useAuth, etc.)
│
├── types/                      # Global TypeScript definitions & API Interfaces
│   ├── api.ts                  # Common API response interfaces
│   ├── auth.ts                 # User & Auth types
│   ├── post.ts                 # Pet Post types & enums
│   └── pet.ts                  # Pet profile types
│
├── services/ (หรือ api/)        # API Integration / Fetcher functions
│   ├── client.ts               # HTTP client configuration (fetch / ky / axios wrapper)
│   └── auth.service.ts         # Authentication API calls
│
└── styles/                     # Global Styling & Fonts
    ├── font.ts                 # Font configurations (Noto Sans)
    └── globals.css             # Tailwind v4, Theme Tokens & OKLCH variables
```

### 4.1 กฎการใช้งาน Server Component vs Client Component

- **Server Components (RSC - Default):**
  - ใช้เป็นค่าเริ่มต้นสำหรับ Page, Layout, Data Fetching และ Static Content เสมอ เพื่อลด Javascript bundle size และเพิ่มความเร็วในการโหลด
  - ห้ามใส่ `'use client'` ที่ระดับ Page หรือ Layout โดยไม่จำเป็น
- **Client Components (`'use client'`):**
  - ใช้เฉพาะเมื่อคอมโพเนนต์ต้องการ State (`useState`, `useReducer`), Lifecycle (`useEffect`), Event Handlers (`onClick`, `onChange`), Browser API, หรือ Form Hooks (`useForm`)
  - **Push Client Boundaries Down:** แยกส่วนที่เป็น Interactive ออกเป็นคอมโพเนนต์ลูกย่อย แล้วเรียกใช้ใน Server Component แทนการทำให้ทั้งหน้ากลายเป็น Client Component

### 4.2 การแบ่งแยก Component (Component Colocation)

- คอมโพเนนต์ที่ใช้เฉพาะในหน้านั้นๆ ให้สร้างไว้ในโฟลเดอร์ `_components/` ภายใต้ Route นั้น เช่น `app/(auth)/register/_components/register-form.tsx`
- คอมโพเนนต์ที่ถูกใช้ซ้ำตั้งแต่ 2 หน้าขึ้นไป ให้ย้ายมาไว้ที่ `src/components/<feature>/` หรือ `src/components/common/`
- Primitive UI components (ปุ่ม, อินพุต, ไดอะล็อก) ให้อยู่ที่ `src/components/ui/`

---

## 5. Design System, Styling & UI Best Practices

### 5.1 ระบบสี Semantic Colors และ Theme Tokens

โปรเจกต์ใช้ระบบสี **OKLCH** ผ่าน CSS Variables ใน `src/styles/globals.css`:

- **ห้าม Hardcode ค่าสี Hex / RGB ใน Tailwind class ตรงๆ** (เช่น ห้าม `bg-[#0F2A1E]` หรือ `text-[#333]`)
- **ต้องใช้ Semantic Color Classes ของระบบเสมอ:**
  - Background: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`
  - Text: `text-foreground`, `text-card-foreground`, `text-muted-foreground`, `text-primary`
  - Brand Primary: `bg-primary`, `text-primary-foreground`, `border-primary` (สีเขียว Teal ของ PAWND)
  - Secondary / Accent: `bg-secondary`, `text-secondary-foreground`, `bg-accent`
  - Error / Danger: `bg-destructive`, `text-destructive`, `border-destructive`
  - Border & Ring: `border-border`, `ring-ring`
- **ข้อยกเว้น:** สี Brand เฉพาะของ Third-party (เช่น LINE `#06C755`, Google SVG) หรือกราฟิก Illustration SVG ที่มีสีเฉพาะจุด

### 5.2 รูปทรง (Border Radius) & Spacing

- ค่าฐาน `--radius` คือ `0.625rem` (10px)
- ปุ่ม, Input, Card ของ PAWND ได้รับการออกแบบให้มีความโค้งมน นุ่มนวล อบอุ่น:
  - Button & Input: ใช้ `rounded-2xl` เป็นค่ามาตรฐาน
  - Modal / Card ขนาดใหญ่: ใช้ `rounded-3xl`
  - Checkbox / Tag เล็ก: ใช้ `rounded-[5px]` หรือ `rounded-md`
- รักษาระยะ Spacing ให้สม่ำเสมอโดยใช้ Scale ของ Tailwind: `gap-1.5`, `gap-3`, `gap-4`, `gap-6`, `p-4`, `p-6`

### 5.3 Typography (ฟอนต์และลำดับตัวอักษร)

- ใช้ฟอนต์ **Noto Sans** ผ่านตัวแปร `--font-sans` (`src/styles/font.ts`)
- กำหนด Type Scale ชัดเจน:
  - Page Title: `text-2xl font-bold text-foreground`
  - Section Header: `text-xl font-semibold text-foreground`
  - Subtitle / Description: `text-sm text-muted-foreground`
  - Body Text: `text-sm` หรือ `text-base`
  - Caption / Note: `text-xs text-muted-foreground`

### 5.4 Iconography

- ใช้ **Lucide React** (`lucide-react`) เป็น Icon Library หลักของทั้งโปรเจกต์
- ระบุขนาดด้วย Tailwind sizing เช่น `size-3.5`, `size-4`, `size-5` (ห้ามปล่อยให้ขนาดไอคอนเพี้ยน)
- ไอคอนพิเศษหรือโลโก้แบรนด์ ให้แยกเป็น SVG Component ใน `BrandIcons.tsx` หรือ `Icons.tsx`

### 5.5 Mobile-First & Responsive Design

- ออกแบบและเขียนสไตล์โดยยึด **Mobile-First** เสมอ (เขียน default class สำหรับ mobile แล้วค่อยขยายด้วย `sm:`, `md:`, `lg:`, `xl:`)
- ปุ่มและพื้นที่คลิก (Touch Target) บน Mobile ต้องมีขนาดอย่างน้อย **40x40px** เพื่อความสะดวกในการสัมผัส
- หน้าจอ Auth (Register / Login) บน Desktop ให้แสดงผลแบบ Split Screen (มี `AuthAside` แบนเนอร์ซ้ายมือ) และบน Mobile ให้ซ่อน Aside (`hidden md:flex`)

### 5.6 Form Handling & Validation Guide

- ใช้ **React Hook Form (`useForm`)** ร่วมกับ **Zod Schema Resolver (`@hookform/resolvers/zod`)** ในทุกฟอร์ม
- สร้าง Schema สำหรับ Form ในไฟล์แยกหรือส่วนบนของ Component:
  ```ts
  import { z } from 'zod';

  export const registerSchema = z.object({
    firstName: z.string().min(1, 'กรุณากรอกชื่อจริง'),
    lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: z.string().min(8, 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, 'กรุณายอมรับข้อกำหนดในการให้บริการ'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านยืนยันไม่ตรงกัน',
    path: ['confirmPassword'],
  });
  ```
- แสดงข้อความ Error ภาษาไทยที่กระชับ ชัดเจน ใต้ Input Field เสมอ
- จัดการสถานะ `isSubmitting` / `disabled` บนปุ่ม Submit เพื่อป้องกันการกดส่งข้อมูลซ้ำ (Double Submission)

### 5.7 Image Optimization (`next/image`)

- ใช้คอมโพเนนต์ `<Image />` จาก `next/image` เสมอ ห้ามใช้ `<img>` แท็กปกติ
- ระบุ `alt` attribute ที่มีความหมายต่อ Accessibility เสมอ
- กำหนด `width` / `height` หรือใช้ `fill` ร่วมกับ container `relative` เพื่อป้องกัน Layout Shift (CLS)

### 5.8 Accessibility (a11y)

- ใช้ Semantic HTML Tags ให้ถูกต้อง (`<main>`, `<header>`, `<nav>`, `<aside>`, `<section>`, `<form>`, `<button>`)
- ปุ่มที่มีเฉพาะไอคอน (Icon-only Button) ต้องมี `aria-label` เสมอ (เช่น ปุ่ม Toggle Show/Hide Password)
- Form Field ต้องผูก `<Label htmlFor="id">` กับ `<Input id="id">` อย่างถูกต้อง

---

## 6. ข้อกำหนดการทำงานร่วมกับ PAWND Backend API

### 6.1 API Contract และ Endpoint Standard

- Frontend ต้องเรียก API ให้สอดคล้องกับ Endpoint ของ Backend (Backend ปัจจุบันยังไม่ใช้ global prefix `/api/v1`)
- Data Format:
  - Request Body: JSON หรือ `FormData` (กรณีมี File Upload)
  - Date & Time: รับ-ส่งเป็น **ISO-8601 UTC String** เสมอ และแปลงเป็นเวลาท้องถิ่น (Locale Thai) ที่ UI
  - Decimal / Number: จัดการแปลง Type อย่างชัดเจน

### 6.2 การจัดการสถานะ UI (UI State Handling)

ทุกหน้าจอที่ต้อง Fetch ข้อมูลจาก Backend **ต้องจัดการครบทั้ง 4 สถานะ**:
1. **Loading State:** แสดง Skeleton Loader หรือ Spinner ที่สวยงาม (ไม่ปล่อยให้จอกระตุกหรือขาวโพลน)
2. **Success / Content State:** แสดงข้อมูลจริงตาม Layout
3. **Empty State:** เมื่อไม่มีข้อมูล (เช่น ยังไม่มีประกาศ, ไม่มีข้อความ) ต้องมีข้อความและภาพกราฟิก/ไอคอนสื่อความหมายพร้อม Call to Action
4. **Error State:** เมื่อเกิด Error (Network fail, 404, 500) ต้องแสดง Toast หรือ Error Message ที่สุภาพ ไม่แสดง Raw Technical Error หรือ Stack trace แก่ผู้ใช้

### 6.3 Authentication & Session Management

- รองรับการเก็บ Access Token และ Session อย่างปลอดภัย
- เมื่อ API ตอบกลับ `401 Unauthorized`:
  - พยายาม Refresh Token (หากมีกลไก Refresh) หรือ Clear Session แล้ว Redirect ไปยังหน้า `/login`
- Protected Routes: ป้องกันการเข้าถึงหน้าเฉพาะสมาชิกด้วย Middleware หรือ Auth Guard

---

## 7. Business Rules & Feature Specifications (Frontend Scope)

### 7.1 Authentication & Registration Flow
- **Register Form:** รับ `firstName`, `lastName`, `email`, `password`, `confirmPassword` และยอมรับ Terms
- **Password Input:** มีปุ่มกดดู/ซ่อนรหัสผ่าน (Show/Hide Toggle)
- **Social Login:** ปุ่ม Google Login และ LINE Login (ใช้ไอคอนและสี Brand ที่ถูกต้อง)
- **Email Verification:** มีหน้าจอสำหรับกรอก OTP เพื่อยืนยันอีเมลหลังสมัครสมาชิก

### 7.2 Pet Profile & QR Code
- หน้าสร้าง/แก้ไขข้อมูลสัตว์เลี้ยง (ชื่อ, สายพันธุ์, เพศ, สี, ลักษณะเด่น `distinctive_features`, รูปภาพ)
- รองรับการจัดลำดับรูปภาพใน Gallery
- หน้าแสดง Public Pet Profile เมื่อสแกนผ่าน Pet QR Code (แสดงเฉพาะข้อมูลที่เจ้าของอนุญาต)
- หน้าพิมพ์/บันทึก Pet QR Code Tag ด้วย Template มาตรฐาน

### 7.3 Lost & Found Posts
- ฟอร์มสร้างประกาศ Lost / Found:
  - อัปโหลดรูปภาพได้สูงสุด **3 รูป**
  - เลือกพิกัดบนแผนที่ หรือระบุสถานที่พบ/หาย
  - ระบุรายละเอียด วันที่ และข้อมูลติดต่อเพิ่มเติม (ทางเลือก)
  - ปุ่มเรียกใช้ **AI Generate Description** ช่วยเขียนคำบรรยายประกาศ
- หน้า Pet Post Detail:
  - แสดงข้อมูลสัตว์, สถานที่, รูปภาพ
  - แสดง **Post Event Timeline** (`POST_CREATED` -> `AI_MATCHES_FOUND` -> `AI_MATCH_CONFIRMED` -> `REUNITED` -> `POST_CLOSED`)
  - ปุ่มแชร์ประกาศ, ปุ่ม In-app Chat ติดต่อเจ้าของ, และปุ่มสร้าง Flyer/Poster Template

### 7.4 AI Smart Matching Results
- หน้าแสดงรายการสัตว์เลี้ยงที่ AI จับคู่ได้ (Candidate Matches)
- แสดงแถบคะแนนความเหมือน (`MatchScoreBadge`):
  - คะแนนรวม `final_score`
  - รายละเอียดคะแนนย่อย: ความคล้ายของภาพ (Vector), ลักษณะภายนอก (Feature), ระยะทาง (Location), วันที่ (Date)
- เจ้าของประกาศสามารถกด Pin / Dismiss รายการจับคู่ได้

### 7.5 Realtime Chat & Community
- หน้าสนทนา In-app Chat แสดงประวัติข้อความ, สถานะการส่ง, รูปภาพแนบ
- หน้า Community Feed แสดงโพสต์พูดคุย, คอมเมนต์ และปุ่มรายงานโพสต์ (Report)

---

## 8. Code Quality, TypeScript & Linting Rules

- **Strict TypeScript:** ห้ามใช้ `any` เด็ดขาด หากจำเป็นต้องใช้ generic หรือ unknown ให้อธิบายเหตุผล
- **Code Style:** ใช้ Single Quotes, 2 Spaces Indentation, Trailing Comma all ตาม `.prettierrc`
- **Naming Conventions:**
  - Components: `PascalCase` (เช่น `RegisterForm.tsx`, `PetCard.tsx`)
  - Files & Folders (Route/Utils): `kebab-case` (เช่น `register-form.tsx`, `api-client.ts`)
  - Functions & Variables: `camelCase` (เช่น `handleSubmit`, `formatDate`)
  - Types & Interfaces: `PascalCase` (เช่น `UserResponse`, `PetPost`)
  - Constants: `UPPER_SNAKE_CASE` หรือ `camelCase` ตามความเหมาะสม
- **Clean Code:** ลบ `console.log` ที่ใช้ทดสอบออกก่อน Commit ทุกครั้ง

---

## 9. Definition of Done (DoD) สำหรับ Frontend

งานจะถือว่าเสร็จสมบูรณ์ (Done) และพร้อมส่งมอบเมื่อผ่านเกณฑ์ทั้งหมดดังนี้:

- [ ] ตรงตาม Ticket, Acceptance Criteria และดีไซน์ UI ที่กำหนด
- [ ] โค้ดคอมโพเนนต์แบ่งสัดส่วน Server Component / Client Component อย่างเหมาะสม
- [ ] ใช้ Shared Components (`src/components/ui/`) และ Utilities (`src/lib/utils.ts`) เดิม ไม่สร้างซ้ำ
- [ ] ใช้ Semantic Color Tokens จาก `globals.css` ครบถ้วน (ไม่มี Hardcoded colors)
- [ ] จัดการครบทั้ง 4 สถานะ: Loading, Success, Empty, Error
- [ ] Form มี Validation ครบถ้วนด้วย Zod และแสดง Error Message ภาษาไทยชัดเจน
- [ ] Responsive รองรับทั้ง Mobile, Tablet และ Desktop
- [ ] รัน `pnpm lint` ผ่านฉลุย ไม่มี ESLint errors
- [ ] รัน `pnpm build` ผ่านสมบูรณ์ ไม่มี TypeScript / Next.js compile errors
- [ ] ไม่มี Secret / API Key / PII รั่วไหลใน Client-side code หรือ Git diff
- [ ] สร้าง Local Commit ตามมาตรฐาน Conventional Commits และ **ยังไม่ได้ push**

---

## 10. Git Workflow & Commit Policy

### 10.1 ก่อนเริ่มแก้ไขโค้ด
```bash
git status
git branch --show-current
```
- ห้ามทำงานบน branch อื่นโดยไม่ได้รับอนุญาต
- หากมี uncommitted changes ของคนอื่นอยู่ ห้ามแตะต้องหรือลบเด็ดขาด

### 10.2 การตรวจสอบก่อน Commit
1. รันคำสั่งตรวจสอบ:
   ```bash
   pnpm lint
   pnpm build
   ```
2. ตรวจสอบสถานะไฟล์:
   ```bash
   git status --short
   git diff
   ```
3. Stage เฉพาะไฟล์ที่เกี่ยวข้องกับงาน:
   ```bash
   git add <specific-files>
   ```

### 10.3 รูปแบบ Commit Message (Conventional Commits)

```text
<type>(<scope>): <short description in English>
```

**Types ที่อนุญาต:**
- `feat`: เพิ่มหน้าจอ / คอมโพเนนต์ / ฟีเจอร์ใหม่
- `fix`: แก้ไข UI bug หรือ Logic error
- `refactor`: ปรับโครงสร้างโค้ดโดยไม่กระทบการทำงานเดิม
- `style`: ปรับแต่งความสวยงาม / CSS / UI Layout
- `docs`: อัปเดตเอกสารหรือคู่มือ
- `chore`: จัดการ Config / Dependencies / Tooling

**ตัวอย่าง Commit Message:**
```text
feat(auth): implement register form with zod validation
feat(ui): add password visibility toggle component
fix(styles): resolve dark mode contrast on primary button
docs(agents): update frontend engineering guidelines
```

### 10.4 หลัง Commit

AI Agent ต้องหยุดและรายงานผลต่อผู้ใช้ โดย **ห้ามรันคำสั่งต่อไปนี้เองเด็ดขาด**:
```bash
# ❌ ห้ามรันคำสั่งเหล่านี้:
git push
git push --force
git merge
gh pr create
```

---

## 11. รูปแบบรายงานผลของ AI Agent (Response Template)

เมื่อ AI Agent ปฏิบัติงานเสร็จสิ้น ให้สรุปรายงานด้วยรูปแบบนี้เสมอ:

```text
### ✅ งานที่ดำเนินการเสร็จสิ้น:
- [สรุปรายการงานที่ทำแบบกระชับ]

### 📁 ไฟล์สำคัญที่สร้าง / แก้ไข:
- [ระบุ path ไฟล์ เช่น src/app/(auth)/register/_components/register-form.tsx]

### 🧪 ผลการตรวจสอบคุณภาพโค้ด:
- pnpm lint: [ผ่าน / ไม่ผ่าน]
- pnpm build: [ผ่าน / ไม่ผ่าน]

### 📌 Git Commit:
- <commit-hash> <commit-message>

### ⚠️ ข้อสังเกต / สิ่งที่ต้องพัฒนาต่อ:
- [ระบุสิ่งที่ยังค้างหรือคำแนะนำเพิ่มเติม]

*(ยืนยัน: บันทึกเฉพาะ Local Commit เรียบร้อยแล้ว ยังไม่ได้ Push ขึ้น Remote ตามกฎความปลอดภัยครับ)*
```

---

## 12. Checklist สรุปย่อสำหรับทุกงาน (Quick Checklist)

- [ ] อ่าน `AGENTS.md` และตรวจสอบ `src/lib/`, `src/styles/`, `src/components/ui/` แล้ว
- [ ] ใช้ `cn()` จาก `src/lib/utils.ts` และใช้คอมโพเนนต์ใน `src/components/ui/`
- [ ] ใช้ Semantic Color Tokens จาก `globals.css` ไม่ hardcode สี
- [ ] จัดการครบทุก UI state (Loading, Error, Empty, Success)
- [ ] Form Validation ครบด้วย React Hook Form + Zod
- [ ] รองรับ Responsive Mobile-First และ a11y (aria-labels)
- [ ] ตรวจสอบ `pnpm lint` และ `pnpm build` ผ่านเรียบร้อย
- [ ] Commit ด้วย Conventional Commits
- [ ] **ไม่ได้สั่ง `git push` หรือสร้าง PR เองเด็ดขาด**

