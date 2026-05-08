import { getSystemInfo } from 'zmp-sdk'
import {
    AnimationRoutes,
    App,
    Route,
    SnackbarProvider,
    ZMPRouter,
} from 'zmp-ui'

import DamageMap from '../pages/DamageMaps/damage-map'
import CreateDamageReport from '../pages/DamageReports/create-damage-report'
import DamageReportDetail from '../pages/DamageReports/damage-report-detail'
import MyDamageReports from '../pages/DamageReports/my-damage-reports'
import EmergencyPage from '../pages/Emergency'
import EmergencyDetailPage from '../pages/Emergency/detail'
import Guidelines from '../pages/Guidelines/guidelines'
import HomePage from '../pages/index'
import NewsPage from '../pages/News/news'
import CreateReportPage from '../pages/Reports/create-report'
import MyReportsPage from '../pages/Reports/my-reports'
import ReportDetailsPage from '../pages/Reports/report-details'
import SurveyDetailPage from '../pages/Surveys/survey-detail'
import SurveysPage from '../pages/Surveys/surveys'

const Layout = () => {
    return (
        <App theme={getSystemInfo().zaloTheme}>
            <SnackbarProvider>
                <ZMPRouter>
                    <AnimationRoutes>
                        <Route path="/" element={<HomePage />}></Route>
                        <Route
                            path="/create-report"
                            element={<CreateReportPage />}
                        ></Route>
                        <Route
                            path="/my-reports"
                            element={<MyReportsPage />}
                        ></Route>
                        <Route
                            path="/report-details/:id"
                            element={<ReportDetailsPage />}
                        />
                        <Route path="/surveys" element={<SurveysPage />} />
                        <Route
                            path="/survey-detail/:id"
                            element={<SurveyDetailPage />}
                        />
                        <Route path="/news" element={<NewsPage />} />
                        <Route
                            path="/create-damage-report"
                            element={<CreateDamageReport />}
                        />
                        <Route
                            path="/my-damage-reports"
                            element={<MyDamageReports />}
                        />
                        <Route path="/damage-map" element={<DamageMap />} />
                        <Route path="/guidelines" element={<Guidelines />} />
                        <Route
                            path="/damage-reports/:id"
                            element={<DamageReportDetail />}
                        />
                        <Route path="/emergency" element={<EmergencyPage />} />
                        <Route
                            path="/emergency/:id"
                            element={<EmergencyDetailPage />}
                        />
                    </AnimationRoutes>
                </ZMPRouter>
            </SnackbarProvider>
        </App>
    )
}
export default Layout
