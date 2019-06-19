<template>
    <div class="row">
        <div class="col-md-12">

            <div class="card-body">
                <form method="POST" action="/employees" id="form_employee" @keydown="errors.clear($event.target.name)">
                    <div class="row">

                        <div class="col-md-6 pr-1">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" v-model="formData.name" name="name" id="name" class="form-control"
                                       placeholder="Name" value=""  autocomplete="off">
                                <span class="text-danger" v-if="errors.has('name')">{{errors.get('name')}}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Description</label>
                                <input type="text" v-model="formData.description" name="description" id="description"
                                       class="form-control"
                                       placeholder="Description" value="" autocomplete="off">
                                <span class="text-danger">{{errors.get('description')}}</span>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-9">
                            <button type="submit" @click.prevent="submitDepartmentForm($event.target)" class="btn btn-fill btn-lg btn-info" data-loading-text="<i class='fa fa-circle-o-notch fa-spin'></i>" id="btn-submit">
                                {{btnLabel}}
                            </button>
                            <cancel-button to="/departments"></cancel-button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import Errors from '../../Errors.js';
    import CancelButton from '../Misc/CancelButton';
    import AppMixins from '../../mixins/app-mixin';
    //using Vee-Validate for front-end Validation..
    export default {
        name: "CreateLocationComponent",
        components: {CancelButton},
        mixins : [AppMixins],
        data() {
            return {
                formData: {
                    id: '',
                    name: '',
                    description: '',
                },
                errors: new Errors(),
                btnLabel: 'Add'
            }
        },
        methods: {
            submitDepartmentForm(targetBtn) {
                let self = this;
                let btn = $('#btn-submit');
                self.disableBtnOnSubmit(targetBtn);
                if (this.formData.id) {
                    axios.patch('/departments/' + self.formData.id, this.$data.formData).then((response) => {
                        this.$emit('data-added', {msg : 'Department updated successfully!', class : 'alert-success'});
                        this.$router.push('/departments');
                    }).catch(errors => {
                        self.activateButton(targetBtn);
                    });
                } else {
                    axios.post('/departments', this.$data.formData).then((response) => {
                        this.$emit('data-added', {msg : 'Department added successfully!', class : 'alert-success'});
                        this.$router.push('/departments');
                    }).catch(errors => {
                        self.errors.record(errors.response.data.errors);
                        self.activateButton(targetBtn);
                    });
                }
            },
            preFillForm(department) {
                this.formData.id = department.id;
                this.formData.name = department.name;
                this.formData.description = department.description;
                this.btnLabel = 'Update';
            }
        },
        mounted() {
            let self = this;
            if (Object.keys(self.$route.params).length) {
                let department = self.$store.getters.fetchDepartment(self.$route.params.departmentId);
                if(!department) {
                    //fetching Locations Data
                    self.$store.dispatch('fetchDepartments', {query: ''});
                    setTimeout(() => {
                        let department = this.$store.getters.fetchDepartment(self.$route.params.departmentId);
                        self.preFillForm(department);
                    },2000);
                } else {
                    self.preFillForm(department);
                }
            }
        }
    }
</script>

<style scoped>
</style>
