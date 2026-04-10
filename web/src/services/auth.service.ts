/**
 * Auth Service - Fix lỗi Font & Phân cấp Owner > Admin > OP
 */

export type UserRole = "owner" | "admin" | "op";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

/**
 * Giải mã Unicode để hiển thị đúng "Lê Lý Quỳnh Long"
 */
function decodeUnicodeBase64(str: string) {
  return decodeURIComponent(
    atob(str.replace(/-/g, '+').replace(/_/g, '/'))
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * PHÂN CẤP QUYỀN HẠN
 * Owner: Toàn quyền | Admin: Quản lý | OP: Vận hành
 */
function assignRole(email: string): UserRole {
  const emailLower = email.toLowerCase();
  
  // Quyền Owner cao nhất
  const owners = ["lelyquynhlong@gmail.com", "owner@gmail.com"]; 
  
  // Quyền Admin cấp trung
  const admins = ["admin@gmail.com", "manager@gmail.com"];
  
  if (owners.includes(emailLower)) return "owner";
  if (admins.includes(emailLower)) return "admin";
  
  return "op"; 
}

export async function googleLoginRequest(googleToken: string): Promise<AuthResponse> {
  try {
    const base64Url = googleToken.split('.')[1];
    const payload = JSON.parse(decodeUnicodeBase64(base64Url));

    return {
      success: true,
      token: googleToken,
      user: {
        id: payload.sub,
        email: payload.email,
        full_name: payload.name, // Tên sẽ hiện chuẩn tiếng Việt
        role: assignRole(payload.email),
        avatar: payload.picture 
      },
    };
  } catch (error) {
    console.error("Auth Error:", error);
    return { success: false, message: "Lỗi xác thực" };
  }
}

export async function getMeRequest(token: string): Promise<AuthUser | null> {
  try {
    const base64Url = token.split('.')[1];
    const payload = JSON.parse(decodeUnicodeBase64(base64Url));
    return {
      id: payload.sub,
      email: payload.email,
      full_name: payload.name,
      role: assignRole(payload.email),
      avatar: payload.picture
    };
  } catch {
    return null;
  }
}