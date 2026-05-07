import { useEffect, useState } from 'react'
import { Box, Button, Header, Icon, Modal, Page, Spinner, Text } from 'zmp-ui'
import { getGuidelineDetail, getGuidelines } from '../../services/damageApi'

const Guidelines = () => {
    const [guidelines, setGuidelines] = useState([])
    const [loading, setLoading] = useState(true)

    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [activeGuideline, setActiveGuideline] = useState(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await getGuidelines()
                if (res.success) setGuidelines(res.data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchList()
    }, [])

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'STORM':
                return {
                    icon: 'zi-partly-cloudy',
                    color: 'text-gray-600',
                    bg: 'bg-gray-100',
                }
            case 'FLOOD':
                return {
                    icon: 'zi-water',
                    color: 'text-blue-600',
                    bg: 'bg-blue-100',
                }
            case 'LANDSLIDE':
                return {
                    icon: 'zi-warning',
                    color: 'text-orange-600',
                    bg: 'bg-orange-100',
                }
            default:
                return {
                    icon: 'zi-info-circle',
                    color: 'text-teal-600',
                    bg: 'bg-teal-100',
                }
        }
    }

    const handleOpenDetail = async (id) => {
        setLoadingDetail(true)
        setDetailModalVisible(true)
        try {
            const res = await getGuidelineDetail(id)
            if (res.success) setActiveGuideline(res.data)
        } catch (error) {
            console.error('Lỗi tải chi tiết', error)
            setDetailModalVisible(false)
        } finally {
            setLoadingDetail(false)
        }
    }

    return (
        <Page className="bg-gray-50 pb-10 relative">
            <Header title="Cẩm nang ứng phó" showBackIcon={true} />

            {/* THÊM pt-20 ĐỂ ĐẨY NỘI DUNG XUỐNG */}
            <Box p={4} className="pt-20">
                <Text
                    bold
                    className="mb-4 text-red-800 text-[15px] uppercase tracking-wide border-l-4 border-red-700 pl-2"
                >
                    Kiến thức sinh tồn
                </Text>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Spinner visible />
                    </div>
                ) : guidelines.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">
                        Chưa có bài viết nào.
                    </Text>
                ) : (
                    <div className="grid gap-3">
                        {guidelines.map((item) => {
                            const theme = getCategoryIcon(item.category)
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleOpenDetail(item.id)}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center active:bg-gray-100 transition-all cursor-pointer"
                                >
                                    <div
                                        className={`${theme.bg} p-4 rounded-xl mr-4 shadow-inner`}
                                    >
                                        <Icon
                                            icon={theme.icon}
                                            className={theme.color}
                                            size={28}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Text
                                            bold
                                            className="text-gray-800 text-[15px] mb-1 leading-tight"
                                        >
                                            {item.title}
                                        </Text>
                                        <Text
                                            size="xSmall"
                                            className="text-gray-500 line-clamp-2"
                                        >
                                            {item.shortDescription}
                                        </Text>
                                    </div>
                                    <div className="ml-2 opacity-40">
                                        <Icon icon="zi-chevron-right" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </Box>

            <Modal
                visible={detailModalVisible}
                title={
                    !loadingDetail && activeGuideline
                        ? 'HƯỚNG DẪN CHI TIẾT'
                        : 'Đang tải...'
                }
                onClose={() => {
                    setDetailModalVisible(false)
                    setActiveGuideline(null)
                }}
            >
                <div className="max-h-[60vh] overflow-y-auto">
                    {loadingDetail ? (
                        <div className="flex justify-center py-8">
                            <Spinner visible />
                        </div>
                    ) : activeGuideline ? (
                        <div className="flex flex-col">
                            <Text
                                bold
                                size="large"
                                className="text-red-800 mb-3 border-b pb-2"
                            >
                                {activeGuideline.title}
                            </Text>
                            <div
                                className="text-[15px] text-gray-700 space-y-3 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: activeGuideline.contentHtml,
                                }}
                            />
                        </div>
                    ) : (
                        <Text className="text-red-500">
                            Nội dung không khả dụng.
                        </Text>
                    )}
                </div>
                <Box mt={4}>
                    <Button
                        fullWidth
                        onClick={() => {
                            setDetailModalVisible(false)
                            setActiveGuideline(null)
                        }}
                    >
                        Đóng
                    </Button>
                </Box>
            </Modal>
        </Page>
    )
}

export default Guidelines
