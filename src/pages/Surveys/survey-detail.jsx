// src/pages/survey-detail.jsx
import { useState } from 'react'
import { useParams } from 'react-router'
import {
    Box,
    Button,
    Header,
    Icon,
    Input,
    Page,
    Text,
    useNavigate,
    useSnackbar,
} from 'zmp-ui'
import { apiFetch } from '../../services/api'

const SurveyDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const snackbar = useSnackbar()

    const [rating, setRating] = useState(0) // Mặc định 0 sao
    const [feedback, setFeedback] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            snackbar.openSnackbar({
                type: 'warning',
                text: 'Vui lòng chọn số sao đánh giá!',
            })
            return
        }

        setLoading(true)
        try {
            await apiFetch(`/surveys/${id}/submit`, {
                method: 'POST',
                body: { rating, feedback },
            })

            snackbar.openSnackbar({
                type: 'success',
                text: 'Cảm ơn bạn đã đánh giá!',
            })
            navigate('/surveys', { replace: true }) // Quay lại trang danh sách
        } catch (error) {
            snackbar.openSnackbar({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Page className="page bg-white">
            <Header title="Tham gia khảo sát" showBackIcon={true} />

            <Box p={4} className="flex flex-col items-center mt-4 pt-20">
                <Text
                    bold
                    size="large"
                    className="text-center mb-6 text-gray-800"
                >
                    Mức độ hài lòng của bạn?
                </Text>

                {/* Khu vực chọn Sao */}
                <div className="flex space-x-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <div
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1"
                        >
                            <Icon
                                icon="zi-star-solid"
                                size={40}
                                className={
                                    star <= rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-200'
                                }
                                style={{ transition: 'color 0.2s' }}
                            />
                        </div>
                    ))}
                </div>

                <Text size="small" className="text-gray-500 mb-6 italic">
                    {rating === 0 && 'Chạm vào sao để đánh giá'}
                    {rating === 1 && 'Rất không hài lòng 😞'}
                    {rating === 2 && 'Không hài lòng 😐'}
                    {rating === 3 && 'Bình thường 🙂'}
                    {rating === 4 && 'Hài lòng 😊'}
                    {rating === 5 && 'Tuyệt vời! 😍'}
                </Text>

                <div className="w-full mb-6">
                    <Input.TextArea
                        label="Ý kiến đóng góp (Không bắt buộc)"
                        placeholder="Bạn có gợi ý gì để chúng tôi làm tốt hơn không?"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        showCount
                        maxLength={500}
                    />
                </div>

                <Button
                    fullWidth
                    onClick={handleSubmit}
                    loading={loading}
                    className="bg-purple-600 active:bg-purple-700"
                >
                    Gửi đánh giá
                </Button>
            </Box>
        </Page>
    )
}

export default SurveyDetailPage
