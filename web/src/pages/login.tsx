"use client";
import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { IconLock, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const { loginWithGoogle, isAuthenticated, isLoading, routePrefix } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Tự động chuyển hướng nếu đã đăng nhập thành công
  useEffect(() => {
    if (!isLoading && isAuthenticated && routePrefix) {
      navigate(`/${routePrefix}/dashboard`, { replace: true });
    }
  }, [isLoading, isAuthenticated, routePrefix, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      toast.error("Không nhận được dữ liệu từ Google");
      return;
    }

    setSubmitting(true);
    const error = await loginWithGoogle(credentialResponse.credential);
    setSubmitting(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Đăng nhập thành công!");
    }
  };

  if (isLoading) return null; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 mb-4">
            <IconLock size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Hệ thống VIETFUTURE</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sử dụng tài khoản Google nội bộ để quản trị
          </p>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
          {submitting ? (
            <div className="flex flex-col items-center gap-3">
              <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-medium">Đang xác thực...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Đăng nhập thất bại")}
              theme="filled_blue"
              shape="pill"
            />
          )}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 w-full text-center text-xs text-muted-foreground hover:underline"
        >
          Tiếp tục với quyền Khách (Viewer)
        </button>
      </div>
    </div>
  );
}