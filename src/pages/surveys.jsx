// src/pages/surveys.jsx
import { useEffect, useState } from 'react'
import { Box, Header, Icon, Page, Spinner, Text, useNavigate } from 'zmp-ui'
import { apiFetch } from '../services/api'

const SurveysPage = () => {
    const navigate = useNavigate()
    const [surveys, setSurveys] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const data = await apiFetch('/surveys/active', {
                    method: 'GET',
                })
                setSurveys(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchSurveys()
    }, [])

    return (
        <Page className="page bg-gray-50">
            <Header title="Khảo sát ý kiến" showBackIcon={true} />

            <Box p={4}>
                <Text className="text-gray-500 mb-4 text-sm">
                    Ý kiến đóng góp của bạn giúp chúng tôi cải thiện chất lượng
                    phục vụ tốt hơn.
                </Text>

                {loading ? (
                    <div className="flex justify-center mt-10">
                        <Spinner visible />
                    </div>
                ) : surveys.length === 0 ? (
                    <div className="text-center mt-20 opacity-50">
                        <Icon icon="zi-poll" size={60} className="mb-2" />
                        <Text>Hiện không có cuộc khảo sát nào.</Text>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-3">
                        {surveys.map((survey) => (
                            <div
                                key={survey.id}
                                onClick={() =>
                                    navigate(`/survey-detail/${survey.id}`)
                                }
                                className="bg-white p-4 rounded-xl shadow-sm active:bg-gray-100 transition-colors border border-purple-100"
                            >
                                <div className="flex items-start">
                                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                        <Icon
                                            icon="zi-chat-solid"
                                            className="text-purple-600"
                                        />
                                    </div>
                                    <div>
                                        <Text
                                            bold
                                            className="text-gray-800 mb-1"
                                        >
                                            {survey.title}
                                        </Text>
                                        <Text
                                            size="xSmall"
                                            className="text-gray-500 line-clamp-2"
                                        >
                                            {survey.description ||
                                                'Bấm vào để tham gia đánh giá'}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Box>
        </Page>
    )
}

export default SurveysPage
