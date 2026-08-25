import { authFetch } from '@/lib/api/auth-fetch';
import {
  DashboardSummary,
  GetPetByIdResponse,
  GetPetsParams,
  GetPetsResponse,
  GetPostByIdResponse,
  GetPostsParams,
  GetPostsResponse,
  GetUserByIdResponse,
  GetUsersParams,
  GetUsersResponse,
  MonthlyTrendPoint,
  UpdatePostStatusResponse,
  UpdateUserStatusResponse,
} from '@/types/admin';
import { PostStatus } from '@/types/post';
import { UserStatus } from '@/types/user';

export const AdminApi = {
  // ดึงข้อมูลสรุปภาพรวมสำหรับหน้าแดชบอร์ดผู้ดูแลระบบ
  async dashboardSummary() {
    return await authFetch<DashboardSummary>('/admin/dashboard', {
      method: 'GET',
    });
  },
  // ดึงข้อมูลจำนวนโพสต์ Lost/Found/Reunited แยกรายเดือนของปีที่ระบุ
  async monthlyTrend(year: number) {
    return await authFetch<MonthlyTrendPoint[]>(
      `/admin/dashboard/monthly-trend?year=${year}`,
      { method: 'GET' },
    );
  },
  // ดึงรายชื่อผู้ใช้งานทั้งหมดแบบแบ่งหน้า พร้อมรองรับ filter status/role/search
  async getUsers(params: GetUsersParams = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.role) query.set('role', params.role);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString();
    return await authFetch<GetUsersResponse>(
      `/admin/users${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' },
    );
  },
  // ดึงข้อมูลผู้ใช้งานแบบละเอียด 1 คน สำหรับหน้ารายละเอียดผู้ใช้งาน
  async getUserById(id: string) {
    return await authFetch<GetUserByIdResponse>(`/admin/users/${id}`, {
      method: 'GET',
    });
  },
  // เปลี่ยนสถานะบัญชีผู้ใช้งาน (เช่น ระงับบัญชี / ขึ้นบัญชีดำ / เปิดใช้งานอีกครั้ง)
  async updateUserStatus(id: string, status: UserStatus) {
    return await authFetch<UpdateUserStatusResponse>(
      `/admin/users/${id}/status`,
      { method: 'PATCH', body: { status } },
    );
  },
  // ดึงรายการประกาศ Lost/Found ทั้งหมดแบบแบ่งหน้า พร้อมรองรับ filter type/status/province/search
  async getPosts(params: GetPostsParams = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.type) query.set('type', params.type);
    if (params.status) query.set('status', params.status);
    if (params.province) query.set('province', params.province);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString();
    return await authFetch<GetPostsResponse>(
      `/admin/posts${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' },
    );
  },
  // ดึงข้อมูลประกาศแบบละเอียด 1 รายการ สำหรับหน้ารายละเอียดประกาศ
  async getPostById(id: string) {
    return await authFetch<GetPostByIdResponse>(`/admin/posts/${id}`, {
      method: 'GET',
    });
  },
  // เปลี่ยนสถานะประกาศ (เช่น ปิดประกาศ / ซ่อนประกาศ / ทำเครื่องหมายพากลับบ้านแล้ว / ลบ)
  async updatePostStatus(id: string, status: PostStatus) {
    return await authFetch<UpdatePostStatusResponse>(`/admin/posts/${id}`, {
      method: 'PATCH',
      body: { status },
    });
  },
  // ดึงรายการสัตว์เลี้ยงทั้งหมดในระบบแบบแบ่งหน้า พร้อมรองรับ filter type/search
  async getPets(params: GetPetsParams = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.type) query.set('type', params.type);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString();
    return await authFetch<GetPetsResponse>(
      `/admin/pets${queryString ? `?${queryString}` : ''}`,
      { method: 'GET' },
    );
  },
  // ดึงข้อมูลสัตว์เลี้ยงแบบละเอียด 1 ตัว สำหรับหน้ารายละเอียดสัตว์เลี้ยง
  async getPetById(id: string) {
    return await authFetch<GetPetByIdResponse>(`/admin/pets/${id}`, {
      method: 'GET',
    });
  },
  // สั่งให้ AI ค้นหาคู่จับคู่ใหม่สำหรับประกาศนี้ (re-run matching engine)
  // รูปแบบ response ยังไม่มี contract ที่แน่ชัด จึงไม่ parse type ที่นี่
  // ฝั่งหน้าเว็บใช้แค่ผลสำเร็จ/ล้มเหลว แล้ว refresh หน้าเพื่อดึง aiMatches ล่าสุดผ่าน getPostById แทน
  async triggerAiMatch(postId: string) {
    return await authFetch<unknown>(`/admin/posts/${postId}/ai-match`, {
      method: 'POST',
    });
  },
};
