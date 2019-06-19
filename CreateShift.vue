<template>
    <div :id="id + '-shift-modal'" class="modal fade" role="dialog">
        <div class="modal-dialog  modal-lg">

            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Create shift</h4>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-body">
                                    <div class="row mt-2">
                                        <div class="col-md-3"><strong>Employee name:</strong></div>
                                        <div class="col-md-9">{{shiftData.employeeName}}</div>
                                    </div>
                                    <div class="row mt-2">
                                        <div class="col-md-3"><strong>Department name:</strong></div>
                                        <div class="col-md-9">{{shiftData.empDepartment}}</div>
                                    </div>
                                    <div class="row mt-2">
                                        <div class="col-md-3"><strong>Time zone:</strong></div>
                                        <div class="col-md-9">{{timeZone}}</div>
                                    </div>

                                    <div class="row mt-2">
                                        <div class="col-md-3"><strong>Date:</strong></div>
                                        <div class="col-md-4">
                                            <date-picker class="form-control" input-class="shift-date-picker"
                                                         v-model="shiftDate" lang="en" inputName="shift_date"
                                                         :not-before="dateStartLimit"
                                                         :not-after="dateEndLimit"></date-picker>
                                        </div>
                                    </div>
                                    <time-from @on-key-down="empStartFrom = $event"></time-from>
                                    <time-to @on-key-down="empEndTo = $event"></time-to>
                                    <div class="row mt-2">
                                        <div class="col-md-3"><strong>Hourly rate:</strong></div>
                                        <div class="col-md-9">
                                            <strong>${{hourly_rate}}</strong>
                                        </div>
                                    </div>
                                    <div class="row mt-2">
                                        <div class="col-md-3">Job tag</div>
                                        <div class="col-md-4">
                                            <select class="form-control" v-model="shiftTag">
                                                <option :value="tag.id"
                                                        v-for="tag in empJobTags"
                                                        :selected="shiftData.job_tag_id == tag.id">
                                                    {{tag.title}}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="row" style="width: 100%;">
                        <div class="col-md-12">
                            <div class="row">
                                <div class="col-md-2">
                                    <button type="button" @click.prevent="createShift($event.target)"
                                            class="btn btn-info"
                                            data-loading-text="<i class='fa fa-circle-o-notch fa-spin'></i>">
                                        Add
                                    </button>
                                </div>
                                <div class="col-md-2">
                                    <button type="button" @click="$emit('closeModal')" class="btn btn-default"
                                            data-dismiss="modal">Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import DatePicker from 'vue2-datepicker';
    import SchedulerMixin from '../../mixins/calendar';
    import TimeFrom from './partials/TimeFrom';
    import TimeTo from './partials/TimeTo';
    export default {
        name: "CreateShift",
        components: {DatePicker, TimeFrom, TimeTo},
        props: ['shiftData', 'mode', 'id'],
        mixins: [SchedulerMixin],
        data() {
            return {
                shiftTag: '',
                shiftDate: '',
                empStartFrom: '',
                empEndTo: '',
                hourly_rate: null
            }
        },
        computed: {
            dateStartLimit() {
                return new Date();
            },
            dateEndLimit() {
                let currDate = new Date();
                return currDate.setDate(currDate.getDate() + 6);
            },
        },
        methods: {
            createShift(target) {
                let self = this;
                let shift_date = document.getElementsByName('shift_date')[0].value;
                let start_time = moment(shift_date + ' ' + self.empStartFrom + ':00').format('YYYY-MM-DD HH:mm:ss');
                let end_time = moment(shift_date + ' ' + self.empEndTo + ':00').format('YYYY-MM-DD HH:mm:ss');
                let data = {
                    'user_id': self.shiftData.user.id,
                    'start_time': start_time,
                    'end_time': end_time,
                    'location_id': self.shiftData.location_id,
                    'department_id': self.shiftData.department_id,
                    'job_tag_id': self.shiftTag,
                    'hourly_rate': self.hourly_rate
                };
                self.disableBtnOnSubmit(target);
                axios.post('shifts/add', data)
                     .then(function (response) {
                         self.showMessage('success', 'Shift created successfully!', true);
                         self.$emit('shiftCreated');
                         self.activateButton(target);
                     })
                    .catch(errors => {
                        self.activateButton(target);
                    });
            }
        },
        created() {
            $('[data-toggle="tooltip"]').tooltip();
            let self = this;
            setTimeout(() => {
                self.shiftTag = self.shiftData.job_tag_id;
                self.hourly_rate = self.shiftData.hourly_rate;
            }, 2000);
        }
    }
</script>

<style scoped>
    .modal-header .modal-title {
        margin-top: 0px;
    }
    .modal-header .close {
        padding-top: 0px;
    }
    .modal-content .modal-header {
        padding-top: 12px;
    }
    .modal-body .card {
        margin-bottom: 0px;
    }
</style>
