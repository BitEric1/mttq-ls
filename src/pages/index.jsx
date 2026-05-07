// src/pages/index.jsx
import { useEffect, useState } from 'react'
import { getLocation } from 'zmp-sdk/apis'
import {
    Avatar,
    Box,
    Button,
    Icon,
    Modal,
    Page,
    Text,
    useNavigate,
    useSnackbar,
} from 'zmp-ui'
import { authenticateZaloUser } from '../services/auth'
import { getLocalAlerts } from '../services/damageApi'

const HomePage = () => {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const snackbar = useSnackbar()

    const [alertModalVisible, setAlertModalVisible] = useState(false)
    const [alertData, setAlertData] = useState([])

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

    useEffect(() => {
        const checkDangerZone = async () => {
            if (sessionStorage.getItem('hasShownAlert')) return

            try {
                const location = await getLocation({})
                if (!location || !location.latitude) return

                const response = await getLocalAlerts(
                    location.latitude,
                    location.longitude,
                )

                if (response.success && response.hasAlert) {
                    setAlertData(response.data)
                    setAlertModalVisible(true)
                    sessionStorage.setItem('hasShownAlert', 'true')
                }
            } catch (error) {
                console.log('Không thể quét cảnh báo:', error)
            }
        }

        checkDangerZone()
    }, [])

    // Hàm render Menu Item để code gọn gàng, tái sử dụng
    const MenuItem = ({ icon, label, bgColor, iconColor, onClick, badge }) => (
        <div
            onClick={onClick}
            className="flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity"
        >
            <div
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-2 ${bgColor}`}
            >
                <Icon icon={icon} className={iconColor} size={28} />
                {badge && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white flex items-center justify-center">
                        <Icon
                            icon="zi-star-solid"
                            size={8}
                            className="text-white"
                        />
                    </div>
                )}
            </div>
            <Text className="text-center text-[11px] text-gray-700 font-medium leading-tight px-1">
                {label}
            </Text>
        </div>
    )

    return (
        <Page className="page bg-white flex flex-col min-h-screen relative">
            <div className="flex-1">
                {/* 1. KHU VỰC HEADER - Đỏ đô trang trọng */}
                <div className="bg-[#b91c1c] pt-10 pb-6 px-4 rounded-b-[30px] shadow-md relative overflow-hidden">
                    {/* Họa tiết mờ */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute -top-10 -right-10 w-40 h-40 border-[20px] border-yellow-400 rounded-full opacity-30"></div>
                        <div className="absolute top-20 -left-10 w-32 h-32 border-[15px] border-yellow-400 rounded-full opacity-20"></div>
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center">
                            <div className="p-0.5 bg-yellow-400 rounded-full shadow-sm mr-3">
                                <Avatar
                                    src={user?.avatar}
                                    size={48}
                                    className="border-2 border-white"
                                />
                            </div>
                            <Box>
                                <Text
                                    size="xxxxSmall"
                                    className="text-red-200 font-medium tracking-wide uppercase mb-0.5"
                                >
                                    Xin chào công dân
                                </Text>
                                <Text
                                    bold
                                    className="text-white text-base drop-shadow-sm"
                                >
                                    {user?.name || 'Đang tải...'}
                                </Text>
                            </Box>
                        </div>
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <Icon icon="zi-notified" className="text-white" />
                        </div>
                    </div>
                </div>

                {/* 2. BANNER NỔI BẬT (Hero Section) */}
                <Box px={4} className="-mt-3 relative z-20">
                    <div className="bg-gradient-to-r from-red-800 to-red-600 rounded-2xl p-4 shadow-lg text-white relative overflow-hidden flex items-center justify-between">
                        <div className="w-2/3 relative z-10">
                            <div className="bg-white text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2">
                                KHẨN CẤP
                            </div>
                            <Text
                                bold
                                size="small"
                                className="leading-tight mb-1"
                            >
                                ĐƯỜNG DÂY NÓNG CỨU HỢ
                            </Text>
                            <Text size="xxxxSmall" className="opacity-90">
                                Gọi ngay khi gặp sự cố thiên tai
                            </Text>
                        </div>
                        <div className="bg-white p-3 rounded-full shadow-inner relative z-10">
                            <Icon
                                icon="zi-call"
                                className="text-red-600 animate-pulse"
                                size={24}
                            />
                        </div>
                        {/* Vector trang trí */}
                        <Icon
                            icon="zi-shield-solid"
                            className="absolute -right-4 -bottom-4 text-white opacity-10"
                            size={100}
                        />
                    </div>
                </Box>

                {/* 3. MENU CHỨC NĂNG (GRID 4 CỘT - Chuẩn phong cách ảnh mẫu) */}
                <Box px={4} pt={6} className="bg-white">
                    <Text
                        bold
                        className="mb-4 text-gray-800 text-sm border-l-4 border-red-600 pl-2"
                    >
                        QUẢN LÝ THIỆT HẠI
                    </Text>
                    <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                        <MenuItem
                            onClick={() => navigate('/create-damage-report')}
                            icon="zi-warning-solid"
                            label="Khai báo thiệt hại"
                            bgColor="bg-red-50"
                            iconColor="text-red-600"
                            badge={true}
                        />
                        <MenuItem
                            onClick={() => navigate('/my-damage-reports')}
                            icon="zi-list-1"
                            label="Tra cứu hồ sơ"
                            bgColor="bg-blue-50"
                            iconColor="text-blue-600"
                        />
                        <MenuItem
                            onClick={() => navigate('/damage-map')}
                            icon="zi-location-solid"
                            label="Bản đồ cảnh báo"
                            bgColor="bg-orange-50"
                            iconColor="text-orange-500"
                        />
                        <MenuItem
                            onClick={() => navigate('/guidelines')}
                            icon="zi-info-circle-solid"
                            label="Cẩm nang ứng phó"
                            bgColor="bg-teal-50"
                            iconColor="text-teal-600"
                        />
                    </div>
                </Box>

                <Box px={4} pt={6} pb={8} className="bg-white">
                    <Text
                        bold
                        className="mb-4 text-gray-800 text-sm border-l-4 border-red-600 pl-2"
                    >
                        DỊCH VỤ - THÔNG TIN
                    </Text>
                    <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                        <MenuItem
                            onClick={() => navigate('/create-report')}
                            icon="zi-edit-text"
                            label="Gửi phản ánh"
                            bgColor="bg-indigo-50"
                            iconColor="text-indigo-600"
                        />
                        <MenuItem
                            onClick={() => navigate('/my-reports')}
                            icon="zi-memory"
                            label="Phản ánh của tôi"
                            bgColor="bg-purple-50"
                            iconColor="text-purple-600"
                        />
                        <MenuItem
                            onClick={() => navigate('/surveys')}
                            icon="zi-poll"
                            label="Khảo sát ý kiến"
                            bgColor="bg-pink-50"
                            iconColor="text-pink-600"
                        />
                        <MenuItem
                            onClick={() => navigate('/news')}
                            icon="zi-browser-solid"
                            label="Tin tức - Sự kiện"
                            bgColor="bg-cyan-50"
                            iconColor="text-cyan-600"
                        />
                    </div>
                </Box>
            </div>

            {/* 4. FOOTER - Nền đỏ sậm, chữ trắng */}
            <Box
                p={5}
                className="mt-auto bg-[#880d1e] text-center flex flex-col items-center shadow-inner rounded-t-3xl"
            >
                <Text
                    bold
                    className="text-white uppercase tracking-wider mb-1 text-[13px]"
                >
                    UBMTTQ VIỆT NAM TỈNH LẠNG SƠN
                </Text>
                <Text className="text-red-200 text-[10px] mb-0.5">
                    Địa chỉ: Đ.Hoàng Văn Thụ, P.Chi Lăng, TP Lạng Sơn
                </Text>
                <Text className="text-red-200 text-[10px]">
                    Điện thoại: (0205) 3812.209 - Hệ thống Khai báo v1.0
                </Text>
            </Box>

            {/* Modal Cảnh báo (Giữ nguyên logic) */}
            <Modal
                visible={alertModalVisible}
                title="CẢNH BÁO NGUY HIỂM"
                onClose={() => setAlertModalVisible(false)}
            >
                <Box className="flex flex-col items-center text-center">
                    <Icon
                        icon="zi-warning-solid"
                        size={56}
                        className="text-red-600 mb-2 animate-pulse drop-shadow-md"
                    />
                    <Text className="text-gray-700 text-sm mb-4">
                        Phát hiện{' '}
                        <strong className="text-red-600 text-lg">
                            {alertData.length} khu vực
                        </strong>{' '}
                        có thiệt hại <b>NẶNG</b> trong bán kính 3km quanh bạn.
                    </Text>
                    <div className="w-full max-h-48 overflow-y-auto text-left bg-red-50 p-3 rounded-lg border border-red-100 mb-4 shadow-inner">
                        {alertData.map((alert, index) => (
                            <div
                                key={alert.id}
                                className={`${index > 0 ? 'border-t border-red-200 mt-2 pt-2' : ''}`}
                            >
                                <Text bold className="text-red-800 text-sm">
                                    {alert.title}
                                </Text>
                                <div className="flex justify-between items-start mt-1">
                                    <Text
                                        size="xSmall"
                                        className="text-gray-600 italic pr-2 leading-tight"
                                    >
                                        {alert.address}
                                    </Text>
                                    <div className="bg-red-100 px-2 py-1 rounded text-red-700 font-bold text-[10px] whitespace-nowrap border border-red-200">
                                        Cách {alert.distanceKm} km
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Box>
                <Box className="flex gap-3">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => setAlertModalVisible(false)}
                    >
                        Đã hiểu
                    </Button>
                    <Button
                        fullWidth
                        className="bg-red-600 text-white border border-red-700 shadow-md"
                        onClick={() => {
                            setAlertModalVisible(false)
                            navigate('/damage-map')
                        }}
                    >
                        Xem bản đồ
                    </Button>
                </Box>
            </Modal>
        </Page>
    )
}

export default HomePage
