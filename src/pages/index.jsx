// src/pages/index.jsx
import { useEffect, useState } from 'react'
import { Avatar, Box, Icon, Page, Text, useNavigate, useSnackbar } from 'zmp-ui'
import { authenticateZaloUser } from '../services/auth'

const HomePage = () => {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const snackbar = useSnackbar()

    useEffect(() => {
        const initApp = async () => {
            try {
                const userInfo = await authenticateZaloUser()
                setUser(userInfo)
            } catch (error) {
                snackbar.openSnackbar({ type: 'error', text: error.message })
            }
        }
        initApp()
    }, [])

    return (
        <Page className="page bg-gray-50 pb-8">
            {/* 1. KHU VỰC BANNER ĐỎ ĐẶC TRƯNG */}
            {/* Sử dụng bg-red-700 để ra đúng màu đỏ cờ Tổ Quốc, bo tròn góc dưới */}
            <div className="bg-red-700 pt-10 pb-16 px-4 rounded-b-[40px] shadow-lg relative overflow-hidden">
                {/* Các đốm sáng trang trí nền tạo cảm giác sang trọng */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl"></div>
                    <div className="absolute top-20 -left-10 w-32 h-32 bg-yellow-400 rounded-full blur-2xl"></div>
                </div>

                <div className="flex items-center relative z-10">
                    {/* Avatar được bọc trong một viền gradient vàng sáng */}
                    <div className="p-1 bg-gradient-to-tr from-yellow-500 to-yellow-200 rounded-full shadow-lg">
                        <Avatar
                            src={user?.avatar}
                            size={64}
                            className="border-2 border-white"
                        />
                    </div>
                    <Box ml={4}>
                        <Text
                            size="small"
                            className="text-yellow-100 mb-1 font-medium tracking-wide"
                        >
                            Xin chào công dân,
                        </Text>
                        <Text
                            bold
                            size="xLarge"
                            className="text-white drop-shadow-md"
                        >
                            {user?.name || 'Đang tải...'}
                        </Text>
                    </Box>
                </div>
            </div>

            {/* 2. KHU VỰC CHỨC NĂNG CHÍNH (MENU) */}
            {/* Sử dụng -mt-8 (margin-top âm) để khối menu nổi đè lên phần banner đỏ */}
            <Box p={4} className="-mt-8 relative z-20">
                <Text
                    bold
                    className="mb-4 text-red-800 text-[15px] text-center uppercase tracking-wider drop-shadow-sm"
                >
                    Cổng Thông Tin - Dịch Vụ
                </Text>

                <div className="grid grid-cols-2 gap-4">
                    {/* Nút 1: Gửi phản ánh */}
                    <div
                        onClick={() => navigate('/create-report')}
                        className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(220,38,38,0.08)] active:bg-red-50 transition-all border border-red-50"
                    >
                        <div className="bg-red-50 p-3 rounded-full mb-3 shadow-inner">
                            <Icon
                                icon="zi-edit-text"
                                className="text-red-700"
                                size={32}
                            />
                        </div>
                        <Text
                            bold
                            className="text-center text-sm text-gray-800"
                        >
                            Gửi phản ánh
                        </Text>
                    </div>

                    {/* Nút 2: Danh sách phản ánh */}
                    <div
                        onClick={() => navigate('/my-reports')}
                        className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(220,38,38,0.08)] active:bg-red-50 transition-all border border-red-50"
                    >
                        <div className="bg-red-50 p-3 rounded-full mb-3 shadow-inner">
                            <Icon
                                icon="zi-list-1"
                                className="text-red-700"
                                size={32}
                            />
                        </div>
                        <Text
                            bold
                            className="text-center text-sm text-gray-800"
                        >
                            Phản ánh của tôi
                        </Text>
                    </div>

                    {/* Nút 3: Khảo sát ý kiến */}
                    <div
                        onClick={() => navigate('/surveys')}
                        className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(220,38,38,0.08)] active:bg-red-50 transition-all border border-red-50"
                    >
                        <div className="bg-red-50 p-3 rounded-full mb-3 shadow-inner">
                            <Icon
                                icon="zi-poll"
                                className="text-red-700"
                                size={32}
                            />
                        </div>
                        <Text
                            bold
                            className="text-center text-sm text-gray-800"
                        >
                            Khảo sát ý kiến
                        </Text>
                    </div>

                    {/* Nút 4: Tin tức & Thông báo */}
                    <div
                        onClick={() => navigate('/news')}
                        className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(220,38,38,0.08)] active:bg-red-50 transition-all border border-red-50"
                    >
                        <div className="bg-red-50 p-3 rounded-full mb-3 shadow-inner">
                            <Icon
                                icon="zi-notified"
                                className="text-red-700"
                                size={32}
                            />
                        </div>
                        <Text
                            bold
                            className="text-center text-sm text-gray-800"
                        >
                            Tin tức & Thông báo
                        </Text>
                    </div>
                </div>
            </Box>

            {/* 3. FOOTER BẢN QUYỀN CHUẨN MỰC */}
            <Box p={4} className="mt-8 text-center flex flex-col items-center">
                {/* Icon cờ/huy hiệu giả lập nhỏ gọn */}
                <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center mb-2 shadow-sm border border-yellow-400">
                    <Icon
                        icon="zi-star-solid"
                        className="text-yellow-400"
                        size={16}
                    />
                </div>
                <Text
                    bold
                    size="small"
                    className="text-red-800 uppercase tracking-widest mb-1"
                >
                    UBMTTQ TỈNH LẠNG SƠN
                </Text>
                <Text size="xxxSmall" className="text-gray-400 uppercase">
                    Hệ thống tiếp nhận phản ánh kiến nghị
                </Text>
                <Text size="xxxSmall" className="text-gray-400 mt-2">
                    Phiên bản 1.0.0
                </Text>
            </Box>
        </Page>
    )
}

export default HomePage
