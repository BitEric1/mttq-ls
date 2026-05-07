import L from 'leaflet'
import { useEffect, useState } from 'react'
import {
    CircleMarker,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet'
import { getLocation } from 'zmp-sdk/apis'
import { Box, Header, Page, Spinner, Text, useSnackbar } from 'zmp-ui'
import { getActiveSupports, getGeoDamageMap } from '../../services/damageApi'

import 'leaflet/dist/leaflet.css'

// Component tự động focus bản đồ
const MapFocus = ({ center }) => {
    const map = useMap()
    useEffect(() => {
        if (
            center &&
            typeof center[0] === 'number' &&
            typeof center[1] === 'number'
        ) {
            map.flyTo(center, 13)
        }
    }, [center, map])
    return null
}

const DamageMap = () => {
    const snackbar = useSnackbar()
    const [userLocation, setUserLocation] = useState([21.8485, 106.7578])
    const [damagePoints, setDamagePoints] = useState([])
    const [supportPoints, setSupportPoints] = useState([]) // THÊM STATE ĐIỂM HỖ TRỢ
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Lấy vị trí người dùng
                try {
                    const location = await getLocation({})
                    if (location && location.latitude && location.longitude) {
                        setUserLocation([location.latitude, location.longitude])
                    }
                } catch (geoError) {
                    snackbar.openSnackbar({
                        type: 'warning',
                        text: 'Chưa lấy được GPS. Đang dùng vị trí mặc định (Lạng Sơn).',
                    })
                }

                // 2. Tải SONG SONG cả dữ liệu Thiệt hại và Điểm hỗ trợ (Chuẩn hiệu năng Production)
                const [mapRes, supportRes] = await Promise.allSettled([
                    getGeoDamageMap(),
                    getActiveSupports(),
                ])

                // Xử lý dữ liệu Thiệt hại
                if (mapRes.status === 'fulfilled' && mapRes.value.success) {
                    setDamagePoints(mapRes.value.data)
                }

                // Xử lý dữ liệu Điểm hỗ trợ
                if (
                    supportRes.status === 'fulfilled' &&
                    supportRes.value.success
                ) {
                    setSupportPoints(supportRes.value.data)
                }
            } catch (error) {
                snackbar.openSnackbar({
                    type: 'error',
                    text: 'Lỗi tải dữ liệu bản đồ!',
                })
            } finally {
                setLoading(false)
            }
        }

        initData()
    }, [])

    // Helper: Style cho điểm thiệt hại
    const getDamageStyle = (severity) => {
        switch (severity) {
            case 'HIGH':
            case 'Heavy':
            case 3:
                return { color: '#dc2626', fillColor: '#ef4444', text: 'Nặng' }
            case 'MEDIUM':
            case 'Medium':
            case 2:
                return {
                    color: '#ea580c',
                    fillColor: '#f97316',
                    text: 'Trung bình',
                }
            case 'LOW':
            case 'Light':
            case 1:
                return { color: '#16a34a', fillColor: '#22c55e', text: 'Nhẹ' }
            default:
                return {
                    color: '#4b5563',
                    fillColor: '#6b7280',
                    text: 'Không rõ',
                }
        }
    }

    // Helper: Tạo Icon nổi bật cho Điểm hỗ trợ (Dùng HTML thay vì ảnh tĩnh để không bao giờ bị lỗi 404)
    const getSupportIcon = (type) => {
        let emoji = '🆘'
        let bgColor = 'bg-blue-600'
        let label = 'Hỗ trợ'

        switch (type) {
            case 'MEDICAL':
            case 1:
                emoji = '🏥'
                bgColor = 'bg-green-600'
                label = 'Y Tế'
                break
            case 'RELIEF':
            case 2:
                emoji = '📦'
                bgColor = 'bg-blue-500'
                label = 'Cứu trợ'
                break
            case 'EVACUATION':
            case 3:
                emoji = '🛡️'
                bgColor = 'bg-indigo-600'
                label = 'Sơ tán'
                break
        }

        const htmlContent = `
            <div class="${bgColor} text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg text-lg">
                ${emoji}
            </div>
        `

        return {
            icon: L.divIcon({
                html: htmlContent,
                className: 'custom-support-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 16], // Canh giữa tâm
            }),
            label,
        }
    }

    return (
        <Page className="bg-white flex flex-col h-screen overflow-hidden">
            <Header title="Bản đồ Thiệt hại & Cứu trợ" showBackIcon={true} />

            <div className="flex-1 relative">
                {loading && (
                    <div className="absolute inset-0 z-[1000] bg-white/80 flex flex-col items-center justify-center">
                        <Spinner visible />
                        <Text className="mt-2 font-medium text-gray-600">
                            Đang đồng bộ dữ liệu...
                        </Text>
                    </div>
                )}

                <Box className="w-full h-full">
                    <MapContainer
                        center={userLocation}
                        zoom={13}
                        style={{ height: '100%', width: '100%', zIndex: 1 }}
                        zoomControl={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <MapFocus center={userLocation} />

                        {/* Điểm định vị của người dùng */}
                        <CircleMarker
                            center={userLocation}
                            radius={8}
                            pathOptions={{
                                color: '#2563eb',
                                fillColor: '#3b82f6',
                                fillOpacity: 1,
                            }}
                        >
                            <Popup>Vị trí của bạn</Popup>
                        </CircleMarker>

                        {/* 1. RENDER ĐIỂM THIỆT HẠI (Vòng tròn) */}
                        {damagePoints
                            .filter(
                                (p) =>
                                    typeof p.latitude === 'number' &&
                                    typeof p.longitude === 'number',
                            )
                            .map((point) => {
                                const style = getDamageStyle(point.severity)
                                return (
                                    <CircleMarker
                                        key={`damage-${point.id}`}
                                        center={[
                                            point.latitude,
                                            point.longitude,
                                        ]}
                                        radius={12}
                                        pathOptions={{
                                            color: style.color,
                                            fillColor: style.fillColor,
                                            fillOpacity: 0.6,
                                            weight: 2,
                                        }}
                                    >
                                        <Popup className="rounded-lg">
                                            <div className="text-center font-sans">
                                                <div className="font-bold text-gray-800 text-sm mb-1">
                                                    {point.damageType}
                                                </div>
                                                <div
                                                    className="text-xs"
                                                    style={{
                                                        color: style.color,
                                                    }}
                                                >
                                                    Mức độ: <b>{style.text}</b>
                                                </div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                )
                            })}

                        {/* 2. RENDER ĐIỂM HỖ TRỢ CỦA CHÍNH QUYỀN (Icon Nổi bật) */}
                        {supportPoints
                            .filter(
                                (p) =>
                                    typeof p.latitude === 'number' &&
                                    typeof p.longitude === 'number',
                            )
                            .map((point) => {
                                const iconConfig = getSupportIcon(point.type)
                                return (
                                    <Marker
                                        key={`support-${point.id}`}
                                        position={[
                                            point.latitude,
                                            point.longitude,
                                        ]}
                                        icon={iconConfig.icon}
                                    >
                                        <Popup>
                                            <div className="font-sans">
                                                <div className="font-bold text-blue-700 text-sm mb-1 uppercase">
                                                    {point.name}
                                                </div>
                                                <div className="text-xs text-gray-600 mb-1">
                                                    <b>Loại:</b>{' '}
                                                    {iconConfig.label}
                                                </div>
                                                <div className="text-xs text-gray-600 mb-1">
                                                    <b>Sức chứa:</b>{' '}
                                                    {point.capacity} người
                                                </div>
                                                <div className="text-xs text-gray-600 mb-1">
                                                    <b>SĐT:</b>{' '}
                                                    <a
                                                        href={`tel:${point.contactPhone}`}
                                                        className="text-blue-500 font-bold"
                                                    >
                                                        {point.contactPhone}
                                                    </a>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2 border-t pt-1">
                                                    {point.address}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            })}
                    </MapContainer>
                </Box>
            </div>

            {/* Chú giải bản đồ MỚI */}
            <div className="absolute bottom-4 left-2 right-2 z-[1000] bg-white/95 p-2 rounded-xl shadow-lg border border-gray-100 flex flex-wrap justify-between text-[11px]">
                <div className="flex items-center mx-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1 border border-red-700"></div>{' '}
                    Nặng
                </div>
                <div className="flex items-center mx-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-1 border border-orange-700"></div>{' '}
                    TB
                </div>
                <div className="flex items-center mx-1">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1 border border-green-700"></div>{' '}
                    Nhẹ
                </div>
                <div className="flex items-center mx-1 font-bold text-green-700">
                    🏥 Y tế
                </div>
                <div className="flex items-center mx-1 font-bold text-blue-700">
                    📦 Cứu trợ
                </div>
            </div>
        </Page>
    )
}

export default DamageMap
