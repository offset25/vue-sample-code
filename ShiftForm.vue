<template>
    <div class="modal-dialog  modal-lg">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">Update shift</h4>
            </div>

            <!-- Modal Body code -->
            <div class="modal-body">
                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body mt-3">
                                <employee-drop-down
                                        v-if="shiftData.assign_user"
                                        :selected="selected"
                                        @onChange="handleEmployeeChange"
                                        theme="inline"></employee-drop-down>
                                <div class="row mt-2" v-else>
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
                                    <div class="col-md-3"><strong>From:</strong></div>
                                    <div class="col-md-4">
                                        <input type="time" class="form-control" name="time_from" id="time_from"
                                               v-model="empStartFrom" step="1800"/>
                                    </div>
                                </div>
                                <div class="row mt-2">
                                    <div class="col-md-3"><strong>To:</strong></div>
                                    <div class="col-md-4">
                                        <input type="time" class="form-control" name="time_to" id="time_to"
                                               v-model="empEndTo" step="300"/>
                                    </div>
                                </div>
                                <div class="row mt-2">
                                    <div class="col-md-3"><strong>Hourly rate:</strong></div>
                                    <div class="col-md-4">
                                        <span class="font-weight-bold">${{hourly_rate}}/Hour</span>
                                    </div>
                                </div>

                                <div class="row mt-2">
                                    <div class="col-md-3"><strong>Job tag</strong></div>
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
                                <div class="row">
                                    <div class="col-12">
                                        <message-notification
                                                :title="'Job tag - ' + shiftData.jobTag"
                                                v-if="isJobTagDeleted"></message-notification>
                                    </div>
                                </div>

                                <div class="row mt-2">
                                    <div class="col-md-3"><strong>Attendance</strong></div>
                                    <div class="col-md-4">
                                        <select class="form-control" v-model="selectedAttendance">
                                            <option :value="opt.id"
                                                    v-for="opt in attendance">
                                                {{opt.value}}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Footer code -->
            <div class="modal-footer">
                <div class="row" style="width: 100%;">
                    <div class="col-md-12">
                        <div class="row">
                            <div class="col-md-2">
                                <button type="button" @click.prevent="updateShift($event.target)" id="updatebtn"
                                        class="btn btn-info"
                                        data-loading-text="<i class='fa fa-circle-o-notch fa-spin'></i>">
                                    Update
                                </button>
                            </div>

                            <div class="col-md-2">
                                <button type="button" @click.prevent="deleteShift($event.target)"
                                        class="btn btn-danger"
                                        data-loading-text="<i class='fa fa-circle-o-notch fa-spin'></i>">
                                    Delete
                                </button>
                            </div>

                            <div class="col-md-2">
                                <button id="close-modal" type="button" @click="$emit('closeModal')"
                                        class="btn btn-default" data-dismiss="modal">Close
                                </button>
                            </div>

                            <div class="col-md-2">

                            </div>
                            <div class="col-md-2">
                                <button title="" type="button"
                                        class="btn btn-success"
                                        data-loading-text="<i class='fa fa-circle-o-notch fa-spin'></i>"
                                        data-placement='bottom' @click="copyShift($event.target)">Copy Shift
                                    <i class="fa fa-info-circle" data-placement="top"
                                       title="Clicking 'Copy Shift'  button will copy this shift to next week. "
                                       data-toggle="tooltip" data-container="body"></i>
                                </button>
                            </div>

                            <div class="col-md-2">
                                <button title="" type="button"
                                        class="btn btn-warning"
                                        data-placement='bottom'
                                        data-loading-text="<i class='fa fa-circle-o-notch fa-spin'></i>"
                                        @click="copyAllShifts($event.target, shiftData.start_time)">Copy All
                                    Shift
                                    <i class="fa fa-info-circle" data-placement="top"
                                       title="Clicking 'Copy All Shifts' button will copy all shifts to next week. "
                                       data-toggle="tooltip" data-container="body"></i>
                                </button>
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
    import InputMask from "../../../../../node_modules/inputmask";
    import EmployeeDropDown from '../Misc/FormControls/Dropdowns/Select2/Employees';
    import SchedulerMixin from '../../mixins/calendar';
    export default {
        name: "ShiftForm",
        components: {DatePicker, EmployeeDropDown},
        props: ['shiftData'],
        mixins: [SchedulerMixin],
        data() {
            return {
                shiftTag: '',
                shiftDate: '',
                empStartFrom: '',
                empEndTo: '',
                hourly_rate: null,
                deptName: null,
                timePickerOptions: {
                    start: '00:00',
                    step: '00:30',
                    end: '23:30'
                },
                selectedAttendance: 1,
                shiftEmployee: 0,
                attendance: [
                    {id: 1, value: 'Attended'},
                    {id: 2, value: 'No show'},
                    {id: 3, value: 'Sick'},
                ]
            }
        },
        computed: {
            departmentName: {
                get() {
                    return this.deptName = this.shiftData.empDepartment;
                },
                set(department) {
                    return this.deptName = department;
                }
            },
            isJobTagDeleted() {
                return this.shiftData.job_tag.deleted_at !== null && this.shiftData.job_tag.id == this.shiftTag;
            },
            selected() {
                if (this.shiftData.user !== null) {
                    return {label: this.shiftData.employeeName, value: this.shiftData.user_id};
                }
            }
        },
        methods: {
            handleEmployeeChange(params) {
                let self = this;
                this.shiftEmployee = 0;
                if (params.selectedFilter) {
                    this.shiftEmployee = params.selectedFilter.value;
                    let employeeData = self.$store.getters.fetchEmployee(params.selectedFilter.value);
                    this.$emit('assignNewEmployee', employeeData);
                }
            },
            copyShift(targetBtn) {
                let self = this;
                self.disableBtnOnSubmit(targetBtn);
                axios.post('/shifts/copy', {date: self.shiftData.start_time, shiftId: self.shiftData.id})
                     .then(response => {
                         self.$emit('copiedShift', response.data.shiftId);
                         self.activateButton(targetBtn);
                         self.showMessage('success', 'Shift copied to next week successfully!')
                     })
                     .catch(errors => {
                         self.showMessage('danger', 'Unable to copy shift, please try again!')
                         self.activateButton(targetBtn);
                     });
            },
            updateShift(target) {
                let self = this;
                let btn = target;
                let start_time = moment(self.shiftDate + ' ' + self.empStartFrom + ':00').format('YYYY-MM-DD HH:mm:ss');
                let end_time = moment(self.shiftDate + ' ' + self.empEndTo + ':00').format('YYYY-MM-DD HH:mm:ss');
                let data = {
                    'user_id': this.shiftEmployee,
                    'start_time': start_time,
                    'end_time': end_time,
                    'location_id': this.shiftData.location_id,
                    'department_id': this.shiftData.department_id,
                    'job_tag_id': this.shiftTag,
                    'hourly_rate': self.hourly_rate,
                    'attendance': self.selectedAttendance
                };
                self.disableBtnOnSubmit(btn);
                axios.patch('shifts/' + this.shiftData.id, data).then(function (response) {
                    self.showMessage('success', 'Shift updated successfully!', true);
                    self.$emit('shiftUpdated', self.shiftTag);
                    self.activateButton(btn)
                }).catch(errors => {
                    self.activateButton(btn)
                    self.errors.record(errors.response.data.errors);
                });
            },
            deleteShift(target) {
                let self = this;
                let btn = target;
                swal({
                    title: 'Are you sure?',
                    text: "You won't be able to undo this.",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                      self.disableBtnOnSubmit(btn);
                      axios.delete('shifts/' + this.shiftData.id).then(function (response) {
                          self.showMessage('success', 'Shift deleted successfully!', true);
                          //emitting event to hide modal and refresh calendar.
                          self.$emit('shiftUpdated', self.shiftTag);
                          self.$emit('shiftDeleted', self.shiftTag);
                          self.activateButton(btn);
                      }).catch(errors => {
                          self.activateButton(btn);
                          self.showMessage('error', 'Unable to delete shift!', true)
                      });
                  })
                  .catch(errors => {
                      self.activateButton(btn);
                  })
            }
        },
        mounted() {
            $('[data-toggle="tooltip"]').tooltip();
            $('.icon-refresh').tooltip();
            this.shiftTag = this.shiftData.job_tag_id;
            let d = this.shiftData.start_time.split(' ');
            this.shiftDate = d[0];
            this.empStartFrom = moment(this.shiftData.start_time).format('HH:mm');
            this.empEndTo = moment(this.shiftData.end_time).format('HH:mm');
            this.hourly_rate = this.shiftData.hourly_rate;
            this.selectedAttendance = this.shiftData.attendance;
            document.getElementById("time_from").step = "900";
            document.getElementById("time_to").step = "900";
        }
    }
</script>

<style scoped>
    @import "../../../css/app-modal.css";
    #update-shift-modal button {
        min-width: 107px;
    }
</style>
