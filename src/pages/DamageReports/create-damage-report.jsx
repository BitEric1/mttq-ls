import { useRef, useState } from 'react'
import { getLocation } from 'zmp-sdk/apis'
import {
    Box,
    Button,
    Header,
    Icon,
    Input,
    Page,
    Select,
    Spinner,
    Text,
    useNavigate,
    useSnackbar,
} from 'zmp-ui'
import { createDamageReport, uploadDamageImage } from '../../services/damageApi'

const { Option } = Select

const CreateDamageReport = () => {
    const snackbar = useSnackbar()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        damageType: 1,
        severity: 2,
        estimatedLoss: '',
        latitude: 0,
        longitude: 0,
        address: '',
        imageUrls: [],
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value })
    }

    const handleGetLocation = async () => {
        setIsLocating(true)
        try {
            const location = await getLocation({})
            if (location && location.latitude) {
                setFormData({
                    ...formData,
                    latitude: location.latitude,
                    longitude: location.longitude,
                })
                snackbar.openSnackbar({
                    type: 'success',
                    text: 'Đã cập nhật vị trí GPS!',
                })
            } else {
                throw new Error('Không có data')
            }
        } catch (error) {
            setFormData({ ...formData, latitude: 21.8485, longitude: 106.7578 })
            snackbar.openSnackbar({
                type: 'warning',
                text: 'Dùng tọa độ giả lập (Lạng Sơn) để test.',
            })
        } finally {
            setIsLocating(false)
        }
    }

    const handleFileChange = async (event) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        try {
            const newUrls = []
            for (let i = 0; i < files.length; i++) {
                const response = await uploadDamageImage(files[i])
                if (response.success) newUrls.push(response.url)
            }
            setFormData((prev) => ({
                ...prev,
                imageUrls: [...prev.imageUrls, ...newUrls],
            }))
            snackbar.openSnackbar({
                type: 'success',
                text: `Đã tải lên ${newUrls.length} ảnh.`,
            })
        } catch (error) {
            snackbar.openSnackbar({
                type: 'error',
                text: 'Lỗi upload ảnh: ' + error.message,
            })
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeImage = (index) => {
        const newUrls = [...formData.imageUrls]
        newUrls.splice(index, 1)
        setFormData({ ...formData, imageUrls: newUrls })
    }

    const handleSubmit = async () => {
        if (!formData.title.trim())
            return snackbar.openSnackbar({
                type: 'warning',
                text: 'Vui lòng nhập tiêu đề.',
            })
        if (!formData.description.trim())
            return snackbar.openSnackbar({
                type: 'warning',
                text: 'Vui lòng nhập mô tả chi tiết.',
            })
        if (!formData.address.trim() && formData.latitude === 0)
            return snackbar.openSnackbar({
                type: 'warning',
                text: 'Vui lòng cung cấp vị trí hoặc địa chỉ.',
            })
        if (formData.estimatedLoss < 0)
            return snackbar.openSnackbar({
                type: 'warning',
                text: 'Thiệt hại ước tính không hợp lệ.',
            })

        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                estimatedLoss: formData.estimatedLoss
                    ? parseFloat(formData.estimatedLoss)
                    : 0,
            }
            await createDamageReport(payload)
            snackbar.openSnackbar({
                type: 'success',
                text: 'Gửi khai báo thành công!',
            })
            navigate('/', { replace: true })
        } catch (error) {
            snackbar.openSnackbar({
                type: 'error',
                text: 'Gửi thất bại: ' + error.message,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Page className="bg-gray-50 pb-28">
            <Header title="Khai báo thiệt hại" showBackIcon={true} />

            <Box p={4} className="space-y-4 pt-20">
                {' '}
                {/* Thêm pt-20 để tránh Header đè */}
                {/* 1. Sửa lỗi giao diện khối cảnh báo đỏ */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start shadow-sm">
                    <Icon
                        icon="zi-info-circle-solid"
                        className="text-red-600 mt-0.5 mr-2"
                        size={20}
                    />
                    <Text
                        size="xSmall"
                        className="text-red-800 font-medium leading-relaxed"
                    >
                        Công dân vui lòng khai báo trung thực, đính kèm hình ảnh
                        và tọa độ chính xác để cơ quan chức năng hỗ trợ kịp
                        thời.
                    </Text>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4">
                    {/* Header Mục 1 */}
                    <div className="flex items-center pb-2 border-b border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs mr-2">
                            1
                        </div>
                        <Text
                            bold
                            className="text-gray-800 text-sm tracking-wide"
                        >
                            THÔNG TIN CHUNG
                        </Text>
                    </div>

                    <Input
                        label="Tiêu đề khai báo (*)"
                        placeholder="VD: Bão tốc mái tôn, cây đổ..."
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Select
                            label="Loại thiệt hại"
                            value={formData.damageType}
                            onChange={(val) =>
                                handleChange('damageType', Number(val))
                            }
                        >
                            <Option value={1} title="Nhà cửa" />
                            <Option value={2} title="Nông nghiệp" />
                            <Option value={3} title="Gia súc/cầm" />
                            <Option value={4} title="Tài sản khác" />
                            <Option value={5} title="Công cộng" />
                        </Select>
                        <Select
                            label="Mức độ"
                            value={formData.severity}
                            onChange={(val) =>
                                handleChange('severity', Number(val))
                            }
                        >
                            <Option value={1} title="Nhẹ 🟢" />
                            <Option value={2} title="Trung bình 🟠" />
                            <Option value={3} title="Nặng 🔴" />
                        </Select>
                    </div>

                    <Input
                        label="Ước tính thiệt hại (VNĐ)"
                        type="number"
                        placeholder="VD: 15000000"
                        value={formData.estimatedLoss}
                        onChange={(e) =>
                            handleChange('estimatedLoss', e.target.value)
                        }
                    />
                    <Input.TextArea
                        label="Mô tả sự việc (*)"
                        placeholder="Tình trạng chi tiết..."
                        showCount
                        maxLength={1000}
                        value={formData.description}
                        onChange={(e) =>
                            handleChange('description', e.target.value)
                        }
                    />
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4">
                    {/* Header Mục 2 */}
                    <div className="flex items-center pb-2 border-b border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs mr-2">
                            2
                        </div>
                        <Text
                            bold
                            className="text-gray-800 text-sm tracking-wide"
                        >
                            VỊ TRÍ & HÌNH ẢNH
                        </Text>
                    </div>

                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={handleGetLocation}
                        loading={isLocating}
                        icon={<Icon icon="zi-location" />}
                        className="bg-blue-50 text-blue-700 border border-blue-200"
                    >
                        {formData.latitude
                            ? 'Cập nhật lại GPS'
                            : 'Lấy tọa độ GPS tự động'}
                    </Button>

                    {typeof formData.latitude === 'number' &&
                        typeof formData.longitude === 'number' &&
                        formData.latitude !== 0 && (
                            <div className="bg-gray-50 p-2 rounded text-center">
                                <Text
                                    size="xSmall"
                                    className="text-gray-600 italic"
                                >
                                    Tọa độ: {formData.latitude.toFixed(5)},{' '}
                                    {formData.longitude.toFixed(5)}
                                </Text>
                            </div>
                        )}

                    <Input
                        label="Địa chỉ cụ thể"
                        placeholder="Số nhà, đường, xóm..."
                        value={formData.address}
                        onChange={(e) =>
                            handleChange('address', e.target.value)
                        }
                    />

                    <Text size="small" bold className="text-gray-700 mt-2">
                        Đính kèm ảnh hiện trường
                    </Text>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    <div className="flex flex-wrap gap-3">
                        {formData.imageUrls.map((url, index) => (
                            <div
                                key={index}
                                className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-200"
                            >
                                <img
                                    src={`http://localhost:5266${url}`}
                                    alt="hiện trường"
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer shadow"
                                >
                                    <Icon
                                        icon="zi-close"
                                        size={14}
                                        className="text-red-600"
                                    />
                                </div>
                            </div>
                        ))}
                        <div
                            onClick={() =>
                                !isUploading && fileInputRef.current.click()
                            }
                            className={`w-20 h-20 border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl flex flex-col items-center justify-center text-blue-500 active:bg-blue-100 transition ${isUploading ? 'opacity-50' : ''}`}
                        >
                            {isUploading ? (
                                <Spinner visible />
                            ) : (
                                <>
                                    <Icon icon="zi-camera" size={24} />
                                    <Text
                                        size="xxxxSmall"
                                        className="mt-1 font-medium"
                                    >
                                        Thêm ảnh
                                    </Text>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <Box className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
                    <Button
                        fullWidth
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        className="bg-red-700 active:bg-red-800 text-white shadow-lg font-bold text-base h-12 rounded-xl"
                    >
                        GỬI KHAI BÁO
                    </Button>
                </Box>
            </Box>
        </Page>
    )
}

export default CreateDamageReport
