<template>
    <div class="row">
        <div class="col-md-12">
            <router-link to="/departments/create" class="btn btn-info">Add</router-link>
        </div>
        <div class="col-md-12">
            <div id="people">
                <v-client-table :data="this.departments" :columns="columns" :options="options">
                    <div slot="actions" slot-scope="props" class="datatable-actions">
                        <router-link :to="{ name : 'editDepartment' , params:{departmentId : props.row.id} }">
                            <i class="fa fa-pencil-square-o btn btn-sm btn-warning" title="Edit"></i>
                        </router-link>
                        <a href="#" @click.prevent="erase(props.row.id)">
                            <i class="fa fa-trash  btn btn-sm btn-danger" title="Delete"></i>
                        </a>
                    </div>
                </v-client-table>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ListingComponent",
        data() {
            return {
                columns: ['srNo', 'name', 'description', 'actions'],
                options: {
                    sortable : [
                        'srNo',
                        'name',
                        'description'
                    ],
                    // see the options API
                    sortIcon: {
                        base: 'fa fas',
                        is: 'fa-sort',
                        up: 'fa-sort-alpha-asc',
                        down: 'fa-sort-alpha-desc'
                    }
                }
            }
        },
        methods: {
            erase(deptId) {
                //displaying sweet alert before deleting location.
                swal({
                    title: 'Are you sure?',
                    text: "You won't be able to undo this!",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                      axios.delete('/departments/' + deptId).then(response => {
                          this.$emit('data-added', {msg: 'Department deleted successfully!', class: 'alert-success'});
                          //fetching Locations Data
                          this.$store.dispatch('fetchDepartments', {query: ''});
                      }).catch(errors => {
                          self.errors.record(errors.response.data.errors);
                      });
                  })
                  .catch(errors => {
                      console.info('error exception: ', errors);
                  });
            }
        },
        computed: {
            departments() {
                let dbDepartments = this.$store.state.departmentsData;
                for (let i = 0; i < dbDepartments.length; i++) {
                    Object.assign(dbDepartments[i], {srNo: i + 1});
                }
                return dbDepartments;
            }
        },
        created() {
            //fetching Locations Data
            this.$store.dispatch('fetchDepartments', {query: ''});
        }
    }
</script>

<style scoped>
</style>
