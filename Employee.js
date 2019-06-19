import axios from "axios";

import requestHandler from '../services/requestHandler';
import mutations from '../mutations/employees';
import store from '../store';
import randomColor from 'randomcolor';

class Employees
{
    constructor(){
        return {
            
            fetchEmployees(store) {
                return axios.get('/api/employees/fetch').then(function (response) {
                    response.data.appData.map(function(elem){
                        let bgColor = randomColor({
                            luminosity: 'dark'
                        });
                        
                        return Object.assign(elem, {
                            bgColor : bgColor,
                            labelColor : ''
                        });
                    });
    
                    store.commit('setEmployees', response.data.appData);
                });
            },
            
            fetchEmployeeByToken(store, params) {
                return axios.get('/api/employees/fetch-by-token/' + params.token)
                            .then((response) => {
                                store.commit('setEmployees', response.data.appData);
                            });
            },
    
            fetchEmployeeSettings(store, params) {
                return axios.get('/api/employees/fetch-settings')
                    .then(response => {
                        store.commit('setSettings', response.data.appData);
                    })
                    .catch(errors => {
                        console.info('errors: ', errors);
                    });
            },
    
            fetchManagers(store) {
                return axios.get('/api/managers/fetch').then(function (response) {
                    store.commit('setManagers', response.data.appData);
                });
            },
    
            fetchManagersList(store, id) {
                let url = '/api/managers/fetch-list';
                if(id) {
                    url += '/exclude/' + id;
                }
                return axios.get(url).then(function (response) {
                    store.commit('setManagers', response.data.appData);
                });
            }
        }
    }
}

export default new Employees();
