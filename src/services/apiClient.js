// src/services/apiClient.js
import { API_BASE_URL } from '../utils/config'

export const apiClient = async (endpoint, options = {}) => {
    const { method = 'GET', body, headers = {}, ...customConfig } = options

    // Lấy userId tạm thời từ localStorage (Sẽ được Zalo SDK ghi vào ở Bước 3)
    // Fallback tạm về ID của "Nguyễn Văn Dân" đã seed ở Backend để test
    const userId =
        localStorage.getItem('zalo_user_id') ||
        '00000000-0000-0000-0000-000000000001'

    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId, // Header định danh bắt buộc cho Backend .NET
            ...headers,
        },
        ...customConfig,
    }

    if (body) {
        config.body = JSON.stringify(body)
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

        // Parse response trả về chuẩn ApiResponse của ASP.NET (success, message, data)
        const data = await response.json()

        if (!response.ok || !data.success) {
            // Backend của bạn trả về cấu trúc lỗi rất sạch, ta ném thẳng message ra
            throw new Error(data.message || 'Đã xảy ra lỗi kết nối máy chủ')
        }

        return data.data // Chỉ trả về payload thực tế để Component dùng cho gọn
    } catch (error) {
        console.error(`[API Call Failed] ${method} ${endpoint}:`, error)
        throw error
    }
}
