import { getSystemInfo } from 'zmp-sdk'
import {
    AnimationRoutes,
    App,
    Route,
    SnackbarProvider,
    ZMPRouter,
} from 'zmp-ui'

import CreateReportPage from '../pages/create-report'
import DamageMap from '../pages/DamageMaps/damage-map'
import CreateDamageReport from '../pages/DamageReports/create-damage-report'
import DamageReportDetail from '../pages/DamageReports/damage-report-detail'
import MyDamageReports from '../pages/DamageReports/my-damage-reports'
import Guidelines from '../pages/Guidelines/guidelines'
import HomePage from '../pages/index'
import MyReportsPage from '../pages/my-reports'
import NewsPage from '../pages/news'
import ReportDetailsPage from '../pages/report-details'
import SurveyDetailPage from '../pages/survey-detail'
import SurveysPage from '../pages/surveys'

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
                    </AnimationRoutes>
                </ZMPRouter>
            </SnackbarProvider>
        </App>
    )
}
export default Layout
