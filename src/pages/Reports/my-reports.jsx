// src/pages/my-reports.jsx
import { useEffect, useState } from 'react'
import { Box, Header, Icon, Page, Spinner, Text, useNavigate } from 'zmp-ui'
import { apiFetch } from '../../services/api'

const MyReportsPage = () => {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Gọi API lấy danh sách ngay khi vào trang
    useEffect(() => {
        const fetchMyReports = async () => {
            try {
                // Sử dụng wrapper apiFetch đã có sẵn header định danh
                const data = await apiFetch('/reports/my-reports', {
                    method: 'GET',
                })
                setReports(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchMyReports()
    }, [])

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

    // Hàm tiện ích: Đổi màu theo trạng thái
    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
            case 'CHỜ XỬ LÝ':
                return {
                    color: 'text-orange-600',
                    bg: 'bg-orange-100',
                    label: 'Chờ xử lý',
                }
            case 'PROCESSING':
            case 'ĐANG XỬ LÝ':
                return {
                    color: 'text-blue-600',
                    bg: 'bg-blue-100',
                    label: 'Đang xử lý',
                }
            case 'RESOLVED':
            case 'ĐÃ XỬ LÝ':
                return {
                    color: 'text-green-600',
                    bg: 'bg-green-100',
                    label: 'Đã hoàn thành',
                }
            default:
                return {
                    color: 'text-gray-600',
                    bg: 'bg-gray-100',
                    label: status || 'Không rõ',
                }
        }
    }

    return (
        <Page className="page bg-gray-50">
            <Header title="Phản ánh của tôi" showBackIcon={true} />

            <Box className="pt-20" p={4}>
                {/* 1. TRẠNG THÁI LOADING */}
                {loading && (
                    <div className="flex flex-col items-center justify-center mt-10">
                        <Spinner visible />
                        <Text className="mt-2 text-gray-500">
                            Đang tải dữ liệu...
                        </Text>
                    </div>
                )}

                {/* 2. TRẠNG THÁI LỖI */}
                {!loading && error && (
                    <div className="bg-red-50 p-4 rounded-xl text-center text-red-600">
                        <Icon
                            icon="zi-warning"
                            className="mb-2 text-red-500"
                            size={32}
                        />
                        <Text>{error}</Text>
                    </div>
                )}

                {/* 3. TRẠNG THÁI TRỐNG (Chưa có dữ liệu) */}
                {!loading && !error && reports.length === 0 && (
                    <div className="text-center mt-20 opacity-50">
                        <Icon icon="zi-inbox" size={60} className="mb-2" />
                        <Text>Bạn chưa gửi phản ánh nào.</Text>
                    </div>
                )}

                {/* 4. HIỂN THỊ DANH SÁCH DỮ LIỆU THẬT */}
                {!loading && !error && reports.length > 0 && (
                    <div className="flex flex-col space-y-3">
                        <Text bold className="text-gray-600 mb-2">
                            Danh sách đã gửi ({reports.length})
                        </Text>

                        {reports.map((report) => {
                            const statusStyle = getStatusStyle(report.status)

                            return (
                                <div
                                    key={report.id}
                                    // Bấm vào Card sẽ chuyển sang trang Chi tiết (Bước 7)
                                    onClick={() =>
                                        navigate(`/report-details/${report.id}`)
                                    }
                                    className="bg-white p-4 rounded-xl shadow-sm active:bg-gray-100 transition-colors border border-gray-100"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Text
                                            bold
                                            className="text-base line-clamp-2 pr-2"
                                        >
                                            {report.title}
                                        </Text>
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${statusStyle.bg} ${statusStyle.color}`}
                                        >
                                            {statusStyle.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-gray-500 text-sm mt-3 border-t pt-2 border-gray-50">
                                        <Icon
                                            icon="zi-clock-1"
                                            size={16}
                                            className="mr-1"
                                        />
                                        <Text size="small">
                                            {formatDate(report.createdAt)}
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

export default MyReportsPage
