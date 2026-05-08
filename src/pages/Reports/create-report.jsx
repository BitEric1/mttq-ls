import { useRef, useState } from 'react' // Thêm useRef
// Xóa import chooseImage vì sẽ dùng thẻ input file HTML chuẩn
import {
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
import { apiFetch } from '../../services/api'
import { uploadDamageImage } from '../../services/damageApi' // Tái sử dụng hàm upload của hệ thống

const { Option } = Select

const CreateReportPage = () => {
    const navigate = useNavigate()
    const snackbar = useSnackbar()
    const fileInputRef = useRef(null) // Khai báo ref để gọi thẻ input ẩn

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        content: '',
    })
    const [loading, setLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    // Đổi tên state và chứa URL THẬT thay vì path ảo của Zalo
    const [uploadedImages, setUploadedImages] = useState([])

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value })
    }

    // [CẬP NHẬT CHUẨN PRODUCTION]: Dùng Input File ẩn + Check 5MB + Promise.all
    const handleFileChange = async (event) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        if (uploadedImages.length + files.length > 3) {
            snackbar.openSnackbar({
                type: 'warning',
                text: 'Chỉ được đính kèm tối đa 3 ảnh!',
            })
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        setIsUploading(true)
        const validFiles = []

        // Kiểm tra dung lượng 5MB
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.size > 5 * 1024 * 1024) {
                snackbar.openSnackbar({
                    type: 'warning',
                    text: `Ảnh "${file.name}" vượt quá 5MB nên bị loại bỏ.`,
                })
                continue
            }
            validFiles.push(file)
        }

        if (validFiles.length > 0) {
            try {
                // Upload song song các file hợp lệ
                const uploadPromises = validFiles.map((file) =>
                    uploadDamageImage(file),
                )
                const results = await Promise.all(uploadPromises)

                const newUrls = results
                    .filter((res) => res.success)
                    .map((res) => res.url)

                setUploadedImages((prev) => [...prev, ...newUrls])

                if (newUrls.length > 0) {
                    snackbar.openSnackbar({
                        type: 'success',
                        text: `Đã tải lên thành công ${newUrls.length} ảnh.`,
                    })
                }
            } catch (error) {
                snackbar.openSnackbar({
                    type: 'error',
                    text: 'Lỗi tải ảnh lên máy chủ. Vui lòng thử lại.',
                })
                console.error(error)
            }
        }

        setIsUploading(false)
        // Reset thẻ input để có thể chọn lại cùng 1 ảnh nếu cần
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleRemoveImage = (index) => {
        const newImages = [...uploadedImages]
        newImages.splice(index, 1)
        setUploadedImages(newImages)
    }

    const handleSubmit = async () => {
        if (
            !formData.title.trim() ||
            !formData.category ||
            !formData.content.trim()
        ) {
            return snackbar.openSnackbar({
                type: 'warning',
                text: 'Vui lòng điền đầy đủ thông tin bắt buộc (*)',
            })
        }

        setLoading(true)
        try {
            const payload = {
                title: `[${formData.category}] ${formData.title}`,
                content: formData.content,
                mediaUrls: uploadedImages.join(','), // Gửi chuỗi URL THẬT (VD: /uploads/img1.jpg,/uploads/img2.jpg)
                latitude: 21.8485,
                longitude: 106.7578,
            }

            await apiFetch('/reports', {
                method: 'POST',
                body: payload,
            })

            snackbar.openSnackbar({
                type: 'success',
                text: 'Gửi phản ánh thành công! Xin cảm ơn.',
            })
            navigate('/')
        } catch (error) {
            snackbar.openSnackbar({
                type: 'error',
                text:
                    error.message || 'Có lỗi xảy ra khi gửi, vui lòng thử lại',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Page className="bg-gray-50 flex flex-col min-h-screen font-sans">
            <Header title="Gửi Phản Ánh" showBackIcon={true} />

            <div className="flex-1 overflow-y-auto pt-20 pb-24">
                {/* 1. BANNER HƯỚNG DẪN */}
                <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full mt-0.5">
                        <Icon
                            icon="zi-info-circle-solid"
                            className="text-red-600"
                            size={20}
                        />
                    </div>
                    <div>
                        <Text bold className="text-red-800 text-sm mb-1">
                            Tiếp nhận ý kiến nhân dân
                        </Text>
                        <Text className="text-red-700/80 text-xs leading-relaxed">
                            Vui lòng cung cấp thông tin trung thực, khách quan
                            và chi tiết để cơ quan chức năng có cơ sở xử lý kịp
                            thời.
                        </Text>
                    </div>
                </div>

                <div className="px-4 mt-5 flex flex-col gap-5">
                    {/* 2. CARD: THÔNG TIN CƠ BẢN */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-red-600 rounded-full"></div>
                            <Text
                                bold
                                className="text-gray-800 text-[13px] uppercase tracking-wide"
                            >
                                Thông tin cơ bản
                            </Text>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Select
                                label={
                                    <span>
                                        Lĩnh vực{' '}
                                        <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="Chọn lĩnh vực phản ánh"
                                value={formData.category}
                                onChange={(val) =>
                                    handleChange('category', val)
                                }
                                className="custom-zmp-select"
                            >
                                <Option
                                    value="Môi trường"
                                    title="Vệ sinh Môi trường"
                                />
                                <Option
                                    value="Giao thông"
                                    title="An toàn Giao thông"
                                />
                                <Option
                                    value="An ninh"
                                    title="An ninh Trật tự"
                                />
                                <Option
                                    value="Cơ sở hạ tầng"
                                    title="Cơ sở hạ tầng"
                                />
                                <Option value="Khác" title="Vấn đề khác" />
                            </Select>

                            <Input
                                label={
                                    <span>
                                        Tiêu đề{' '}
                                        <span className="text-red-500">*</span>
                                    </span>
                                }
                                placeholder="Ví dụ: Rác thải tràn lan gây ô nhiễm..."
                                value={formData.title}
                                onChange={(e) =>
                                    handleChange('title', e.target.value)
                                }
                                clearable
                            />
                        </div>
                    </div>

                    {/* 3. CARD: NỘI DUNG CHI TIẾT */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-red-600 rounded-full"></div>
                            <Text
                                bold
                                className="text-gray-800 text-[13px] uppercase tracking-wide"
                            >
                                Nội dung mô tả
                            </Text>
                        </div>

                        <Input.TextArea
                            placeholder="Mô tả cụ thể sự việc, thời gian, địa điểm, và mức độ ảnh hưởng..."
                            value={formData.content}
                            onChange={(e) =>
                                handleChange('content', e.target.value)
                            }
                            showCount
                            maxLength={1000}
                            className="bg-gray-50 border-none rounded-xl"
                        />
                    </div>

                    {/* 4. CARD: ĐÍNH KÈM (ẢNH & VỊ TRÍ) */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-red-600 rounded-full"></div>
                                <Text
                                    bold
                                    className="text-gray-800 text-[13px] uppercase tracking-wide"
                                >
                                    Đính kèm{' '}
                                    <span className="text-gray-400 normal-case font-normal text-xs">
                                        (Tùy chọn)
                                    </span>
                                </Text>
                            </div>
                        </div>

                        {/* Upload ảnh */}
                        <div className="mb-4">
                            <Text className="text-xs text-gray-500 mb-2">
                                Hình ảnh hiện trường (Tối đa 3 ảnh)
                            </Text>

                            {/* [THÊM] Thẻ Input File ẩn - Trái tim của sự ổn định */}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {uploadedImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="relative min-w-[72px] w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-200"
                                    >
                                        <img
                                            src={`http://localhost:5266${img}`}
                                            alt={`Hình đính kèm ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div
                                            className="absolute top-1 right-1 bg-black/50 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                                            onClick={() =>
                                                handleRemoveImage(idx)
                                            }
                                        >
                                            <Icon
                                                icon="zi-close"
                                                className="text-white"
                                                size={12}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {uploadedImages.length < 3 && (
                                    <div
                                        className="min-w-[72px] w-[72px] h-[72px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer active:bg-gray-100 transition-colors"
                                        onClick={() =>
                                            !isUploading &&
                                            fileInputRef.current.click()
                                        }
                                    >
                                        {isUploading ? (
                                            <Spinner visible />
                                        ) : (
                                            <>
                                                <Icon
                                                    icon="zi-camera"
                                                    className="text-gray-400"
                                                    size={24}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vị trí tự động */}
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <Icon
                                    icon="zi-location-solid"
                                    className="text-blue-600"
                                    size={18}
                                />
                            </div>
                            <div className="flex-1">
                                <Text
                                    bold
                                    className="text-blue-800 text-xs mb-0.5"
                                >
                                    Vị trí hiện tại của bạn
                                </Text>
                                <Text className="text-blue-600/80 text-[11px]">
                                    Hệ thống sẽ tự động đính kèm tọa độ nơi bạn
                                    gửi báo cáo.
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. VÙNG NÚT BẤM (CỐ ĐỊNH Ở ĐÁY) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-50">
                <Button
                    fullWidth
                    onClick={handleSubmit}
                    loading={loading}
                    className="bg-[#cc2229] hover:bg-[#a3171c] active:bg-[#8b1418] text-white py-3 rounded-xl shadow-md text-base transition-colors w-full"
                >
                    Gửi phản ánh
                </Button>
            </div>
        </Page>
    )
}

export default CreateReportPage
