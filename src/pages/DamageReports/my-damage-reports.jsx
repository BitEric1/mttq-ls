import { useEffect, useState } from 'react'
import { Box, Header, Icon, Page, Spinner, Text, useNavigate } from 'zmp-ui'
import { getMyDamageReports } from '../../services/damageApi'

const MyDamageReports = () => {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true)
                const response = await getMyDamageReports()
                if (response.success) setReports(response.data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    const getStatusLabel = (status) => {
        switch (status) {
            case 'DRAFT':
                return {
                    text: 'Bản nháp',
                    color: 'text-gray-500 bg-gray-100',
                    icon: 'zi-edit-text',
                }
            case 'SUBMITTED':
                return {
                    text: 'Chờ xử lý',
                    color: 'text-blue-700 bg-blue-100',
                    icon: 'zi-clock-1',
                }
            case 'APPROVED':
                return {
                    text: 'Đã tiếp nhận',
                    color: 'text-green-700 bg-green-100',
                    icon: 'zi-check-circle-solid',
                }
            case 'REJECTED':
                return {
                    text: 'Từ chối',
                    color: 'text-red-700 bg-red-100',
                    icon: 'zi-close-circle-solid',
                }
            default:
                return {
                    text: 'Không rõ',
                    color: 'text-gray-500 bg-gray-100',
                    icon: 'zi-help-circle',
                }
        }
    }

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case 'LOW':
            case 'Light':
                return <span className="text-green-600 font-bold">Nhẹ 🟢</span>
            case 'MEDIUM':
            case 'Medium':
                return (
                    <span className="text-orange-500 font-bold">
                        Trung bình 🟠
                    </span>
                )
            case 'HIGH':
            case 'Heavy':
                return <span className="text-red-600 font-bold">Nặng 🔴</span>
            default:
                return ''
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    return (
        <Page className="bg-gray-50 relative">
            <Header title="Lịch sử khai báo" showBackIcon={true} />

            {/* THÊM pt-20 ĐỂ ĐẨY NỘI DUNG XUỐNG DƯỚI HEADER */}
            <Box p={4} className="pt-20 pb-20">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Spinner visible />
                        <Text size="small" className="text-gray-500 mt-2">
                            Đang tải dữ liệu...
                        </Text>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                        <Icon
                            icon="zi-warning-solid"
                            className="text-red-500 mb-2"
                            size={32}
                        />
                        <Text className="text-red-700 text-sm">{error}</Text>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold active:bg-red-200"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {!loading && !error && reports.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-60">
                        <Icon
                            icon="zi-inbox"
                            size={64}
                            className="text-gray-400 mb-3"
                        />
                        <Text className="text-gray-500">
                            Bạn chưa có khai báo nào.
                        </Text>
                    </div>
                )}

                {!loading && !error && reports.length > 0 && (
                    <div className="flex flex-col space-y-4">
                        {reports.map((report) => {
                            const statusInfo = getStatusLabel(report.status)
                            return (
                                <div
                                    key={report.id}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden"
                                >
                                    {/* Line màu trang trí bên trái */}
                                    <div
                                        className={`absolute top-0 left-0 w-1 h-full ${statusInfo.color.split(' ')[1]}`}
                                    ></div>

                                    <div className="flex justify-between items-start mb-3 pl-2">
                                        <Text
                                            bold
                                            className="text-gray-800 text-[15px] flex-1 pr-3 line-clamp-2 leading-tight"
                                        >
                                            {report.title}
                                        </Text>
                                        <div
                                            className={`flex items-center px-2 py-1 rounded-md text-[11px] font-bold whitespace-nowrap ${statusInfo.color}`}
                                        >
                                            <Icon
                                                icon={statusInfo.icon}
                                                size={12}
                                                className="mr-1"
                                            />
                                            {statusInfo.text}
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl ml-2">
                                        <div className="flex items-center">
                                            <Icon
                                                icon="zi-calendar"
                                                size={14}
                                                className="mr-2 opacity-70"
                                            />
                                            <Text size="xSmall">
                                                {formatDate(report.createdAt)}
                                            </Text>
                                        </div>
                                        <div className="flex items-center">
                                            <Icon
                                                icon="zi-warning"
                                                size={14}
                                                className="mr-2 opacity-70"
                                            />
                                            <Text size="xSmall">
                                                Mức độ:{' '}
                                                {getSeverityLabel(
                                                    report.severity,
                                                )}
                                            </Text>
                                        </div>
                                    </div>

                                    {/* Nút Xem chi tiết (Chuẩn bị cho tương lai) */}
                                    <div
                                        key={report.id}
                                        onClick={() =>
                                            navigate(
                                                `/damage-reports/${report.id}`,
                                            )
                                        }
                                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                                    >
                                        <Text
                                            size="xSmall"
                                            className="text-blue-600 font-bold active:text-blue-800 flex items-center"
                                        >
                                            Xem chi tiết{' '}
                                            <Icon
                                                icon="zi-chevron-right"
                                                size={14}
                                            />
                                        </Text>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </Box>
        </Page>
    )
}
export default MyDamageReports
