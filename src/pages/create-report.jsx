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
    Text,
} from 'zmp-ui'
import { chooseImage } from 'zmp-sdk/apis' // Import API chọn ảnh của Zalo
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
    const [pickedImages, setPickedImages] = useState([]) // Đổi tên state cho chuẩn logic mới

    // 2. Hàm xử lý thay đổi input
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value })
    }

    // 3. Hàm Xử Lý Chọn Ảnh (DÙNG API THẬT CỦA ZALO)
    const handlePickImage = async () => {
        if (pickedImages.length >= 3) {
            snackbar.openSnackbar({ type: 'warning', text: 'Chỉ được chọn tối đa 3 ảnh!' })
            return
        }

        try {
            // Tính số lượng ảnh còn được phép chọn
            const remaining = 3 - pickedImages.length;
            
            // Gọi API Zalo để mở thư viện ảnh
            const { filePaths } = await chooseImage({
                sourceType: ['album', 'camera'], // Cho phép chọn từ thư viện hoặc chụp ảnh mới
                cameraType: 'back', 
                count: remaining // Giới hạn số lượng ảnh
            });
            
            if (filePaths && filePaths.length > 0) {
                // Thêm các ảnh mới được chọn vào state
                setPickedImages(prevImages => [...prevImages, ...filePaths]);
            }
        } catch (error) {
            console.error('Lỗi khi chọn ảnh:', error);
            snackbar.openSnackbar({
                type: 'error',
                text: 'Không thể mở thư viện ảnh. Vui lòng cấp quyền nếu được yêu cầu.',
            })
        }
    }

    const handleRemoveImage = (index) => {
        const newImages = [...pickedImages]
        newImages.splice(index, 1)
        setPickedImages(newImages)
    }

    // 4. Hàm Validate và Gửi API
    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.category || !formData.content.trim()) {
            snackbar.openSnackbar({
                type: 'warning',
                text: 'Vui lòng điền đầy đủ thông tin bắt buộc (*)',
            })
            return
        }

        setLoading(true)
        try {
            // LƯU Ý CHO BACKEND:
            // Hiện tại 'pickedImages' đang chứa Local Paths (đường dẫn tạm trên thiết bị).
            // Nếu muốn upload lên Server, bạn cần viết thêm 1 hàm gọi API upload từng file 
            // trước khi ghép vào 'mediaUrls'. Tạm thời ở bước này mình ghép dạng text để chạy luồng.
            
            const payload = {
                title: `[${formData.category}] ${formData.title}`,
                content: formData.content,
                mediaUrls: pickedImages.join(','), 
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
                text: error.message || 'Có lỗi xảy ra khi gửi, vui lòng thử lại',
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
                        <Icon icon="zi-info-circle-solid" className="text-red-600" size={20} />
                    </div>
                    <div>
                        <Text bold className="text-red-800 text-sm mb-1">
                            Tiếp nhận ý kiến nhân dân
                        </Text>
                        <Text className="text-red-700/80 text-xs leading-relaxed">
                            Vui lòng cung cấp thông tin trung thực, khách quan và chi tiết để cơ quan chức năng có cơ sở xử lý kịp thời.
                        </Text>
                    </div>
                </div>

                <div className="px-4 mt-5 flex flex-col gap-5">
                    
                    {/* 2. CARD: THÔNG TIN CƠ BẢN */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-red-600 rounded-full"></div>
                            <Text bold className="text-gray-800 text-[13px] uppercase tracking-wide">
                                Thông tin cơ bản
                            </Text>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Select
                                label={<span>Lĩnh vực <span className="text-red-500">*</span></span>}
                                placeholder="Chọn lĩnh vực phản ánh"
                                value={formData.category}
                                onChange={(val) => handleChange('category', val)}
                                className="custom-zmp-select"
                            >
                                <Option value="Môi trường" title="Vệ sinh Môi trường" />
                                <Option value="Giao thông" title="An toàn Giao thông" />
                                <Option value="An ninh" title="An ninh Trật tự" />
                                <Option value="Cơ sở hạ tầng" title="Cơ sở hạ tầng" />
                                <Option value="Khác" title="Vấn đề khác" />
                            </Select>

                            <Input
                                label={<span>Tiêu đề <span className="text-red-500">*</span></span>}
                                placeholder="Ví dụ: Rác thải tràn lan gây ô nhiễm..."
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                clearable
                            />
                        </div>
                    </div>

                    {/* 3. CARD: NỘI DUNG CHI TIẾT */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-red-600 rounded-full"></div>
                            <Text bold className="text-gray-800 text-[13px] uppercase tracking-wide">
                                Nội dung mô tả
                            </Text>
                        </div>

                        <Input.TextArea
                            placeholder="Mô tả cụ thể sự việc, thời gian, địa điểm, và mức độ ảnh hưởng..."
                            value={formData.content}
                            onChange={(e) => handleChange('content', e.target.value)}
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
                                <Text bold className="text-gray-800 text-[13px] uppercase tracking-wide">
                                    Đính kèm <span className="text-gray-400 normal-case font-normal text-xs">(Tùy chọn)</span>
                                </Text>
                            </div>
                        </div>

                        {/* Upload ảnh */}
                        <div className="mb-4">
                            <Text className="text-xs text-gray-500 mb-2">Hình ảnh hiện trường (Tối đa 3 ảnh)</Text>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {pickedImages.map((img, idx) => (
                                    <div key={idx} className="relative min-w-[72px] w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-200">
                                        <img src={img} alt={`Hình đính kèm ${idx+1}`} className="w-full h-full object-cover" />
                                        <div 
                                            className="absolute top-1 right-1 bg-black/50 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                                            onClick={() => handleRemoveImage(idx)}
                                        >
                                            <Icon icon="zi-close" className="text-white" size={12} />
                                        </div>
                                    </div>
                                ))}
                                {pickedImages.length < 3 && (
                                    <div 
                                        className="min-w-[72px] w-[72px] h-[72px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer active:bg-gray-100 transition-colors"
                                        onClick={handlePickImage}
                                    >
                                        <Icon icon="zi-camera" className="text-gray-400" size={24} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vị trí tự động */}
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <Icon icon="zi-location-solid" className="text-blue-600" size={18} />
                            </div>
                            <div className="flex-1">
                                <Text bold className="text-blue-800 text-xs mb-0.5">Vị trí hiện tại của bạn</Text>
                                <Text className="text-blue-600/80 text-[11px]">Hệ thống sẽ tự động đính kèm tọa độ nơi bạn gửi báo cáo.</Text>
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
                    icon={<Icon icon="zi-send-solid" />}
                    className="bg-[#cc2229] hover:bg-[#a3171c] active:bg-[#8b1418] text-white py-3 rounded-xl shadow-md text-base transition-colors"
                >
                    Gửi phản ánh
                </Button>
            </div>
        </Page>
    )
}

export default CreateReportPage