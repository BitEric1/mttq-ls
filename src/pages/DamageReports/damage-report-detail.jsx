import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Header, Icon, Page, Spinner, Text, useNavigate } from 'zmp-ui'
import { getDamageReportDetail } from '../../services/damageApi'

const DamageReportDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await getDamageReportDetail(id)
                if (res.success) setReport(res.data)
            } catch (error) {
                console.error('Lỗi lấy chi tiết:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDetail()
    }, [id])

    const getStatusTheme = (status) => {
        switch (status) {
            case 'DRAFT':
                return {
                    text: 'Bản nháp',
                    bg: 'bg-gray-100',
                    textC: 'text-gray-700',
                    icon: 'zi-edit-text',
                }
            case 'SUBMITTED':
                return {
                    text: 'Đang chờ duyệt',
                    bg: 'bg-blue-100',
                    textC: 'text-blue-700',
                    icon: 'zi-clock-1',
                }
            case 'APPROVED':
                return {
                    text: 'Đã tiếp nhận',
                    bg: 'bg-green-100',
                    textC: 'text-green-700',
                    icon: 'zi-check-circle-solid',
                }
            case 'REJECTED':
                return {
                    text: 'Bị từ chối',
                    bg: 'bg-red-100',
                    textC: 'text-red-700',
                    icon: 'zi-close-circle-solid',
                }
            default:
                return {
                    text: 'Không rõ',
                    bg: 'bg-gray-100',
                    textC: 'text-gray-700',
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
        if (!dateString) return ''
        const d = new Date(dateString)
        return d.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const formatCurrency = (amount) => {
        if (!amount) return '0 VNĐ'
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)
    }

    if (loading) {
        return (
            <Page className="bg-gray-50">
                <Header title="Chi tiết hồ sơ" />
                <div className="flex justify-center py-20">
                    <Spinner visible />
                </div>
            </Page>
        )
    }

    if (!report) {
        return (
            <Page className="bg-gray-50">
                <Header title="Lỗi" />
                <Box p={4}>
                    <Text className="text-center text-red-500 pt-20">
                        Không tìm thấy hồ sơ.
                    </Text>
                </Box>
            </Page>
        )
    }

    const theme = getStatusTheme(report.status)

    return (
        <Page className="bg-gray-50 pb-10 relative">
            <Header title="Chi tiết khai báo" showBackIcon={true} />

            <Box p={4} className="pt-20 space-y-4">
                {/* Khối Trạng thái (Nổi bật nhất) */}
                <div
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm border border-white/50 ${theme.bg}`}
                >
                    <Icon
                        icon={theme.icon}
                        className={`${theme.textC} mb-2`}
                        size={48}
                    />
                    <Text
                        bold
                        className={`text-lg uppercase tracking-wide ${theme.textC}`}
                    >
                        {theme.text}
                    </Text>
                    <Text size="xSmall" className="text-gray-500 mt-1">
                        Cập nhật:{' '}
                        {formatDate(report.updatedAt || report.createdAt)}
                    </Text>
                </div>

                {/* Khối Thông tin chi tiết */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <Text
                        bold
                        size="large"
                        className="text-gray-800 mb-4 border-b pb-3"
                    >
                        {report.title}
                    </Text>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-dashed pb-2">
                            <span className="text-gray-500">Mã hồ sơ:</span>
                            <span className="font-mono text-gray-700">
                                {report.id.substring(0, 8).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-dashed pb-2">
                            <span className="text-gray-500">Mức độ:</span>
                            <span>{getSeverityLabel(report.severity)}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed pb-2">
                            <span className="text-gray-500">
                                Ước tính thiệt hại:
                            </span>
                            <span className="font-bold text-red-600">
                                {formatCurrency(report.estimatedLoss)}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-dashed pb-2">
                            <span className="text-gray-500">Ngày gửi:</span>
                            <span className="text-gray-800">
                                {formatDate(report.createdAt)}
                            </span>
                        </div>

                        <div className="pt-2">
                            <span className="text-gray-500 block mb-1">
                                Mô tả sự việc:
                            </span>
                            <div className="bg-gray-50 p-3 rounded-lg text-gray-700 leading-relaxed border border-gray-200">
                                {report.description}
                            </div>
                        </div>

                        {report.address && (
                            <div className="pt-2 flex items-start">
                                <Icon
                                    icon="zi-location-solid"
                                    className="text-blue-500 mr-2 mt-0.5"
                                    size={16}
                                />
                                <span className="text-gray-700">
                                    {report.address}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hình ảnh đính kèm */}
                {report.imageUrls && report.imageUrls.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <Text bold className="text-gray-800 text-sm mb-3">
                            Hình ảnh hiện trường ({report.imageUrls.length})
                        </Text>
                        <div className="grid grid-cols-3 gap-2">
                            {report.imageUrls.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                                >
                                    <img
                                        src={`http://localhost:5266${url}`}
                                        alt="hiện trường"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Box>
        </Page>
    )
}

export default DamageReportDetail
