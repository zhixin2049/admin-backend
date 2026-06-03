import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '../types';

// ============================================================
// Axios 请求封装
// 包含：统一请求头、Token注入、响应拦截、错误处理
// ============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- 请求拦截器 ----
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 注入 Token
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // CSRF Token（从 cookie 中读取，实际按后端方案调整）
    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- 响应拦截器 ----
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message: msg, data } = response.data;
    if (code === 200 || code === 0) {
      return data as unknown as AxiosResponse;
    }
    message.error(msg || '请求失败');
    return Promise.reject(new Error(msg));
  },
  (error) => {
    const status = error.response?.status;
    switch (status) {
      case 401:
        message.error('登录已过期，请重新登录');
        localStorage.removeItem('admin_token');
        window.location.href = '/adminlogin';
        break;
      case 403:
        message.error('暂无权限执行该操作');
        break;
      case 404:
        message.error('请求资源不存在');
        break;
      case 500:
        message.error('服务器内部错误');
        break;
      default:
        message.error(error.message || '网络错误');
    }
    return Promise.reject(error);
  }
);

// ---- 工具函数 ----
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

// ---- 通用请求方法 ----
export const http = {
  get<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, { params, ...config }) as Promise<T>;
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config) as Promise<T>;
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config) as Promise<T>;
  },
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.patch(url, data, config) as Promise<T>;
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config) as Promise<T>;
  },
};

export default instance;
