<template>
    <div class="departments-component">
        <div class="row">
            <div class="col-md-12">
                <action-message-component v-if="showMsg" :msg="actionMsg" :actionClass="actionClass" msgType="msgType"></action-message-component>
                <router-view @data-added="handleMessage"></router-view>
            </div>
        </div>

    </div>
</template>

<script>
    import ActionMessageComponent from '../ActionMessageComponent';
    export default {
        name: "Departments",
        components : {ActionMessageComponent},
        data() {
            return {
                showMsg : '',
                actionMsg : '',
                actionClass : ''
            }
        },
        methods: {
            handleMessage(params)
            {
                let self = this;
                self.actionMsg = params.msg;
                self.actionClass = params.class;
                self.showMsg = true;
                setTimeout(function() {
                    self.showMsg = false;
                }, 4000);
            }
        },
        mounted() {
            //setting page Heading.
            this.$store.commit('updatePageHeading', 'Departments Listing');
        }
    }
</script>

<style scoped>
</style>
© 2019 GitHub, Inc.
Terms
Privacy
Security
Status
Help
Contact GitHub
Pricing
API
Training
Blog
About
