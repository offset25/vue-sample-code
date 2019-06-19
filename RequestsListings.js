<template>
    <div class="row">
        <div class="col-md-12">
            <div id="people">
                <v-client-table :data="this.requests" :columns="columns" :options="options" ref="empList"></v-client-table>
            </div>
        </div>
    </div>
</template>

<script>
    import AppMixin from '../../mixins/app-mixin';
    export default {
        name: "ListingComponent",
        mixins: [AppMixin],
        data() {
            return {
                columns: [
                    //'srNo',
                    'first_name',
                    'last_name',
                    'email',
                    'role',
                    'request_type'
                ],
                options: {
                    // see the options API
                    headings: {
                        requestType: 'Request Type',
                        current_role: 'Role'
                    },
                    sortable: [
                        //'srNo',
                        'first_name',
                        'last_name',
                        'email',
                        'role',
                        '',
                        '',
                        ''
                    ],
                    sortIcon: {
                        base: 'fa fas',
                        is: 'fa-sort',
                        up: 'fa-sort-alpha-asc',
                        down: 'fa-sort-alpha-desc'
                    }
                },
            }
        },
        computed: {
            requests: {
                get() {
                    let _requests = '';
                    if (this.filterEmpFlag) {
                        _requests = this.$store.state.user.requestsData;
                    } else {
                        _requests = this.$store.state.user.requestsData;
                    }
                    return _requests;
                },
                set(employeesList) {
                    return employeesList;
                }
            }
        },
        methods: {
            getPageData() {
                //fetching Locations Data
                this.$store.dispatch('fetchUserRequests');
            }
        },
        created() {
            this.getPageData();
        },
        mounted() {
        }
    }
</script>

<style scoped>
</style>
