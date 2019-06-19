<template>
    <div class="row">
        <div class="col-md-12">
            <report-component
                reportId="hours-wadges-summary-report"
                :reportTitle="reportTitle"
                :columns="columns"
                :listingData="listingData"
                :options="options"
                showArrows="true"
                showTitle="true"
                :has-child-rows=false
                :reportFilters="reportFilters"
                :exportOptions="exportOptions"
                @updateReport="updateReport"></report-component>
        </div>
    </div>
</template>

<script>
    import ReportComponent from '../Misc/Report';
    import WeekTitle from './WeekTitle';
    import DepartmentSummary from './DepartmentSummary';
    import moment from 'moment';
    import {EventBus} from "../../services/event-bus";
    import AppMixin from '../../mixins/app-mixin';
    export default {
        name: "HoursAndWages",
        components: {ReportComponent, WeekTitle, DepartmentSummary},
        mixins : [AppMixin],
        data() {
            return {
                showArrows: true,
                filterEmpFlag : false,
                reportFilters: [],
                columns: [
                    'location',
                    'dept_name',
                    'shift',
                    'avg_pay_rate',
                    'budget_hours_total',
                    'budget_cost_total'
                ],
                options: {
                    headings: {
                        budget_hours_total: 'Budget hours total'
                    },
                    templates: {
                        dept_name: DepartmentSummary
                    },
                    childRows : false
                }
            }
        },
        computed: {
            exportOptions() {
                return {
                    url: '/reports/export/hours-wadges-summary',
                    format: 'xlsx',
                    fileName: 'report-hours-and-wadges',
                    filters: {
                        start_time: this.$store.state.report.dateStart,
                        end_time: this.$store.state.report.dateEnd
                    }
                }
            },
            reportTitle() {
                return 'Report for current week -' + this.$store.state.report.dateStart + ' / ' + this.$store.state.report.dateEnd
            },
            listingData: {
                get() {
                    let _employees = '';
                    if (this.filterEmpFlag) {
                        _employees = this.$store.state.report.filteredHoursWadgesSummary;
                    } else {
                        _employees = this.$store.state.report.hoursWadgesSummary;
                    }
                    return _employees;
                },
                set(employeesList) {
                    return employeesList;
                }
            }
        },
        methods: {
            updateReport(params) {
                this.filterEmpFlag = params.updateReport;
            }
        },
        created() {
            let self = this;
            let dateStart = moment().startOf('weeks').format('MM-DD-YYYY');
            let dateEnd = moment().endOf('weeks').format('MM-DD-YYYY');
            self.$store.dispatch('mutateReportDates', {dateStart: dateStart, dateEnd: dateEnd});
            self.$store.dispatch('getHoursAndWadgesSummary');
            let selectedFilters = {};
            EventBus.$on('filterList', function(params){ console.info('params: ', params);
                selectedFilters = Object.assign(selectedFilters, params);
                self.filterObject(selectedFilters);
                if(self.isNotEmpty(selectedFilters)) { console.info('IF');
                    let filteredData = self.$store.getters.filterWagesDataByEmployeeId(selectedFilters);
                    //setTimeout(function () {
                        self.$store.state.report.filteredHoursWadgesSummary = filteredData;
                        self.filterEmpFlag = true;
                    //}, 500);
                } else { console.info('ELSE');
                    self.filterEmpFlag = false;
                }
            })
        },
    }
</script>

<style scoped>
    .form-group.form-inline.pull-right.VueTables__limit {
        width: 20%;
    }
</style>
