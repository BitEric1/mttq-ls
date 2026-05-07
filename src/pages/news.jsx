// src/pages/news.jsx
import { Box, Header, Icon, Page, Text } from 'zmp-ui'

const NewsPage = () => {
    // Dữ liệu mẫu (Mock data) cho tin tức
    const newsList = [
        {
            id: 1,
            title: 'Hội nghị biểu dương các điển hình tiên tiến',
            date: '05/05/2026',
            description:
                'Sáng nay, Ủy ban MTTQ Việt Nam tỉnh đã tổ chức hội nghị biểu dương các tập thể, cá nhân có thành tích xuất sắc.',
            isNew: true,
        },
        {
            id: 2,
            title: 'Thông báo lịch tiếp công dân tháng 5/2026',
            date: '02/05/2026',
            description:
                'Lịch tiếp công dân định kỳ của lãnh đạo các cấp được niêm yết công khai tại trụ sở và trên ứng dụng.',
            isNew: false,
        },
        {
            id: 3,
            title: 'Phát động phong trào toàn dân bảo vệ an ninh Tổ quốc',
            date: '28/04/2026',
            description:
                'Kêu gọi toàn thể nhân dân nâng cao tinh thần cảnh giác, tích cực tham gia giữ gìn an ninh trật tự tại địa phương.',
            isNew: false,
        },
    ]

    return (
        <Page className="page bg-gray-50">
            <Header title="Tin tức & Thông báo" showBackIcon={true} />

            <Box className='pt-20' p={4}>
                <Text className="text-gray-500 mb-4 text-sm">
                    Cập nhật các thông tin, chủ trương và chính sách mới nhất từ
                    cơ quan Đảng và Nhà nước.
                </Text>

                <div className="flex flex-col space-y-4">
                    {newsList.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden"
                        >
                            {/* Viền đỏ mỏng ở cạnh trái để tạo điểm nhấn */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>

                            <div className="flex justify-between items-start mb-2 pl-2">
                                <div className="flex items-center space-x-2">
                                    <Icon
                                        icon="zi-notified"
                                        className="text-red-500"
                                        size={18}
                                    />
                                    <Text
                                        size="xSmall"
                                        className="text-gray-400"
                                    >
                                        {item.date}
                                    </Text>
                                </div>
                                {item.isNew && (
                                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        MỚI
                                    </span>
                                )}
                            </div>

                            <Text bold className="text-gray-800 mb-2 pl-2">
                                {item.title}
                            </Text>
                            <Text
                                size="small"
                                className="text-gray-600 line-clamp-2 pl-2"
                            >
                                {item.description}
                            </Text>
                        </div>
                    ))}
                </div>
            </Box>
        </Page>
    )
}

export default NewsPage
