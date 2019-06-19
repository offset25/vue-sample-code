<template>
    <div class="row">
        <div class="col-md-12">
            <div class="row">
                <div class="col-md-3">
                    <div class="form-group">
                        <label>Color scheme</label>
                        <v-select :options="colorSchemeList" @input="filterByColor" name="color_scheme"
                                  id="color_scheme" placeholder="Color scheme filter"></v-select>
                    </div>
                </div>
                <div class="col-md-9">
                    <calendar-filters
                        filter-title="Shifts"
                        mode="scheduler"
                        @filter-shifts="filterShifts"></calendar-filters>
                </div>
            </div>
            <div class="row mt-2">
                <div class="">
                    <employees @sidebar-updated="updateShifts" ref="empSidebar"
                               @close-side-bar="handleSidebar"></employees>
                </div>
                <div class="col-md-12">
                    <notify-button @notifications-posted="resetModalSwitch"></notify-button>
                    <div id="calendar"></div>
                    <shift-modal
                        :shiftData="shiftData"
                        mode="update"
                        v-if="showModal"
                        @copiedShift="handleCopyShift"
                        @shiftUpdated="resetModalSwitch"
                        @assignNewEmployee="assignNewEmployee"
                        @shiftDeleted="handleDeleteShift"></shift-modal>

                    <create-shift-without-employee id="create-new" v-if="showCreateShiftModal"
                                                   :shiftData="shiftData" @shiftCreated="handleShiftCreation"></create-shift-without-employee>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import NotifyButton from '../Misc/UI-Components/NotifySchedule/NotifiySchedule';
    import ShiftModal from './ShiftModal';
    import CreateShiftWithoutEmployee from './CreateShiftWithoutEmployee';
    import Employees from './EmployeesSidebar';
    import vSelect from 'vue-select';
    import CalendarFilters from './Filters';
    import fullCalendar from '../../../../../node_modules/fullcalendar';
    import randomColor from '../../../../../node_modules/randomcolor';
    import ShedularMixin from '../../mixins/calendar';
    import Toasted from 'vue-toasted';
    Vue.use(Toasted);
    export default {
        name: "ManagerCalendar",
        components: {Employees, vSelect, ShiftModal, CalendarFilters, CreateShiftWithoutEmployee, NotifyButton},
        mixins: [ShedularMixin],
        data() {
            return {
                colorSchemeList: [
                    {label: 'By employee', value: 'Employee-id'},
                    {label: 'By department', value: 'Dept-id'},
                    {label: 'By job tag', value: 'Job-tag'},
                ],
                shiftData: {},
                tempEventId: '',
                showModal: false,
                showCreateShiftModal: false,
                filterEmpFlag: false,
                fetchShifts: false,
                sideBarEmployees: '',
                shiftFilters: {
                    id: [],
                    department_id: [],
                    job_tag_id: [],
                    location_id: []
                }
            }
        },
        methods: {
            resetShiftFilters() {
                this.shiftFilters = {
                    id: [],
                    department_id: [],
                    job_tag_id: [],
                    location_id: []
                }
            },
            updateShifts() {
                this.fetchShifts = true;
                this.resetModalSwitch();
            },
            handleCopyShift(shiftId) {
                let self = this;
                self.resetModalSwitch();
                setTimeout(function () {
                    self.shiftData = self.$store.getters.filterShiftData(shiftId);
                }, 3000);
            },
            handleShiftCreation() {
                this.resetModalSwitch();
                setTimeout(function () {
                    $('#create-new-shift-modal').modal('hide');
                    //on hiding modal, turn off modal flag.
                    $('#create-new-shift-modal').on('hidden.bs.modal', function (e) {
                        // do something...
                        this.showCreateShiftModal = false;
                    });
                }, 1000);
            },
            handleDeleteShift(shiftId) {
                let self = this;
                self.resetModalSwitch();
                setTimeout(function () {
                    $('#update-shift-modal').modal('hide');
                    //on hiding modal, turn off modal flag.
                    $('#update-shift-modal').on('hidden.bs.modal', function (e) {
                        // do something...
                        self.showModal = false;
                    });
                }, 1000);
            },
            filterByColor(data) {
                if (data) {
                    let q = data.value.toLowerCase();
                    let datasetParam = data.value.replace(/-([a-z])/g, function (g) {
                        return g[1].toUpperCase();
                    });
                    let shifts = document.querySelectorAll('[data-shift-' + q + ']');
                    let colorFilterObj = [];
                    let sidebarEmployees = [];
                    let employeeShifts = [];
                    for (let i = 0; i < (shifts.length); i++) {
                        colorFilterObj.push({
                            id: shifts[i].dataset['shift' + datasetParam],
                            color: randomColor({
                                luminosity: 'dark',
                                //format: 'rgba' // e.g. 'rgba(9, 1, 107, 0.6482447960879654)'
                            })
                        });
                    }
                    //remove duplciates.
                    colorFilterObj = this.removeDuplicates(colorFilterObj, 'id');
                    colorFilterObj.forEach(function (colorObj) {
                        sidebarEmployees = document.querySelectorAll("[data-" + q + "='" + colorObj.id + "']");
                        sidebarEmployees.forEach(function (employee) {
                            employee.style.background = colorObj.color;
                            employee.style.borderColor = colorObj.color;
                        });
                        employeeShifts = document.querySelectorAll("[data-shift-" + q + "='" + colorObj.id + "']");
                        employeeShifts.forEach(function (shift) {
                            shift.parentNode.parentNode.style.background = colorObj.color;
                            shift.parentNode.parentNode.style.borderColor = colorObj.color;
                        });
                    });
                }
            },
            removeDuplicates(myArr, prop) {
                return myArr.filter((obj, pos, arr) => {
                    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
                });
            },
            resetModalSwitch() {
                $('#calendar').fullCalendar('removeEvents');
                $('#calendar').fullCalendar('refetchEvents');
            },
            setSidebarStyle(width, style) {
                document.getElementById("mySidebar").style.width = width;
                document.getElementById("closeEmpSidebar").style.display = style;
            },
            handleSidebar() {
                let elem = document.getElementsByClassName("fc-showEmployees-button")[0];
                if (!elem) {
                    elem = document.getElementsByClassName("show-sidebar")[0];
                }
                let classList = elem.className.split(' ');
                if (classList.indexOf('show-sidebar') == -1) {
                    elem.classList.add('show-sidebar');
                    elem.classList.remove('fc-showEmployees-button');
                    elem.innerHTML = 'Hide employees';
                    this.setSidebarStyle('250px', 'block');
                } else {
                    elem.classList.remove('show-sidebar');
                    elem.classList.add('fc-showEmployees-button');
                    elem.innerHTML = 'Show employees';
                    this.setSidebarStyle('0', 'NONE');
                }
            },
            filterShifts(params) {
                this.resetShiftFilters();
                if(Object.keys(params).length) {
                    this.shiftFilters = Object.assign(this.shiftFilters, params);
                    this.filterObject(this.shiftFilters);
                }
                this.resetModalSwitch();
            },
            getEmployeeBGColor(employeeId) {
                let employee = document.querySelector("[data-employee-id='" + employeeId + "']");
                if (employee) {
                    return employee.dataset.bgcolor;
                }
            },
            getEmployeeColor(employeeId) {
                let employee = document.querySelector("[data-employee-id='" + employeeId + "']");
                if (employee) {
                    return employee.dataset.color;
                }
            },
            assignNewEmployee(employee) {
                this.shiftData.user = employee;
                this.shiftData.user_id = employee.id;
                this.shiftData.empDepartment = employee.departmentName;
                this.shiftData.assign_user = true;
            }
        },
        mounted() {
            let self = this;
            this.setSidebarStyle('0', 'NONE');
            // External events
            // ------------------------------
            let calendar = $('#calendar').fullCalendar({
                columnHeaderHtml: function(mom) { //console.info(mom.format('DD'));
                    let indicatorId = 'indicator-' + mom.format('DD');
                    return mom.format('ddd M/DD') + " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
                        "<i class='now-ui-icons travel_info text-white bg-success rounded-circle hidden' id='" + indicatorId + "'></i>";
                },
                editable: true,
                firstDay: self.$store.state.companySettingsData.workweek_starts_on,
                timeFormat: 'hh:mm A',
                customButtons: {
                    /*cloneShifts: {
                        text: 'Clone shifts',
                        click: function () {
                            let viewObj = $(calendar).fullCalendar('getView');
                            let startDate = viewObj.start.format();
                            self.copyAllShifts(startDate);
                        }
                    },*/
                    showEmployees: {
                        text: 'Show employees',
                        click: function () {
                            self.handleSidebar(this);
                        }
                    }
                },
                header: {
                    left: 'showEmployees,prev,next,today',
                    center: 'title',
                    right: 'agendaWeek,agendaDay'
                },
                loading : function(){
                    //console.info('loading: ',arguments);
                },
                defaultView: 'agendaWeek',
                events: [],
                locale: 'en',
                unselectAuto: true,
                selectable: true,
                droppable: true, // this allows things to be dropped onto the calendar
                dayClick: function (event, jsEvent) {
                    self.shiftData = Object.assign(self.shiftData, {
                        employeeName: '',
                        empDepartment: '',
                        empTimeZone: '',
                        location_id: '',
                        department_id: '',
                        job_tag_id: '',
                        hourly_rate: null,
                        user: {
                            id: '',
                            time_zone: '-5.0'
                        },
                        shiftDateTime: event.format('MM-DD-YYYY HH:mm:ss')
                    });
                    self.showCreateShiftModal = true;
                    setTimeout(function () {
                        $('#create-new-shift-modal').modal('show');
                        $('#create-new-shift-modal').on('hidden.bs.modal', function (e) {
                            self.showModal = false;
                            self.showCreateShiftModal = false;
                        })
                    }, 500);
                },
                eventClick: function (event, jsEvent, view) {
                    let shiftArr = event.id.split('-');
                    console.info('shiftArray: ', shiftArr);
                    //fetching shift.
                    let filteredShift = self.$store.getters.filterShiftData(shiftArr[0]);
                    let element = jsEvent.target;
                    if(element.classList.contains('send-notification')) {
                        self.disableBtnOnSubmit(element);
                        axios.post('shifts/send-notifications', {id : shiftArr[0], job_tag_id : filteredShift.job_tag_id})
                             .then((response) => {
                                 self.activateButton(element);
                                 let msgType = response.data.status == true ? 'success' : 'error';
                                 self.showMessage(msgType, response.data.msg);
                             })
                             .catch((errors) => {
                                 console.info('errors: ', errors);
                                 self.activateButton(element);
                             });
                    }
                    //if(filteredShift.user){
                    //if(element.classList.contains('fc-bg') ) {
                    else {
                        self.shiftData = filteredShift;
                        self.shiftData.assign_user = filteredShift.user != null ? true : true;
                        self.showModal = true;
                        setTimeout(function () {
                            $('#update-shift-modal').modal('show');
                            $('#update-shift-modal').on('hidden.bs.modal', function (e) {
                                self.showModal = false;
                            })
                        }, 500);
                    }
                },
                drop: function (start, jsEvent, allDay) {
                    /*if (start.isBefore(moment())) {
                     calendar.fullCalendar('removeEvents', self.tempEventId);
                     Vue.toasted.error('Shift on past dates can't be created', {
                     theme: "outline",
                     //icon : 'error_outline',
                     duration: '5000',
                     // you can pass a single action as below
                     action: {
                     text: 'Cancel',
                     onClick: (e, toastObject) => {
                     toastObject.goAway(0);
                     }
                     },
                     // you can pass a multiple actions as an array of actions
                     action: [
                     {
                     text: 'x',
                     onClick: (e, toastObject) => {
                     toastObject.goAway(0);
                     }
                     }
                     ]
                     });
                     return false;
                     } else {*/
                    /*self.shiftModal.employeeId = $(jsEvent.target).data('employee-id');
                     self.shiftModal.jobTag = $(jsEvent.target).data('job-tag');
                     self.shiftModal.startFrom = start.format();
                     let defaultDuration = moment.duration(calendar.fullCalendar('option', 'defaultTimedEventDuration'));
                     self.shiftModal.endTo = start.clone().add(defaultDuration);*/
                    let employeeId = $(jsEvent.target).data('employee-id');
                    let deptId = $(jsEvent.target).data('dept-id');
                    let jobTag = $(jsEvent.target).data('job-tag');
                    let locId = $(jsEvent.target).data('location-id');
                    let startFrom = start.format();
                    let defaultDuration = moment.duration(calendar.fullCalendar('option', 'defaultTimedEventDuration'));
                    let endTo = start.clone().add(defaultDuration);
                    let _postData = {
                        user_id: employeeId,
                        department_id: deptId,
                        job_tag_id: jobTag,
                        location_id: locId,
                        start_time: startFrom,
                        end_time: endTo
                    };
                    axios.post('/shifts/add', _postData).then(function (response) {
                        calendar.fullCalendar('removeEvents', self.tempEventId);
                        calendar.fullCalendar('renderEvent', {
                            id: response.data.data.shiftId + '-' + jobTag,
                            title: $.trim(jsEvent.target.innerHTML),
                            start: startFrom,
                            end: endTo,
                            color: $(jsEvent.target).data('color'),
                            bgcolor: $(jsEvent.target).data('bgcolor'),
                            filters: {
                                jobTagId: jobTag,
                                deptId: deptId,
                                employeeId: employeeId
                            },
                        }, true);
                        self.$store.dispatch('fetchShifts');
                    });
                    //}
                },
                eventResize: function (event, delta, revertFunc) {
                    let shiftArr = event.id.split('-');
                    let filteredShift = self.$store.getters.filterShiftData(shiftArr[0]);
                    let _postData = {
                        user_id: filteredShift.user_id,
                        start_time: event.start.format(),
                        end_time: event.end.format(),
                        department_id: event.filters.deptId,
                        job_tag_id: shiftArr[1],
                        location_id: filteredShift.location_id,
                        attendance: filteredShift.attendance,
                        hourly_rate: filteredShift.hourly_rate
                    };
                    axios.patch('/shifts/' + shiftArr[0], _postData).then(function (response) {
                        //calendar.fullCalendar('refetchEvents');
                    });
                },
                eventDragStart(event, jsEvent, view) {
                    $(document).on('show.bs.popover', function () {
                        $('.popover').remove();
                    })
                },
                eventDrop(event, delta, revertFunc, jsEvent, ui, view) {
                    //console.info('eventDrop called: ', event);
                    let shiftArr = event.id.split('-');
                    let filteredShift = self.$store.getters.filterShiftData(shiftArr[0]);
                    let _postData = {
                        user_id: filteredShift.user_id,
                        start_time: event.start.format(),
                        end_time: event.end.format(),
                        department_id: event.filters.deptId,
                        job_tag_id: shiftArr[1],
                        hourly_rate: filteredShift.hourly_rate,
                        location_id: filteredShift.location_id,
                        attendance: filteredShift.attendance
                    };
                    axios.patch('/shifts/' + shiftArr[0], _postData).then(function (response) {
                        calendar.fullCalendar('removeEvents', shiftArr[0]);
                    });
                },
                events: function (start, end, timezone, callback) {
                    //shifts will be fetched after sidebar is updated with colors.
                    if (self.fetchShifts) {
                        axios.get('/shifts/fetch', {params: self.shiftFilters}).then(function (response) {
                            let events = [];
                            let shifts = response.data.appData;
                            for (let elem in shifts) {
                                /*let secDepts = shifts[elem]['userSecondaryDepartments'];
                                let secLocs = shifts[elem]['userSecondaryLocations'];
                                let secTags = shifts[elem]['userSecondaryJobTags'];
                                let secDepartments = '';
                                for (let d in secDepts) {
                                    secDepartments += secDepts[d].name + ', ';
                                }
                                let secLocations = '';
                                for (let d in secLocs) {
                                    secLocations += secLocs[d].title + ', ';
                                }
                                let secJobTags = '';
                                for (let d in secTags) {
                                    secJobTags += secTags[d].title + ', ';
                                }*/
                                let title = ' <button class="send-notification btn btn-info" data-loading-text=" <i class=\'fa fa-circle-o-notch fa-spin\'></i> "><i class="fa fa-send-o"></i> Post Schedule</button>';
                                if (shifts[elem]['user']) {
                                    title = shifts[elem]['employeeName'];
                                }
                                title += ' <br/>Loc: ' + shifts[elem]['location']['title'] +
                                ' <br/>Dept: ' + shifts[elem]['department']['name'] +
                                ' <br/>Tag: ' + shifts[elem]['job_tag']['title'];
                                events.push({
                                    id: shifts[elem]['id'] + '-' + shifts[elem]['job_tag_id'],
                                    title: title,
                                    textEscape: true,
                                    filters: {
                                        deptId: shifts[elem]['department_id'],
                                        jobTagId: shifts[elem]['job_tag_id'],
                                        locationId: shifts[elem]['location_id'],
                                        employeeId: shifts[elem]['user_id'],
                                        attendance: shifts[elem]['attendance'],
                                        isNotified : shifts[elem]['is_notified'],
                                    },
                                    start: shifts[elem]['start_time'],
                                    end: shifts[elem]['end_time'],
                                });
                            }
                            //saving shifts in listing to filter.
                            self.$store.commit('setShifts', shifts);
                            //self.shiftData = shifts;
                            callback(events);
                        });
                    }
                },
                eventDataTransform: function (eventData) {
                    return eventData;
                },
                eventRender: function (event, element, view) {
                    //console.info('event: ', event, moment(event.end).format('DD'));
                    element.find(".fc-title").attr("data-temp-id", event._id);
                    element.find('.fc-title').html(event.title);
                    let shiftDay = moment(event.end).format('DD');
                    if (event.filters) {
                        if(event.filters.isNotified != 0 && event.filters.isNotified !== undefined) {
                            $('#indicator-' + shiftDay).removeClass('hidden');
                            $($('#indicator-' + shiftDay)).popover({
                                title: 'Shifts Indicator',
                                content: 'Shifts in this date are indicated to employees.',
                                trigger: 'hover',
                                placement: 'top',
                                container: 'body',
                                html: true
                            });
                        }
                        element.find(".fc-title").attr("data-shift-employee-id", event.filters.employeeId);
                        element.find(".fc-title").attr("data-shift-job-tag", event.filters.jobTagId);
                        element.find(".fc-title").attr("data-shift-dept-id", event.filters.deptId);
                        element.find(".fc-title").attr("data-shift-location-id", event.filters.locationId);
                        element.find(".fc-title").attr("data-shift-attendance", event.filters.attendance);
                        //setting up sidebar's employee backround color to the shift.
                        element.css('background-color', self.getEmployeeBGColor(event.filters.employeeId));
                        element.css('color', self.getEmployeeColor(event.filters.employeeId));
                    }
                    self.tempEventId = event._id;
                }
            });
        }
    }
</script>

<style scoped>
</style>
