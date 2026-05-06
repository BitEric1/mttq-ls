// src/services/auth.js
import { getUserInfo, login } from 'zmp-sdk/apis'

export const authenticateZaloUser = async () => {
    try {
        // 1. Kích hoạt phiên đăng nhập với Zalo
        await login({})

        // 2. Xin quyền lấy thông tin cá nhân (Tên, Avatar)
        const { userInfo } = await getUserInfo({})

        // 3. Lưu thông tin thật vào Local Storage để hiển thị UI
        localStorage.setItem('zalo_user_name', userInfo.name)
        localStorage.setItem('zalo_user_avatar', userInfo.avatar)
        localStorage.setItem('zalo_real_id', userInfo.id)

        // 4. [MOCK CHO MVP] Lưu GUID của Nguyễn Văn Dân để api.js ghép vào Header
        localStorage.setItem(
            'x-user-id',
            '00000000-0000-0000-0000-000000000001',
        )

        return userInfo
    } catch (error) {
        console.error('Lỗi xác thực Zalo:', error)
        throw new Error('Không thể lấy thông tin Zalo. Vui lòng cấp quyền.')
    }
}
