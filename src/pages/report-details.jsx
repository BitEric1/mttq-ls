// src/pages/report-details.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router' // Dùng để lấy ID từ URL
import { Box, Header, Icon, Page, Spinner, Text } from 'zmp-ui'
import { apiFetch } from '../services/api'

const ReportDetailsPage = () => {
    const { id } = useParams() // Lấy tham số :id mà ta đã định nghĩa ở Route
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Gọi API lấy chi tiết phản ánh theo ID
                const data = await apiFetch(`/reports/${id}`, { method: 'GET' })
                setReport(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchDetail()
    }, [id])

    // Hàm tiện ích: Định dạng ngày tháng
    const formatDate = (isoString) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        return date.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    // Hàm tô màu trạng thái
    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'text-orange-600 bg-orange-100'
            case 'PROCESSING':
                return 'text-blue-600 bg-blue-100'
            case 'RESOLVED':
                return 'text-green-600 bg-green-100'
            case 'REJECTED':
                return 'text-red-600 bg-red-100'
            default:
                return 'text-gray-600 bg-gray-100'
        }
    }

    return (
        <Page className="page bg-gray-50">
            <Header title="Chi tiết phản ánh" showBackIcon={true} />

            <Box p={4}>
                {/* XỬ LÝ LOADING & ERROR */}
                {loading && (
                    <div className="flex flex-col items-center pt-20">
                        <Spinner visible />
                        <Text className="mt-2 text-gray-500">
                            Đang tải dữ liệu...
                        </Text>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-red-50 p-4 rounded-xl text-center text-red-600">
                        <Text>{error}</Text>
                    </div>
                )}

                {/* HIỂN THỊ DỮ LIỆU THẬT */}
                {!loading && report && (
                    <>
                        {/* KHỐI 1: THÔNG TIN CHUNG */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                            <div className="flex justify-between items-start mb-3">
                                <span
                                    className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(report.status)}`}
                                >
                                    {report.status}
                                </span>
                                <Text size="small" className="text-gray-400">
                                    Mã: {report.code || id.substring(0, 8)}
                                </Text>
                            </div>

                            <Text
                                bold
                                size="large"
                                className="mb-2 text-gray-800"
                            >
                                {report.title}
                            </Text>

                            <div className="flex items-center text-gray-500 text-sm mb-4">
                                <Icon
                                    icon="zi-clock-1"
                                    size={16}
                                    className="mr-1"
                                />
                                <Text size="small">
                                    {formatDate(report.createdAt)}
                                </Text>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <Text
                                    size="small"
                                    className="text-gray-700 whitespace-pre-wrap"
                                >
                                    {report.content}
                                </Text>
                            </div>
                        </div>

                        {/* KHỐI 2: LỊCH SỬ XỬ LÝ (TIMELINE) */}
                        <Text bold className="text-gray-600 mb-3 ml-1 mt-6">
                            Tiến trình xử lý
                        </Text>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            {/* Kiểm tra nếu Backend có trả về mảng lịch sử (statusLogs / history) */}
                            {report.statusLogs &&
                            report.statusLogs.length > 0 ? (
                                <div className="relative border-l-2 border-gray-200 ml-2 space-y-6">
                                    {report.statusLogs.map((log, index) => (
                                        <div
                                            key={index}
                                            className="pl-5 relative"
                                        >
                                            {/* Dấu chấm tròn Timeline */}
                                            <div
                                                className={`absolute w-3.5 h-3.5 rounded-full -left-[9px] top-1 border-2 border-white 
                        ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            ></div>

                                            <Text
                                                bold
                                                size="small"
                                                className={
                                                    index === 0
                                                        ? 'text-gray-800'
                                                        : 'text-gray-500'
                                                }
                                            >
                                                {log.newStatus}
                                            </Text>
                                            <Text
                                                size="xSmall"
                                                className="text-gray-400 mb-1"
                                            >
                                                {formatDate(log.createdAt)} -
                                                Cập nhật bởi:{' '}
                                                {log.updatedBy || 'Hệ thống'}
                                            </Text>
                                            {log.note && (
                                                <Text
                                                    size="small"
                                                    className="text-gray-600 bg-gray-50 p-2 rounded-md mt-1"
                                                >
                                                    {log.note}
                                                </Text>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Fallback nếu Backend chưa có bảng Lịch sử -> Chỉ hiển thị trạng thái lúc gửi */
                                <div className="relative border-l-2 border-gray-200 ml-2">
                                    <div className="pl-5 relative">
                                        <div className="absolute w-3.5 h-3.5 bg-blue-500 rounded-full -left-[9px] top-1 border-2 border-white"></div>
                                        <Text bold size="small">
                                            Hệ thống đã tiếp nhận
                                        </Text>
                                        <Text
                                            size="xSmall"
                                            className="text-gray-400"
                                        >
                                            {formatDate(report.createdAt)}
                                        </Text>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Box>
        </Page>
    )
}

export default ReportDetailsPage
