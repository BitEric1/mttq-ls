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
import logoMatTran from '../static/unnamed_5bc56.png'
const HomePage = () => {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const snackbar = useSnackbar()

    const [alertModalVisible, setAlertModalVisible] = useState(false)
    const [alertData, setAlertData] = useState([])

    // ==========================================
    // LOGIC KHỞI TẠO APP & LẤY THÔNG TIN USER
    // ==========================================
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
        // Mảng rỗng [] giúp tránh lỗi lặp vô hạn
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ==========================================
    // LOGIC KIỂM TRA CẢNH BÁO TẠI VỊ TRÍ
    // ==========================================
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

    // ==========================================
    // DANH SÁCH MENU (9 ITEMS - 3 CỘT x 3 HÀNG)
    // ==========================================
    const menuItems = [
        {
            title: 'Gọi khẩn cấp',
            icon: 'zi-call',
            color: 'text-red-600',
            action: () => {
                window.location.href = 'tel:02053812209'
            }, // Lệnh gọi điện thoại
            isPulse: true, // Cờ tạo hiệu ứng nhấp nháy
        },
        {
            title: 'Khai báo thiệt hại',
            icon: 'zi-warning-solid',
            color: 'text-orange-500',
            path: '/create-damage-report',
            badge: 'star',
        },
        {
            title: 'Bản đồ cảnh báo',
            icon: 'zi-location-solid',
            color: 'text-blue-500',
            path: '/damage-map',
        },
        {
            title: 'Tra cứu hồ sơ',
            icon: 'zi-search',
            color: 'text-blue-600',
            path: '/my-damage-reports',
        },
        {
            title: 'Gửi phản ánh',
            icon: 'zi-chat-solid',
            color: 'text-yellow-500',
            path: '/create-report',
        },
        {
            title: 'Phản ánh của tôi',
            icon: 'zi-list-1',
            color: 'text-teal-600',
            path: '/my-reports',
            badge: 'number',
        },
        {
            title: 'Hướng dẫn ứng phó',
            icon: 'zi-info-circle-solid',
            color: 'text-indigo-500',
            path: '/guidelines',
        },
        {
            title: 'Khảo sát ý kiến',
            icon: 'zi-poll',
            color: 'text-purple-600',
            path: '/surveys',
        },
        {
            title: 'Tin tức cộng đồng',
            icon: 'zi-note', // Icon cái chuông hiển thị chuẩn xác
            color: 'text-red-500',
            path: '/news',
        },
    ]

    return (
        <Page className="bg-white flex flex-col min-h-screen relative font-sans">
            <div className="flex-1 pb-10">
                {/* ==========================================
                    HEADER: PHONG CÁCH HÀNH CHÍNH VIỆT NAM
                ========================================== */}
                <div className="bg-[#a3171c] w-full rounded-b-3xl px-4 pt-12 pb-6 shadow-md relative overflow-hidden">
                    {/* Họa tiết mờ làm nền chìm */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 80%, transparent 80%, transparent)',
                            backgroundSize: '40px 40px',
                            backgroundPosition: '0 0, 20px 20px',
                        }}
                    ></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Thay thế phần div ngôi sao bằng thẻ img của bạn */}
                            <img
                                src={logoMatTran}
                                alt="Logo"
                                className="w-14 h-14 object-contain bg-white rounded-full p-1 shadow-md"
                            />

                            <div className="flex flex-col">
                                <Text className="text-yellow-400 font-bold text-sm tracking-wider uppercase drop-shadow-sm">
                                    ỦY BAN MẶT TRẬN TỔ QUỐC
                                </Text>
                                <Text className="text-white font-bold text-xl uppercase drop-shadow-md">
                                    Tỉnh Lạng Sơn
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* Lời chào User dạng thẻ banner nổi */}
                    <div className="mt-6 bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 relative z-10">
                        <Avatar
                            src={user?.avatar}
                            size={48}
                            className="border-2 border-yellow-400 shadow-sm"
                        />
                        <div className="flex flex-col text-white">
                            <Text
                                size="small"
                                className="text-white/80 font-medium"
                            >
                                Xin chào công dân,
                            </Text>
                            <Text bold size="large" className="text-white">
                                {user?.name || 'Đang tải...'}
                            </Text>
                        </div>
                    </div>
                </div>

                {/* ==========================================
                    GRID MENU 3 CỘT (grid-cols-3)
                ========================================== */}
                <div className="px-2 mt-6">
                    <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                        {menuItems.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    if (item.action) {
                                        item.action()
                                    } else if (item.path) {
                                        navigate(item.path)
                                    }
                                }}
                                className="flex flex-col items-center text-center cursor-pointer active:opacity-60 transition-opacity relative"
                            >
                                <div className="w-[68px] h-[68px] bg-[#f4f5f7] rounded-2xl flex items-center justify-center mb-2 relative shadow-sm border border-gray-100">
                                    <Icon
                                        icon={item.icon}
                                        className={`${item.color} ${item.isPulse ? 'animate-pulse' : ''}`}
                                        size={32}
                                    />

                                    {/* Hiệu ứng sao đỏ góc trên */}
                                    {item.badge === 'star' && (
                                        <div className="absolute -top-1 -right-1 text-red-600">
                                            <Icon
                                                icon="zi-star-solid"
                                                size={16}
                                            />
                                        </div>
                                    )}
                                    {/* Hiệu ứng số đếm màu đỏ góc trên */}
                                    {item.badge === 'number' && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-[#a3171c] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                            1
                                        </div>
                                    )}
                                </div>
                                <Text className="text-[12px] text-gray-800 font-medium leading-tight px-1 max-w-[90px]">
                                    {item.title}
                                </Text>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ==========================================
                FOOTER TRANG TRỌNG
            ========================================== */}
            <div className="mt-auto bg-[#8b1418] w-full rounded-t-2xl py-5 px-4 text-center shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
                <Text
                    bold
                    className="text-white text-[13px] uppercase tracking-wide mb-1.5 drop-shadow-md"
                >
                    Ủy Ban Mặt Trận Tổ Quốc Việt Nam Tỉnh Lạng Sơn
                </Text>
                <Text className="text-white/80 text-[11px] leading-relaxed">
                    Địa chỉ: Đ.Hoàng Văn Thụ, phường Lương Văn Tri, tỉnh Lạng
                    Sơn
                    <br />
                    Điện thoại: (0205) 3812.209 - Email: bbtmttq@langson.gov.vn
                </Text>
            </div>

            {/* ==========================================
                MODAL CẢNH BÁO BẢN ĐỒ
            ========================================== */}
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
