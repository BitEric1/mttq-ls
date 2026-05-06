import { getSystemInfo } from 'zmp-sdk'
import {
    AnimationRoutes,
    App,
    Route,
    SnackbarProvider,
    ZMPRouter,
} from 'zmp-ui'

import CreateReportPage from '../pages/create-report'
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
                    </AnimationRoutes>
                </ZMPRouter>
            </SnackbarProvider>
        </App>
    )
}
export default Layout
