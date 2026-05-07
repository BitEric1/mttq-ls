// src/services/damageApi.js

// const API_BASE_URL = 'http://localhost:5266/api/v1'
import { API_BASE_URL } from '../utils/config'

// Tạm thời hardcode MÃ ID CỦA NGƯỜI DÂN mà chúng ta đã mồi trong DB để test (Nguyễn Văn Dân)
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'

// Hàm cấu hình gọi API chung
const fetchApi = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        'x-user-id': MOCK_USER_ID, // Gửi ID người dân xuống Backend
        ...options.headers,
    }

    // Nếu là upload file (FormData) thì trình duyệt tự set Content-Type, nên ta phải xóa cái json đi
    if (options.body instanceof FormData) {
        delete headers['Content-Type']
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Lỗi kết nối Server')
    return data
}

// 1. Upload Ảnh
export const uploadDamageImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return await fetchApi('/uploads/image', {
        method: 'POST',
        body: formData,
    })
}

// 2. Gửi khai báo thiệt hại
export const createDamageReport = async (payload) => {
    return await fetchApi('/damage-reports', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

// 3. Lấy danh sách cá nhân
export const getMyDamageReports = async () => {
    return await fetchApi('/damage-reports/my', {
        method: 'GET',
    })
}

// 4. Lấy dữ liệu Bản đồ
export const getGeoDamageMap = async () => {
    return await fetchApi('/geo/damage-map', {
        method: 'GET',
    })
}

// 5. Lấy danh sách điểm hỗ trợ (Y tế, Cứu trợ, Sơ tán)
export const getActiveSupports = async () => {
    return await fetchApi('/supports', {
        method: 'GET',
    })
}

// 6. Lấy danh sách cảnh báo nguy hiểm xung quanh
export const getLocalAlerts = async (lat, lng) => {
    return await fetchApi(`/geo/alerts?lat=${lat}&lng=${lng}`, {
        method: 'GET',
    })
}

// 7. Lấy danh sách hướng dẫn ứng phó (có thể thêm filter theo loại thiên tai trong tương lai)
export const getGuidelines = async () => {
    return await fetchApi('/guidelines', { method: 'GET' })
}

export const getGuidelineDetail = async (id) => {
    return await fetchApi(`/guidelines/${id}`, { method: 'GET' })
}

// 8. Lấy chi tiết báo cáo thiệt hại
export const getDamageReportDetail = async (id) => {
    return await fetchApi(`/damage-reports/${id}`, { method: 'GET' })
}
