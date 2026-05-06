// src/pages/create-report.jsx
import { useState } from 'react'
import {
    Box,
    Button,
    Header,
    Icon,
    Input,
    Page,
    Select,
    useNavigate,
    useSnackbar,
} from 'zmp-ui'
import { apiFetch } from '../services/api'

const { Option } = Select

const CreateReportPage = () => {
    const navigate = useNavigate()
    const snackbar = useSnackbar()

    // 1. Quản lý State của Form
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        content: '',
    })
    const [loading, setLoading] = useState(false)

    // 2. Hàm xử lý thay đổi input
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value })
    }

    // 3. Hàm Validate và Gửi API
    const handleSubmit = async () => {
        // Validate cơ bản không để trống
        if (
            !formData.title.trim() ||
            !formData.category ||
            !formData.content.trim()
        ) {
            snackbar.openSnackbar({
                type: 'warning',
                text: 'Vui lòng điền đầy đủ thông tin!',
            })
            return
        }

        setLoading(true)
        try {
            // Chuẩn bị payload khớp với Model Backend yêu cầu.
            // Tiêu đề có thể ghép thêm phân loại để dễ quản lý.
            // Trong ví dụ này, để test nhanh MVP, chúng ta sẽ tạm thời gửi tọa độ vĩ độ 21.8485, kinh độ 106.7578 (Khu vực Lạng Sơn) thay vì phải code hàm xin quyền GPS thực tế.
            const payload = {
                title: `[${formData.category}] ${formData.title}`,
                content: formData.content,
                mediaUrls: '', // MVP chưa làm tính năng upload ảnh
                latitude: 21.8485,
                longitude: 106.7578,
            }

            // Gọi API POST tạo phản ánh mới
            await apiFetch('/reports', {
                method: 'POST',
                body: payload,
            })

            // Báo thành công và quay về trang chủ
            snackbar.openSnackbar({
                type: 'success',
                text: 'Gửi phản ánh thành công!',
            })
            navigate('/') // Quay về Home
        } catch (error) {
            snackbar.openSnackbar({
                type: 'error',
                text: error.message || 'Có lỗi xảy ra khi gửi',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Page className="page bg-white">
            <Header title="Gửi phản ánh mới" showBackIcon={true} />

            <Box p={4} className="mt-2">
                <div className="text-gray-500 text-sm mb-4">
                    Vui lòng cung cấp thông tin trung thực và chi tiết để cơ
                    quan chức năng xử lý kịp thời.
                </div>

                {/* Cụm Form Nhập liệu */}
                <div className="flex flex-col space-y-4">
                    {/* 1. Input Tiêu đề */}
                    <Input
                        label="Tiêu đề phản ánh"
                        placeholder="Ví dụ: Rác thải tràn lan tại..."
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        clearable
                    />

                    {/* 2. Dropdown Loại phản ánh */}
                    <Select
                        label="Lĩnh vực"
                        placeholder="Chọn lĩnh vực phản ánh"
                        value={formData.category}
                        onChange={(val) => handleChange('category', val)}
                    >
                        <Option value="Môi trường" title="Vệ sinh Môi trường" />
                        <Option value="Giao thông" title="An toàn Giao thông" />
                        <Option value="An ninh" title="An ninh Trật tự" />
                        <Option value="Khác" title="Vấn đề khác" />
                    </Select>

                    {/* 3. Textarea Nội dung chi tiết */}
                    <Input.TextArea
                        label="Nội dung chi tiết"
                        placeholder="Mô tả cụ thể sự việc, thời gian, địa điểm..."
                        value={formData.content}
                        onChange={(e) =>
                            handleChange('content', e.target.value)
                        }
                        showCount
                        maxLength={1000}
                    />
                </div>

                {/* Nút Submit */}
                <Box mt={6}>
                    <Button
                        fullWidth
                        onClick={handleSubmit}
                        loading={loading}
                        icon={<Icon icon="zi-send-solid" />}
                    >
                        Gửi phản ánh ngay
                    </Button>
                </Box>
            </Box>
        </Page>
    )
}

export default CreateReportPage
