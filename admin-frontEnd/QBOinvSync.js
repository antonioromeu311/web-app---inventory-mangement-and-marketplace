import axios from 'axios';
import { DataStore } from '@aws-amplify/datastore';
import { Products } from 'src/models';
import AdminRoute from 'src/components/AdminRoute';

export default function QBOinvSync() {

    return (
        <AdminRoute>
            <div>


                <button onClick={async () => {
                    const response = await axios.get('/api/getQBOinventory', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            "x-api-key": *******
                        },
                    });
                    //console.log('response:', JSON.stringify(response));
                    const models = await DataStore.query(Products);
                    alert('response data:\n\n' + JSON.stringify(response.statusText));
                }

                }>Get Items</button>

            </div>
        </AdminRoute>
    );



}
