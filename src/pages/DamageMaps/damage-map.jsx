import L from 'leaflet'
import { useEffect, useState, useCallback } from 'react'
import {
    CircleMarker,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
} from 'react-leaflet'

import { getLocation } from 'zmp-sdk/apis'
import {
    Box,
    Header,
    Page,
    Spinner,
    Text,
    useSnackbar,
    Icon,
} from 'zmp-ui'

import {
    getActiveSupports,
    getGeoDamageMap,
} from '../../services/damageApi'

import 'leaflet/dist/leaflet.css'

const DEFAULT_LOCATION = [21.8485, 106.7578]

const DamageMap = () => {
    const snackbar = useSnackbar()

    const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION)
    const [damagePoints, setDamagePoints] = useState([])
    const [supportPoints, setSupportPoints] = useState([])

    const [loading, setLoading] = useState(true)
    const [locating, setLocating] = useState(false)
    const [mapInstance, setMapInstance] = useState(null)

    /**
     * =========================
     * LẤY GPS
     * =========================
     */
    const fetchRealLocation = useCallback(
        async (isManualClick = false) => {
            setLocating(true)

            let success = false
            let newLat = null
            let newLng = null

            try {
                const location = await getLocation({})
                if (location?.latitude && location?.longitude) {
                    newLat = location.latitude
                    newLng = location.longitude
                    success = true
                }
            } catch (error) {
                console.log('Zalo SDK không lấy được GPS, fallback Browser API...')
            }

            if (!success) {
                success = await new Promise((resolve) => {
                    if (!navigator.geolocation) {
                        resolve(false)
                        return
                    }

                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            newLat = position.coords.latitude
                            newLng = position.coords.longitude
                            resolve(true)
                        },
                        () => {
                            resolve(false)
                        },
                        {
                            enableHighAccuracy: false,
                            timeout: 5000,
                            maximumAge: 300000,
                        },
                    )
                })
            }

            setLocating(false)

            if (success && newLat && newLng) {
                const nextLocation = [newLat, newLng]
                setUserLocation(nextLocation)

                if (isManualClick && mapInstance) {
                    mapInstance.flyTo(nextLocation, 14, {
                        animate: true,
                        duration: 1,
                    })

                    snackbar.openSnackbar({
                        type: 'success',
                        text: 'Đã định vị vị trí của bạn.',
                        duration: 2000,
                    })
                }
            } else if (isManualClick) {
                snackbar.openSnackbar({
                    type: 'warning',
                    text: 'Không thể định vị. Kiểm tra quyền GPS!',
                    duration: 3000,
                })
            }

            return success
        },
        [mapInstance, snackbar],
    )

    /**
     * =========================
     * LOAD DATA 
     * =========================
     */
    useEffect(() => {
        const initData = async () => {
            try {
                const [mapRes, supportRes] = await Promise.allSettled([
                    getGeoDamageMap(),
                    getActiveSupports(),
                ])

                if (mapRes.status === 'fulfilled' && mapRes.value?.success) {
                    setDamagePoints(mapRes.value.data || [])
                }

                if (supportRes.status === 'fulfilled' && supportRes.value?.success) {
                    setSupportPoints(supportRes.value.data || [])
                }

                fetchRealLocation(false)
            } catch (error) {
                console.error('Lỗi tải data map:', error)
                snackbar.openSnackbar({
                    type: 'error',
                    text: 'Lỗi tải dữ liệu bản đồ!',
                })
            } finally {
                setLoading(false)
            }
        }

        initData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * =========================
     * STYLE THIỆT HẠI
     * =========================
     */
    const getDamageStyle = (severity) => {
        switch (severity) {
            case 'HIGH':
            case 'Heavy':
            case 3:
                return { color: '#dc2626', fillColor: '#ef4444', text: 'Nặng' }
            case 'MEDIUM':
            case 'Medium':
            case 2:
                return { color: '#ea580c', fillColor: '#f97316', text: 'Trung bình' }
            case 'LOW':
            case 'Light':
            case 1:
                return { color: '#16a34a', fillColor: '#22c55e', text: 'Nhẹ' }
            default:
                return { color: '#4b5563', fillColor: '#6b7280', text: 'Không rõ' }
        }
    }

    /**
     * =========================
     * ICON ĐIỂM HỖ TRỢ
     * =========================
     */
    const getSupportIcon = (type) => {
        let emoji = '🆘'
        let bgColor = 'bg-blue-600'
        let label = 'Hỗ trợ'

        switch (type) {
            case 'MEDICAL':
            case 1:
                emoji = '🏥'
                bgColor = 'bg-green-600'
                label = 'Y tế'
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
                iconAnchor: [16, 16],
            }),
            label,
        }
    }

    return (
        <Page className="bg-white flex flex-col h-screen overflow-hidden">
            <Header title="Bản đồ Thiệt hại & Cứu trợ" showBackIcon={true} />

            <div className="flex-1 relative">
                {/* LOADING OVERLAY */}
                {loading && (
                    <div className="absolute inset-0 z-[1000] bg-white/80 flex flex-col items-center justify-center">
                        <Spinner visible />
                        <Text className="mt-2 font-medium text-gray-600">
                            Đang đồng bộ dữ liệu...
                        </Text>
                    </div>
                )}

                {/* BẢN ĐỒ */}
                <Box className="w-full h-full">
                    <MapContainer
                        center={userLocation}
                        zoom={12}
                        zoomControl={false}
                        style={{ width: '100%', height: '100%', zIndex: 1 }}
                        ref={setMapInstance}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {/* CHẤM XANH ĐỊNH VỊ NGƯỜI DÙNG */}
                        <CircleMarker
                            center={userLocation}
                            radius={8}
                            pathOptions={{
                                color: '#ffffff',
                                fillColor: '#2563eb',
                                fillOpacity: 1,
                                weight: 2,
                            }}
                        >
                            <Popup>Vị trí của bạn</Popup>
                        </CircleMarker>

                        {/* ĐIỂM THIỆT HẠI */}
                        {damagePoints
                            .filter(p => typeof p.latitude === 'number' && typeof p.longitude === 'number')
                            .map((point) => {
                                const style = getDamageStyle(point.severity)
                                return (
                                    <CircleMarker
                                        key={`damage-${point.id}`}
                                        center={[point.latitude, point.longitude]}
                                        radius={12}
                                        pathOptions={{
                                            color: style.color,
                                            fillColor: style.fillColor,
                                            fillOpacity: 0.6,
                                            weight: 2,
                                        }}
                                    >
                                        <Popup>
                                            <div className="text-center font-sans">
                                                <div className="font-bold text-gray-800 text-sm mb-1">
                                                    {point.damageType}
                                                </div>
                                                <div className="text-xs" style={{ color: style.color }}>
                                                    Mức độ: <b>{style.text}</b>
                                                </div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                )
                            })}

                        {/* ĐIỂM HỖ TRỢ */}
                        {supportPoints
                            .filter(p => typeof p.latitude === 'number' && typeof p.longitude === 'number')
                            .map((point) => {
                                const iconConfig = getSupportIcon(point.type)
                                return (
                                    <Marker
                                        key={`support-${point.id}`}
                                        position={[point.latitude, point.longitude]}
                                        icon={iconConfig.icon}
                                    >
                                        <Popup>
                                            <div className="font-sans">
                                                <div className="font-bold text-blue-700 text-sm mb-1 uppercase">
                                                    {point.name}
                                                </div>
                                                <div className="text-xs text-gray-600 mb-1">
                                                    <b>Loại:</b> {iconConfig.label}
                                                </div>
                                                <div className="text-xs text-gray-600 mb-1">
                                                    <b>Sức chứa:</b> {point.capacity} người
                                                </div>
                                                <div className="text-xs text-gray-600 mb-1">
                                                    <b>SĐT:</b>{' '}
                                                    <a href={`tel:${point.contactPhone}`} className="text-blue-500 font-bold">
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

                {/* =======================================
                    BẢNG ĐIỀU KHIỂN & CHÚ GIẢI (FIXED BÊN PHẢI)
                    ======================================= */}
                <div className="absolute right-4 bottom-6 z-[1000] flex flex-col gap-3 items-end">
                    
                    {/* NÚT LẤY LẠI GPS */}
                    <div
                        className="bg-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center border border-gray-200 active:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => fetchRealLocation(true)}
                    >
                        {locating ? (
                            <Spinner size="small" />
                        ) : (
                            <Icon icon="zi-location" className="text-blue-600 text-xl" />
                        )}
                    </div>

                    {/* CHÚ GIẢI (DỌC) */}
                    <div className="bg-white/95 p-3 rounded-xl shadow-lg border border-gray-100 flex flex-col gap-2.5 text-[12px] font-medium text-gray-700 min-w-[110px]">
                        <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-700"></div>
                            Nặng
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-orange-700"></div>
                            Trung bình
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-green-500 border border-green-700"></div>
                            Nhẹ
                        </div>
                        
                        {/* Đường kẻ ngang phân cách */}
                        <div className="h-[1px] bg-gray-200 w-full my-0.5"></div>
                        
                        <div className="flex items-center gap-2 font-bold text-green-700">
                            <span className="text-sm">🏥</span> Y tế
                        </div>
                        <div className="flex items-center gap-2 font-bold text-blue-700">
                            <span className="text-sm">📦</span> Cứu trợ
                        </div>
                    </div>

                </div>
            </div>
        </Page>
    )
}

export default DamageMap