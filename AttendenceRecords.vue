<template>
    <div class="row">
        <div class="col-md-12">
            <report-component
               reportId="attendance-report"
               :columns="columns"
               :listingData="listingData"
               showArrows="true"
               :reportTitle="reportTitle"
               show-title="true"
               :reportFilters="reportFilters"
               :exportOptions="exportOptions"
               @updateReport="updateReport"></report-component>
        </div>
    </div>
</template>

<script>
    import ReportComponent from '../Misc/Report';
    import EmployeeReportComponent from '../Misc/EmployeeReport';
    import {EventBus} from "../../services/event-bus";
    import reportConfig from '../../config/report';
    import moment from 'moment';
    import AppMixin from '../../mixins/app-mixin';
    export default {
        name: "AttendanceRecord",
        mixins : [AppMixin],
        components: {ReportComponent, EmployeeReportComponent},
        data() {
            return {
                reportFilters: [],
                filterEmpFlag: false,
                reportName : ''
            }
        },
        computed: {
            columns() {
                return reportConfig['attendance-report'].roles['employee'].columns.own;
            },
            exportOptions() {
                return {
                    url: '/reports/export/attendance-record',
                    format: 'xlsx',
                    fileName: 'report-attendance-record',
                    filters: {
                        start_time: this.$store.state.report.dateStart,
                        end_time: this.$store.state.report.dateEnd
                    }
                }
            },
            listingData: {
                get() {
                    let _employees = '';
                    if (this.filterEmpFlag) {
                        _employees = this.$store.state.report.filteredAttendanceData;
                    } else {
                        _employees = this.$store.state.report.attendanceData;
                    }
                    return _employees;
                },
                set(employeesList) {
                    return employeesList;
                }
            },
            reportTitle() {
                return 'Report for ' + this.$store.state.report.filterBy.label + ' - ' + this.$store.state.report.dateStart + ' / ' + this.$store.state.report.dateEnd
            },
        },
        methods: {
            updateReport(params) {
                console.info('updating params: ', params);
                //this.filterEmpFlag = params.updateReport;
            }
        },
        created() {
            let self = this;
            let dateStart = moment().startOf('weeks').format('MM-DD-YYYY');
            let dateEnd = moment().endOf('weeks').format('MM-DD-YYYY');
            self.$store.dispatch('mutateReportDates', {dateStart: dateStart, dateEnd: dateEnd});
            self.$store.dispatch('getAttendanceRecord');
            //self.$store.dispatch('getAttendanceRecord');
            let selectedFilters = {};
            EventBus.$on('filterList', function (params) {
                selectedFilters = Object.assign(selectedFilters, params);
                self.filterObject(selectedFilters);
                if (self.isNotEmpty(selectedFilters)) {
                    console.info('params: ', selectedFilters);
                    let filteredData = self.$store.getters.filterAttendanceByEmployeeId(selectedFilters);
                    setTimeout(function () {
                        self.$store.state.report.filteredAttendanceData = filteredData;
                        self.filterEmpFlag = true;
                    }, 500);
                } else {
                    self.filterEmpFlag = false;
                }
            })
        },
        mounted() {
            let self = this;
            setTimeout(function(){
                //let reportName = self.$store.getters.fetchUserRole();
                //console.info('report name: ', reportName.name);
                //self.reportName =  reportName.name + '-report-component';
            }, 500);
            self.reportName = '';
        }
    }
</script>

<style scoped>
</style>
