// src/services/api.js
import { API_BASE_URL } from '../utils/config'

export const apiFetch = async (endpoint, options = {}) => {
    // Lấy userId tạm thời từ LocalStorage (Sẽ được thay thế bằng Zalo ID thật ở BƯỚC 3)
    // Tạm thời fallback về ID của user "Nguyễn Văn Dân" đã được seed sẵn trong DB ASP.NET
    const userId =
        localStorage.getItem('x-user-id') ||
        '00000000-0000-0000-0000-000000000001'

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'x-user-id': userId, // Inject header định danh cho backend
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    }

    // Nếu có body (POST/PUT), tự động chuyển thành chuỗi JSON
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body)
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
        const data = await response.json()

        // 1. Bắt lỗi HTTP cơ bản (Ví dụ: 401 Unauthorized, 404 NotFound, 500 Server Error)
        if (!response.ok) {
            throw new Error(data.message || 'Có lỗi kết nối đến máy chủ.')
        }

        // 2. Bắt lỗi logic nghiệp vụ từ Backend ASP.NET (success = false)
        if (data.success === false) {
            throw new Error(data.message || 'Thao tác không thành công.')
        }

        // Nếu thành công, chỉ trả về phần "data" lõi để các component UI dễ sử dụng
        return data.data
    } catch (error) {
        console.error(
            `[API Error] ${options.method || 'GET'} ${endpoint}:`,
            error,
        )
        throw error // Ném lỗi ra ngoài để UI hiển thị popup/toast
    }
}
