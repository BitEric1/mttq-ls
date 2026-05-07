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

    return (
        // Thêm flex flex-col min-h-screen để push footer xuống đáy
        <Page className="page bg-gray-50 flex flex-col min-h-screen relative">
            <div className="flex-1">
                {/* 1. KHU VỰC BANNER: Tăng pb-16 thành pb-28 để làm nền cao hơn */}
                <div className="bg-red-700 pt-12 pb-28 px-4 rounded-b-[40px] shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl"></div>
                        <div className="absolute top-20 -left-10 w-32 h-32 bg-yellow-400 rounded-full blur-2xl"></div>
                    </div>

                    <div className="flex items-center relative z-10">
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

                {/* 2. HỆ THỐNG QUẢN LÝ THIỆT HẠI: Kéo lên với -mt-14 */}
                <Box px={4} className="-mt-14 relative z-20">
                    <Text
                        bold
                        className="mb-3 text-white text-[15px] text-center uppercase tracking-wider drop-shadow-md"
                    >
                        Hệ Thống Quản Lý Thiệt Hại
                    </Text>

                    <div className="grid grid-cols-2 gap-3">
                        <div
                            onClick={() => navigate('/create-damage-report')}
                            className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(220,38,38,0.1)] active:bg-red-50 transition-all border border-red-100"
                        >
                            <div className="bg-red-600 p-3 rounded-full mb-2 shadow-md border-2 border-red-200">
                                <Icon
                                    icon="zi-warning-solid"
                                    className="text-white"
                                    size={28}
                                />
                            </div>
                            <Text
                                bold
                                className="text-center text-[13px] text-gray-800"
                            >
                                Khai báo thiệt hại
                            </Text>
                        </div>
                        <div
                            onClick={() => navigate('/my-damage-reports')}
                            className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)] active:bg-blue-50 transition-all border border-gray-100"
                        >
                            <div className="bg-blue-50 p-3 rounded-full mb-2 shadow-inner">
                                <Icon
                                    icon="zi-list-1"
                                    className="text-blue-600"
                                    size={28}
                                />
                            </div>
                            <Text
                                bold
                                className="text-center text-[13px] text-gray-800"
                            >
                                Tra cứu hồ sơ
                            </Text>
                        </div>
                        <div
                            onClick={() => navigate('/damage-map')}
                            className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)] active:bg-orange-50 transition-all border border-gray-100"
                        >
                            <div className="bg-orange-50 p-3 rounded-full mb-2 shadow-inner">
                                <Icon
                                    icon="zi-location-solid"
                                    className="text-orange-500"
                                    size={28}
                                />
                            </div>
                            <Text
                                bold
                                className="text-center text-[13px] text-gray-800"
                            >
                                Bản đồ Cảnh báo
                            </Text>
                        </div>
                        <div
                            onClick={() => navigate('/guidelines')}
                            className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.05)] active:bg-teal-50 transition-all border border-gray-100"
                        >
                            <div className="bg-teal-50 p-3 rounded-full mb-2 shadow-inner">
                                <Icon
                                    icon="zi-info-circle-solid"
                                    className="text-teal-600"
                                    size={28}
                                />
                            </div>
                            <Text
                                bold
                                className="text-center text-[13px] text-gray-800"
                            >
                                Hướng dẫn ứng phó
                            </Text>
                        </div>
                    </div>
                </Box>

                {/* 3. CỔNG THÔNG TIN - DỊCH VỤ */}
                <Box px={4} className="mt-8 relative z-20">
                    <Text
                        bold
                        className="mb-3 text-red-800 text-[15px] text-center uppercase tracking-wider drop-shadow-sm"
                    >
                        Cổng Thông Tin - Dịch Vụ
                    </Text>

                    <div className="grid grid-cols-2 gap-3">
                        <div
                            onClick={() => navigate('/create-report')}
                            className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm active:bg-red-50 transition-all border border-gray-100"
                        >
                            <div className="bg-red-50 p-3 rounded-full mb-2 shadow-inner">
                                <Icon
                                    icon="zi-edit-text"
                                    className="text-red-700"
                                    size={28}
                                />
                            </div>
                            <Text
                                bold
                                className="text-center text-[13px] text-gray-800"
                            >
                                Gửi phản ánh
                            </Text>
                        </div>
                        <div
                            onClick={() => navigate('/my-reports')}
                            className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm active:bg-red-50 transition-all border border-gray-100"
                        >
                            <div className="bg-red-50 p-3 rounded-full mb-2 shadow-inner">
                                <Icon
                                    icon="zi-list-1"
                                    className="text-red-700"
                                    size={28}
                                />
                            </div>
                            <Text
                                bold
                                className="text-center text-[13px] text-gray-800"
                            >
                                Phản ánh của tôi
                            </Text>
                        </div>
                        <div
                            onClick={() => navigate('/surveys')}
                            className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm active:bg-red-50 transition-all border border-gray-100"
                        >
                            <div className="bg-red-50 p-3 rounded-full mb-2 shadow-inner">
                                <Icon
                                    icon="zi-poll"
                                    className="text-red-700"
                                    size={28}
                                />
                            </div>
                            <Text
                                bold
                                className="text-center text-[13px] text-gray-800"
                            >
                                Khảo sát ý kiến
                            </Text>
                        </div>
                        <div
                            onClick={() => navigate('/news')}
                            className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm active:bg-red-50 transition-all border border-gray-100"
                        >
                            <div className="bg-red-50 p-3 rounded-full mb-2 shadow-inner">
                                <Icon
                                    icon="zi-notified"
                                    className="text-red-700"
                                    size={28}
                                />
                            </div>
                            <Text
                                bold
                                className="text-center text-[13px] text-gray-800"
                            >
                                Tin tức & Thông báo
                            </Text>
                        </div>
                    </div>
                </Box>
            </div>

            {/* 4. FOOTER: Dùng mt-auto để đẩy sát xuống đáy */}
            <Box
                p={4}
                className="mt-auto text-center flex flex-col items-center opacity-80 pb-6"
            >
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
                <Text size="xxxSmall" className="text-gray-500 uppercase">
                    Hệ thống tiếp nhận phản ánh & Thiệt hại
                </Text>
                <Text size="xxxSmall" className="text-gray-400 mt-1">
                    Phiên bản 1.0.0
                </Text>
            </Box>

            {/* Modal Cảnh báo (Giữ nguyên) */}
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
                        Vui lòng chú ý an toàn!
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
                        className="bg-red-600 text-white border border-red-700 active:bg-red-800 shadow-md"
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
